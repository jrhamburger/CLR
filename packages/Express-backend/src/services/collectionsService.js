import { getListeningHistory } from "./listeningHistoryService.js";

export async function generateCollections(userId) {
    const listeningHistory = await getListeningHistory(userId, 100);

    const trackScores = calculateTrackScores(listeningHistory);
    const topTracks = getTopTracks(trackScores, 10);

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
    ];
}

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