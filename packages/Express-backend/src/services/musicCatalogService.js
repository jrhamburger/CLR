export async function searchCatalog(query) {
  const response = await fetch(
    `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json`, {
        headers: {
            "User-agent": "AuxShare/1.0.0 (https://github.com/jrhamburger/CLR)",
        },
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

  return data.recordings.map((recording) => ({
    source: "musicbrainz",
    recordingMbid: recording.id,
    title: recording.title,
    artist:
      recording["artist-credit"]?.[0]?.name ?? "Unknown artist",
    releaseMbid: recording.releases?.[0]?.id ?? null
  }));
}
