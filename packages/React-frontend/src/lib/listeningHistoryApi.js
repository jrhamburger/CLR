export async function fetchListeningHistory(userId) {
  const response = await fetch(
    `/api/listening-history/tracks?userId=${encodeURIComponent(userId)}`,
    {
      credentials: "include"
    }
  );

  if (!response.ok) {
    throw new Error("Could not fetch listening history.");
  }

  return response.json();
}
