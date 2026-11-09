import { supabase } from "../lib/supabase.js";
import { addSignedUrlsToUploadedTrack } from "./musicCatalogService.js";

export async function getListeningHistory(userId, limit = 50) {
  const { data, error } = await supabase
    .from("listening_hist")
    .select(
      `
      history_id,
      played_at,
      tracks (
        id,
        title,
        artists,
        album,
        genre,
        cover_art_url,
        audio_path,
        source
      )
    `
    )
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(
      `Could not load listening history: ${error.message}`
    );
  }

  return Promise.all(
    (data ?? [])
      .filter((historyItem) => historyItem.tracks)
      .map(async (historyItem) => {
        const playableTrack =
          await addSignedUrlsToUploadedTrack(
            historyItem.tracks
          );

        return {
          ...playableTrack,

          historyId: historyItem.history_id,
          playedAt: historyItem.played_at
        };
      })
  );
}
