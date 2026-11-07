export async function getCollectionsForUser(userId) {
    const recentlyAdded = await getRecentlyAdded(userId);
    const moreFromArtistsYouLike = await getTracksFromSavedArtists(userId);

    return {
        recentlyAdded,
        moreFromArtistsYouLike,
    }
}

async function getRecentlyAdded(userId) {
    const recentTracks = await getRecentlyPlayedTracks(userId, 50);

    const scoredTracks = recentTracks.map((track) => ({
        track,
        score: scoreTrackForUser(track, tasteProfile),
    }));

    return scoredTracks
        .filter(({ score }) => score > 0)
        .sort((a, b) => score > 0)
        .slice(0, 12)
        .map(({ track }) => track);
}

// function getRecentlyPlayedTracks(userId,)


