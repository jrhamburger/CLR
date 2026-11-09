import { supabase } from "../lib/supabase.js";

const AUDIO_BUCKET = "audio-files";
const COVER_ART_BUCKET = "cover-art";

export async function searchCatalog(query, userId) {
  // These queries are separate so uploaded tracks cannot accidentally
  // be treated as public catalog tracks.
  const [uploadedTracks, cachedCatalogTracks] = await Promise.all([
    searchUserUploads(query, userId),
    searchDatabaseForTracks(query),
  ]);

  let catalogTracks = cachedCatalogTracks;

  // Only use MusicBrainz when the public catalog cache has no match.
  if (catalogTracks.length === 0) {
    const apiTracks = await searchMusicBrainz(query);

    await saveTracksToDatabase(apiTracks);

    catalogTracks = apiTracks;
  }

  const uploadedTracksWithUrls = await Promise.all(
    uploadedTracks.map(addSignedUrlsToUploadedTrack)
  );

  return [...uploadedTracksWithUrls, ...catalogTracks];
}

async function searchMusicBrainz(query) {
  const response = await fetch(
    `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json`,
    {
      headers: {
        "User-agent":
          "AuxShare/1.0.0 (https://github.com/jrhamburger/CLR)"
      }
    }
  );

  if (!response.ok) {
    const responseText = await response.text();

    console.error("MusicBrainz failed:", {
      status: response.status,
      statusText: response.statusText,
      responseText
    });

    throw new Error(
      `MusicBrainz request failed: ${response.status}`
    );
  }

  const data = await response.json();

  return data.recordings.map((recording) => {
    const release = recording.releases?.[0];

    return {
      source: "musicbrainz",
      recordingMbid: recording.id,
      title: recording.title,
      artist:
        recording["artist-credit"]?.[0]?.name ??
        "Unknown artist",
      album: release?.title ?? null,
      genre: recording.genres?.[0]?.name ?? null,
      releaseMbid: release?.id ?? null,
      coverArtUrl: release
        ? `https://coverartarchive.org/release/${release.id}/front-250`
        : null
    };
  });
}

async function searchDatabaseForTracks(query) {
  const { data: tracks, error } = await supabase
    .from("tracks")
    .select(`
      id,
      source,
      title,
      artists,
      album,
      genre,
      external_url,
      cover_art_url,
      recording_mbid,
      release_mbid
    `)
    .eq("source", "musicbrainz")
    .is("owner_id", null)
    .or(`title.ilike.%${query}%,artists.ilike.%${query}%`)
    .limit(20);

  if (error) {
    console.error("Database catalog search failed:", error);
    throw new Error("Could not search the catalog database.");
  }

  return tracks.map((track) => ({
    id: track.id,
    source: track.source,
    recordingMbid: track.recording_mbid,
    title: track.title,
    artist: track.artists,
    album: track.album,
    genre: track.genre,
    coverArtUrl: track.cover_art_url,
    releaseMbid: track.release_mbid
  }));
}

// Search user uploads to populate the search results
async function searchUserUploads(query, userId) {
  const { data: tracks, error } = await supabase
    .from("tracks")
    .select(`
      id,
      source,
      title,
      artists,
      album,
      genre,
      audio_path,
      cover_art_url
    `)
    .eq("source", "upload")
    .eq("owner_id", userId)
    .or(`title.ilike.%${query}%,artists.ilike.%${query}%`)
    .limit(20);

  if (error) {
    console.error("Uploaded-track search failed:", error);
    throw new Error("Could not search uploaded tracks.");
  }

  return tracks;
}

/** TODO: Move addSignedUrlsToUploadedTrack into its own
 * area for modularity.
 */

// Adds a signed url for obtaining coverArtUrl and audioUrl
export async function addSignedUrlsToUploadedTrack(track) {
  const { data: audioData, error: audioError } = await supabase.storage
    .from(AUDIO_BUCKET)
    .createSignedUrl(track.audio_path, 60 * 60);

  if (audioError) {
    console.error(`Could not create audio URL for ${track.id}:`, audioError);
    throw audioError;
  }

  let coverArtUrl = null;

  if (track.cover_art_url) {
    const { data: coverArtData, error: coverArtError } = await supabase.storage
      .from(COVER_ART_BUCKET)
      .createSignedUrl(track.cover_art_url, 60 * 60);

    if (coverArtError) {
      console.error(
        `Could not create cover-art URL for ${track.id}:`,
        coverArtError
      );
    } else {
      coverArtUrl = coverArtData.signedUrl;
    }
  }

  return {
    id: track.id,
    source: track.source,
    recordingMbid: null,
    title: track.title,
    artist: track.artists,
    album: track.album,
    genre: track.genre,
    audioUrl: audioData.signedUrl,
    coverArtUrl,
  };
}

async function saveTracksToDatabase(tracks) {
  const tracksToSave = tracks.map((track) => ({
    title: track.title,
    artists: track.artist,
    album: track.album,
    genre: track.genre,
    cover_art_url: track.coverArtUrl,
    recording_mbid: track.recordingMbid,
    release_mbid: track.releaseMbid,
    source: track.source,
    owner_id: null,
  }));

  console.log(tracksToSave);

  const { error } = await supabase
    .from("tracks")
    .upsert(tracksToSave, {
      onConflict: "recording_mbid"
    });

  if (error) {
    console.error("Could not save catalog tracks:", error);
    throw new Error("Could not save catalog tracks.");
  }
}
