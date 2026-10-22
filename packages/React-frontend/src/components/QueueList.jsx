import { MusicNoteIcon } from "@phosphor-icons/react";
import "../styles/NowPlaying.css";

// Album cover for a song, or a placeholder until songs have a coverUrl
export function SongCover({ song, size }) {
  return (
    <div className="song-cover" style={{ width: size, height: size }}>
      {song?.coverUrl ? (
        <img src={song.coverUrl} alt={song.title} />
      ) : (
        <MusicNoteIcon size={size / 2.5} />
      )}
    </div>
  );
}

// compact: only show covers (used by the mini right column)
function QueueList({ songs, compact }) {
  if (songs.length === 0) {
    return compact ? null : <p className="queue-empty">Nothing up next.</p>;
  }

  return (
    <ol className={`queue-list ${compact ? "compact" : ""}`}>
      {songs.map((song, index) => (
        <li key={index} title={song.title}>
          <SongCover song={song} size={compact ? 44 : 48} />
          {!compact && <span className="queue-title">{song.title}</span>}
        </li>
      ))}
    </ol>
  );
}

export default QueueList;
