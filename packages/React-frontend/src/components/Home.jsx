import { getUserTracks } from "../../../Express-backend/src/api/library";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";

function Home({ session, onStartQueue }) {
  const [username, setUsername] = useState("");
  const [tracks, setTracks] = useState([]);
  const [trackMessage, setTrackMessage] = useState("");

  //Fetching the Username from personal.users.username
  useEffect(() => {
    supabase
      .from("users")
      .select("user_name")
      .eq("user_id", session.user.id)
      .single()
      .then(({ data }) => setUsername(data?.user_name ?? ""));
  }, [session]);

  // Fetches the tracks that the user owns
  useEffect(() => {
    async function loadTracks() {
      try {
        const userTracks = await getUserTracks(
          session.access_token
        );
        setTracks(userTracks);
      } catch (error) {
        setTrackMessage(error.message);
      }
    }

    loadTracks();
  }, [session]);

  return (
    <div>
      <h2>Welcome, {username}</h2>
      <h2>Home</h2>

      <section>
        <h3>Your Music</h3>

        {tracks.length === 0 && (
          <p>You have not uploaded any tracks yet.</p>
        )}

        {tracks.map((track, index) => (
          <button
            className="track-card" 
            key={track.id}
            type="button"
            onClick={() => onStartQueue(tracks, index)}
          >
            <p>{track.title}</p>
            <p>{track.artists}</p>
          </button>
        ))}

        {trackMessage && <p>{trackMessage}</p>}
      </section>
    </div>
  );
}

export default Home;
