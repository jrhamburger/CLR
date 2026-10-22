import QueueList, { SongCover } from "./QueueList";
import "../styles/NowPlaying.css";

// Full-page version of the right column
function NowPlaying({ currentSong, upNext }) {
  return (
    <div className="now-playing-page">
      <h2>Now Playing</h2>

      <div className="now-playing-content">
        <div className="now-playing-current">
          <SongCover song={currentSong} size={360} />
          <p className="now-playing-title">
            {currentSong?.title ?? "Nothing playing"}
          </p>
        </div>

        <div className="now-playing-queue">
          <h3>Up Next</h3>
          <QueueList songs={upNext} />
        </div>
      </div>
    </div>
  );
}

export default NowPlaying;
