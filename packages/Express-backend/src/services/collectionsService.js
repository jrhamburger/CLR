import { getListeningHistory } from "./listeningHistoryService.js";

export async function generateCollections(userId) {
    const listeningHistory = await getListeningHistory(userId, 100);

    const trackScores = calculateTrackScores(listeningHistory);
    const topTracks = getTopTracks(trackScores, 10);

    const artistDeepDiveCollection = createArtistDeepDiveCollection(trackScores);

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
        genreScores: calculateGenreScores(trackScores),
        artistDeepDiveCollection,
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
    return trackScores
        .sort((first, second) => {
            if (second.score !== first.score) {
                return second.score - first.score;
            }

            return second.playCount - first.playCount
        })
        .slice(0, amount)
        .map(({ track }) => track);
}

// Function for creating the collection based on the artist
// that has been most listened to.
function createArtistDeepDiveCollection(trackScores) {
    const scoresByArtist = new Map();

    for (const trackScore of trackScores) {
        const artist = Array.isArray(trackScore.track.artists)
            ? trackScore.track.artists.join(", ")
            : trackScore.track.artists?.trim();

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

    const topArtist = [...scoresByArtist.values()]
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
        
    }
}