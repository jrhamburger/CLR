import { useState } from "react";

function Search() {
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
        `/api/catalog/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Could not search the catalog.");
      }

      const data = await response.json();
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
          {tracks.map((track) => (
            <li key={track.recordingMbid}>
              {track.title} — {track.artist}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default Search;
