export async function fetchListeningHistory() {
    const response = await fetch("/api/listening-history", {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Could not fetch listening history.");
    }

    return response.json();
}