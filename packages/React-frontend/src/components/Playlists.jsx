import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { PlaylistIcon, TrashIcon } from "@phosphor-icons/react";
import PlaylistDetail from "./PlaylistDetail";
import "../styles/Playlists.css";

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

      <div className="playlist-grid">
        {playlists.map((playlist) => (
          <div className="playlist-card" key={playlist.playlist_id}>
            <button className="playlist-open" onClick={() => setSelected(playlist)}>
              {/* Placeholder until playlists have their own cover image */}
              <div className="playlist-cover">
                <PlaylistIcon size={48} />
              </div>
              <span className="playlist-name">{playlist.playlist_name}</span>
            </button>

            <button
              className="playlist-delete"
              onClick={() => handleDelete(playlist)}
              title="Delete playlist"
            >
              <TrashIcon size={16} />
            </button>
          </div>
        ))}
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Playlists;