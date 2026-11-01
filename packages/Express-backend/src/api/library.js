export async function getUserTracks(accessToken) {
    const response = await fetch("/api/library/tracks", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
        throw new Error(data.error ?? "Could not load your tracks.");
    }

    return data;
}