import {
    ShuffleIcon,
    SkipBackIcon,
    RewindIcon,
    PlayIcon,
    PauseIcon,
    FastForwardIcon,
    SkipForwardIcon,
    RepeatIcon,
} from "@phosphor-icons/react";
import "../styles/MusicControls.css";

function MusicControls({
    isPlaying,
    currentTime,
    duration,
    onTogglePlay,
    onSeek,
    onToggleSeekRight,
    onToggleSeekLeft,
    onToggleNext,
    onTogglePrevious,
    onToggleRepeat,
    onToggleShuffle,
}) {

    function formatTime(time) {
        if (!Number.isFinite(time)) return "0:00";

        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);

        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }

    // Percent of the song played, used by the CSS to fill the seek bar purple
    const progress = duration ? (currentTime / duration) * 100 : 0;

    return (
        <div className="mini-player">
            <div className="progress-row">
                <div>{formatTime(currentTime)}</div>
                <input
                    className="seek-bar"
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={onSeek}
                    style={{ "--progress": `${progress}%` }}
                />
                <div>{formatTime(duration)}</div>
            </div>


            <div className="music-controls">
                <button onClick={onToggleShuffle} className="shuffle-button" title="Shuffle">
                    <ShuffleIcon size={20} />
                </button>
                <button onClick={onTogglePrevious} title="Previous">
                    <SkipBackIcon size={22} weight="fill" />
                </button>
                <button onClick={onToggleSeekLeft} title="Seek back">
                    <RewindIcon size={22} weight="fill" />
                </button>
                <button onClick={onTogglePlay} className="play-button" title={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <PauseIcon size={22} weight="fill" /> : <PlayIcon size={22} weight="fill" />}
                </button>
                <button onClick={onToggleSeekRight} title="Seek forward">
                    <FastForwardIcon size={22} weight="fill" />
                </button>
                <button onClick={onToggleNext} title="Next">
                    <SkipForwardIcon size={22} weight="fill" />
                </button>
                <button onClick={onToggleRepeat} className="repeat-button" title="Repeat">
                    <RepeatIcon size={20} />
                </button>
            </div>
        </div>
        
    );
}

export default MusicControls;