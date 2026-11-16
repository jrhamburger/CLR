import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretDoubleRightIcon,
} from "@phosphor-icons/react";
import QueueList, { SongCover } from "./QueueList";
import "../styles/NowPlaying.css";

// Right column. mode is "open" (full), "mini" (covers only) or "hidden"
function NowPlayingPanel({ mode, onChangeMode, currentSong, upNext }) {
  return (
    <>
      <aside className={`now-playing-panel ${mode}`}>
        {mode === "open" && (
          <>
            <div className="panel-header">
              <h3>Now Playing</h3>
              <button onClick={() => onChangeMode("mini")} title="Shrink">
                <CaretRightIcon size={18} />
              </button>
              <button onClick={() => onChangeMode("hidden")} title="Hide">
                <CaretDoubleRightIcon size={18} />
              </button>
            </div>

            <SongCover song={currentSong} size={240} />
            <p className="panel-song-title">
              {currentSong?.title ?? "Nothing playing"}
            </p>

            <h4>Up Next</h4>
            <QueueList songs={upNext} />
          </>
        )}

        {mode === "mini" && (
          <>
            <div className="panel-header mini">
              <button onClick={() => onChangeMode("open")} title="Expand">
                <CaretLeftIcon size={18} />
              </button>
              <button onClick={() => onChangeMode("hidden")} title="Hide">
                <CaretDoubleRightIcon size={18} />
              </button>
            </div>

            <SongCover song={currentSong} size={52} />
            <hr />
            <QueueList songs={upNext} compact />
          </>
        )}
      </aside>

      {/* Small tab on the right edge to bring the column back */}
      {mode === "hidden" && (
        <button
          className="panel-reveal-tab"
          onClick={() => onChangeMode("open")}
          title="Show Now Playing"
        >
          <CaretLeftIcon size={12} />
        </button>
      )}
    </>
  );
}

export default NowPlayingPanel;
