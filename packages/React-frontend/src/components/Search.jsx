import { useState } from "react";
import "../styles/Search.css";

function Search({ session, onStartQueue }) {
  const [searchText, setSearchText] = useState("");
  const [tracks, setTracks] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  async function handleSearch(event) {
    event.preventDefault();

    const query = searchText.trim();

    if (!query) {
      return;
    }

    try {
      setIsSearching(true);
      setSearchError("");

      const response = await fetch(
        `/api/catalog/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not search the catalog.");
      }

      const data = await response.json();

      console.table(
        data.tracks.map((track) => ({
          id: track.id,
          recordingMbid: track.recordingMbid,
          title: track.title,
          artist: track.artist,
          coverArtUrl: track.coverArtUrl,
        }))
      );

      setTracks(data.tracks);
    } catch (error) {
      console.error(error);
      setSearchError("Something went wrong while searching.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div>
      <h2>Search</h2>
      <section>
        <form onSubmit={handleSearch}>
          <input
            type="search"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Search songs or artists"
          />

          <button type="submit" disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

        {searchError && <p>{searchError}</p>}

        <ul>
          {tracks.map((track, index) => (
            <li key={track.id ?? track.recordingMbid}>
              <button 
                className="search-result-card"
                type="button"
                disabled={!track.audioUrl}
                onClick={() => {
                  if (track.audioUrl) {
                    onStartQueue([track], 0);
                  }
                }}
              >
                <div className="search-result-cover-frame">
                  <img
                  src={track.coverArtUrl}
                  alt={`${track.title} cover art`}
                  className="search-result-cover"
                />
                </div>
                
                {track.title} — {track.artist}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Search;
