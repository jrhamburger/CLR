import { useState, useEffect } from "react";
import { fetchListeningHistory } from "../lib/listeningHistoryApi.js";

function ListeningHistory({ onTrackClick, user }) {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadListeningHistory();
    }, []);

    async function loadListeningHistory() {
        try {
            setIsLoading(true);
            const historyItems = await fetchListeningHistory(user.id);
            console.log(historyItems);
            setHistory(historyItems);
        } catch (error) {
            setError("Could not load listening history.");
        } finally {
            setIsLoading(false);
        }
    }

    function handleTrackClick(index) {
        onTrackClick(history, index);
    }

    if (isLoading) return <p>Loading history...</p>;
    if (error) return <p>{error}</p>;

    return (
      <section>
        <h2>Listening History</h2>

        {history.map((track, index) => (
          <button
            key={`${track.id}-${track.playedAt}`}
            onClick={() => handleTrackClick(index)}
          >
            {track.title} — {track.artist}
          </button>
        ))}
      </section>
    );

    
}

export default ListeningHistory;