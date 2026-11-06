import { useState, useEffect } from "react";
import { fetchListeningHistory } from "../services/listeningHistoryApi.js";

function ListeningHistory({ onTrackClick }) {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadListeningHistory();
    }, []);

    async function loadListeningHistory() {
        try {
            setIsLoading(true);
            const historyItems = await fetchListeningHistory();
            setHistory(historyItems);
        } catch (error) {
            setError("Could not load listening history.");
        } finally {
            setIsLoading(false);
        }
    }

    function handleTrackClick(track) {
        onTrackClick(track);
    }

    if (isLoading) return <p>Loading history...</p>;
    if (error) return <p>{error}</p>;

    return (
      <section>
        <h1>Listening History</h1>

        {history.map((item) => (
          <button
            key={item.history_id}
            onClick={() => handleTrackClick(item.track)}
          >
            {item.track.title} — {item.track.artist}
          </button>
        ))}
      </section>
    );

    
}

export default ListeningHistory;