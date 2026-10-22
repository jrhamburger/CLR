import { useState } from "react";
import { supabase } from "../lib/supabase";

function PlaylistDetail({ playlist, onBack, onDeleted }) {
  const [message, setMessage] = useState("");

  async function handleDelete() {
    if (!window.confirm(`Delete "${playlist.playlist_name}"?`)) return;

    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("playlist_id", playlist.playlist_id);

    if (error) {
      setMessage(error.message);
      return;
    }

    onDeleted(playlist.playlist_id);
  }

  return (
    <div>
      <button onClick={onBack}>Back</button>

      <h2>{playlist.playlist_name}</h2>
      <p>{playlist.is_public ? "Public" : "Private"} playlist</p>

      {/* TODO: list this playlist's songs once the songs table is set up */}
      <p>No songs yet.</p>

      <button onClick={handleDelete}>Delete playlist</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default PlaylistDetail;
