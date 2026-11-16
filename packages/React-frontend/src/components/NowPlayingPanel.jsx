import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretDoubleRightIcon
} from "@phosphor-icons/react";
import QueueList, { SongCover } from "./QueueList";
import "../styles/NowPlaying.css";

function PanelVisualizer() {
  return (
    <div
      className="panel-visualizer"
      aria-label="Audio visualizer placeholder">
      {Array.from({ length: 28 }, (_, index) => (
        <span
          key={index}
          style={{ "--bar": (index % 7) + 1 }}
        />
      ))}
    </div>
  );
}

// Right column. mode is "open" (full), "mini" (covers only) or "hidden"
function NowPlayingPanel({
  mode,
  onChangeMode,
  onOpenFullNowPlaying,
  currentSong,
  upNext
}) {
  return (
    <>
      <aside className={`now-playing-panel ${mode}`}>
        {mode === "open" && (
          <>
            <div className="panel-header">
              <h3>Now Playing</h3>
              <button
                onClick={() => onChangeMode("mini")}
                title="Shrink">
                <CaretRightIcon size={18} />
              </button>
              <button
                onClick={() => onChangeMode("hidden")}
                title="Hide">
                <CaretDoubleRightIcon size={18} />
              </button>
            </div>

            <div className="panel-current-track">
              <SongCover song={currentSong} size={76} />
              <div>
                <p className="panel-kicker">Listening now</p>
                <p className="panel-song-title">
                  {currentSong?.title ?? "Nothing playing"}
                </p>
              </div>
            </div>

            <section className="panel-section panel-section--visualizer">
              <h4>Sound</h4>
              <PanelVisualizer />
            </section>

            <section className="panel-section panel-section--queue">
              <h4>Up Next</h4>
              <div className="panel-scroll-area">
                <QueueList songs={upNext} />
              </div>
            </section>

            <section className="panel-section panel-section--lyrics">
              <h4>Lyrics</h4>
              <div className="panel-scroll-area panel-lyrics">
                <p>
                  Lyrics will appear here when they are
                  available for the current track.
                </p>
              </div>
            </section>
          </>
        )}

        {mode === "mini" && (
          <>
            <div className="panel-header mini">
              <button
                onClick={() => onChangeMode("open")}
                title="Expand">
                <CaretLeftIcon size={18} />
              </button>
              <button
                onClick={() => onChangeMode("hidden")}
                title="Hide">
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
          title="Show Now Playing">
          <CaretLeftIcon size={12} />
        </button>
      )}

      {/* The desktop companion panel yields on small screens. This compact
          launcher keeps the dedicated Now Playing screen one tap away. */}
      <button
        className="mobile-now-playing-launcher"
        onClick={onOpenFullNowPlaying}
        aria-label="Open Now Playing">
        <SongCover song={currentSong} size={40} />
        <span className="mobile-now-playing-launcher__copy">
          <small>Now Playing</small>
          <b>{currentSong?.title ?? "Nothing playing"}</b>
        </span>
        <CaretLeftIcon
          className="mobile-now-playing-launcher__icon"
          size={17}
          weight="bold"
        />
      </button>
    </>
  );
}

export default NowPlayingPanel;
