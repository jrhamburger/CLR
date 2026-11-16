import { getListeningHistory } from "./listeningHistoryService.js";
import { searchCatalog } from "./musicCatalogService.js";

export async function generateCollections(userId) {
    const listeningHistory = await getListeningHistory(userId, 100);

    const trackScores = calculateTrackScores(listeningHistory);
    const topTracks = getTopTracks(trackScores, 10);

    const artistScores = calculateArtistScores(trackScores);
    const artistDeepDiveCollection = createArtistDeepDiveCollection(artistScores);

    const genreScores = calculateGenreScores(trackScores);
    const favoriteGenreCollection = createFavoriteGenreCollection(genreScores);

    const exploreYourSoundCollection = await createExploreYourSoundCollection(
        userId,
        artistScores,
        listeningHistory
    );

    const rediscoveredTracksCollection = createRediscoveredTracksCollection(
        listeningHistory,
        trackScores
    );

    if (topTracks.length === 0) {
        return [];
    }

    return [
        {
            id: "on-repeat",
            title: "On Repeat",
            description: "Your most-played songs lately",
            tracks: topTracks,
        },
        artistDeepDiveCollection,
        favoriteGenreCollection,
        exploreYourSoundCollection,
        rediscoveredTracksCollection,
    ].filter(Boolean);
}

// Calculates track scores by how recently and repeatedly
// they've been played.
function calculateTrackScores(listeningHistory) {
    const scoresByTrackId = new Map();

    for (const track of listeningHistory) {
        const currentScore = scoresByTrackId.get(track.id) ?? {
            track,
            score: 0,
            playCount: 0,
        };

        currentScore.score += getRecencyPoints(track.playedAt);
        currentScore.playCount += 1;

        scoresByTrackId.set(track.id, currentScore);
    }

    return [...scoresByTrackId.values()];
}

function getRecencyPoints(playedAt) {
    const playedDate = new Date(playedAt);
    const ageInDays =
        (Date.now() - playedDate.getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays <= 7) {
        return 3;
    }

    return 1;
}

function getTopTracks(trackScores, amount) {
    return [...trackScores]
        .sort((first, second) => {
            if (second.score !== first.score) {
                return second.score - first.score;
            }

            return second.playCount - first.playCount
        })
        .slice(0, amount)
        .map(({ track }) => track);
}

// Function for calculating artist scores for use in the
// creation of the artist deep dive collection
function calculateArtistScores(trackScores) {
    const scoresByArtist = new Map();

    for (const trackScore of trackScores) {
        const artist = trackScore.track.artist?.trim();

        if (!artist) {
            continue;
        }

        const currentArtistScore = scoresByArtist.get(artist) ?? {
            artist,
            score: 0,
            trackScores: [],
        };

        currentArtistScore.score += trackScore.score;
        currentArtistScore.trackScores.push(trackScore);

        scoresByArtist.set(artist, currentArtistScore);
    }

    return [...scoresByArtist.values()];
}

// Function for creating the collection based on the artist
// that has been most listened to.
function createArtistDeepDiveCollection(artistScores) {

    const topArtist = [...artistScores]
        .filter((artistScore) => artistScore.trackScores.length >= 3)
        .sort((first, second) => second.score - first.score)[0];

    if (!topArtist) {
        return null;
    }

    return {
        id: `artist-deep-dive-${topArtist.artist}`,
        title: `${topArtist.artist} Deep Dive`,
        description: `Your most-played tracks from ${topArtist.artist}`,
        tracks: getTopTracks(topArtist.trackScores, 10),
    };
}

// Function for calculating the genre score for the types of
// genres the listener likes most
function calculateGenreScores(trackScores) {
    const scoresByGenre = new Map();

    for (const trackScore of trackScores) {
        const genre = trackScore.track.genre?.trim();

        if (!genre) {
            continue;
        }

        const currentGenreScore = scoresByGenre.get(genre) ?? {
            genre,
            score: 0,
            trackScores: [],
        };

        currentGenreScore.score += trackScore.score;
        currentGenreScore.trackScores.push(trackScore);

        scoresByGenre.set(genre, currentGenreScore);
    }

    return [...scoresByGenre.values()];
}

function createFavoriteGenreCollection(genreScores) {
    const topGenre = [...genreScores]
        .filter((genreScore) => genreScore.trackScores.length >= 3)
        .sort((first, second) => second.score - first.score)[0];

    if (!topGenre) {
        return null;
    }

    return {
        id: `favorite-genre-${topGenre.genre}`,
        title: `${topGenre.genre} Favorites`,
        description: `Tracks from your most-listened genre`,
        tracks: getTopTracks(topGenre.trackScores, 10),
    };
}

// Function for music discovery
async function createExploreYourSoundCollection(
    userId,
    artistScores,
    listeningHistory
) {
    const seedArtists = [...artistScores]
        .filter((artistScore) => artistScore.trackScores.length >= 2)
        .sort((first, second) => second.score - first.score)
        .slice(0, 2);

    if (seedArtists.length === 0) {
        return null;
    }

    const searchResults = await Promise.all(
        seedArtists.map((artistScore) => 
            searchCatalog(artistScore.artist, userId)
        )
    );

    const playedTrackKeys = new Set(
        listeningHistory.map(getTrackKey)
    );

    const addedTrackKeys = new Set();

    const discoveryTracks = searchResults
        .flat()
        .filter((track) => {
            const trackKey = getTrackKey(track);

            if (
                playedTrackKeys.has(trackKey) ||
                addedTrackKeys.has(trackKey)
            ) {
                return false;
            }

            addedTrackKeys.add(trackKey);
            return true;
        })
        .slice(0, 10);

    if (discoveryTracks.length === 0) {
        return null;
    }

    const artistNames = seedArtists
        .map((artistScore) => artistScore.artist)
        .join(" and ");

    return {
        id: "explore-your-sound",
        title: "Explore Your Sound",
        description: `Recommendations based on you listening to ${artistNames}`,
        tracks: discoveryTracks,
    };
}

function getTrackKey(track) {
    return (
        track.id ??
        track.recordingMbid ??
        `${track.title}-${track.artist}`
    );
}

// Function for identifying and returning tracks that
// haven't been played in a while
function createRediscoveredTracksCollection(
    listeningHistory,
    trackScores
) {
    const now = Date.now();

    const recentCutoff = now - 7 * 24 * 60 * 60 * 1000;
    const oldCutoff = now - 30 * 24 * 60 * 60 * 1000;

    const recentlyPlayedTrackIds = new Set();
    const olderTrackIds = new Set();

    for (const historyItem of listeningHistory) {
        const playedAt = new Date(historyItem.playedAt).getTime();

        if (playedAt >= recentCutoff) {
            recentlyPlayedTrackIds.add(historyItem.id);
        }

        if (playedAt <= oldCutoff) {
            olderTrackIds.add(historyItem.id);
        }
    }

    const rediscoveredTrackScores = trackScores.filter(
        ({ track }) =>
            olderTrackIds.has(track.id) && 
            !recentlyPlayedTrackIds.has(track.id)
    );

    if (rediscoveredTrackScores.length === 0) {
        return null;
    }

    return {
        id: "rediscovered-tracks",
        title: "Rediscovered Tracks",
        description: "Songs you used to enjoy that have fallen out of rotation",
        tracks: getTopTracks(rediscoveredTrackScores, 10),
    };
}