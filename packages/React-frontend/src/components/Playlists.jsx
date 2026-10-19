import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

function Playlists({ session }) {
  const [playlists, setPlaylists] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase
      .from("playlists")
      .select("playlist_id, playlist_name, is_public")
      .eq("user_id", session.user.id)
      .then(({ data, error }) => {
        if (error) setMessage(error.message);
        else setPlaylists(data);
      });
  }, [session]);

  return (
    <div>
      <h2>Your playlists</h2>

      {playlists.length === 0 && <p>No playlists yet.</p>}

      <ul>
        {playlists.map((playlist) => (
          <li key={playlist.playlist_id}>{playlist.playlist_name}</li>
        ))}
      </ul>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Playlists;