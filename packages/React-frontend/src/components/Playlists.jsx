import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import PlaylistDetail from "./PlaylistDetail";

function Playlists({ session }) {
  const [playlists, setPlaylists] = useState([]);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState(null);
  const [newName, setNewName] = useState("");

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

  function removePlaylist(playlistId) {
    setPlaylists(playlists.filter((p) => p.playlist_id !== playlistId));
    setSelected(null);
  }

  if (selected) {
    return (
      <PlaylistDetail
        playlist={selected}
        onBack={() => setSelected(null)}
        onDeleted={removePlaylist}
      />
    );
  }

async function handleCreate(event) {
  event.preventDefault();

  const { data, error } = await supabase
    .from("playlists")
    .insert({ user_id: session.user.id, playlist_name: newName })
    .select()
    .single();

  if (error) {
    setMessage(error.message);
    return;
  }

  setPlaylists([...playlists, data]);
  setNewName("");
}

async function handleDelete(playlist) {
  if (!window.confirm(`Delete "${playlist.playlist_name}"?`)) return;

  const { error } = await supabase
    .from("playlists")
    .delete()
    .eq("playlist_id", playlist.playlist_id);

  if (error) {
    setMessage(error.message);
    return;
  }

  removePlaylist(playlist.playlist_id);
}

  return (
    <div>
      <h2>Your playlists</h2>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New playlist name"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          required
        />
        <button type="submit">Create</button>
      </form>

      {playlists.length === 0 && <p>No playlists yet.</p>}

      <ul>
        {playlists.map((playlist) => (
          <li key={playlist.playlist_id}>
            <button onClick={() => setSelected(playlist)}>
              {playlist.playlist_name}
            </button>
            <button onClick={() => handleDelete(playlist)}>Delete</button>
          </li>
        ))}
      </ul>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Playlists;