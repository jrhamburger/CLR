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
                />
                <div>{formatTime(duration)}</div>
            </div>
            

            <div className="music-controls">
                <button onClick={onToggleShuffle} className="shuffle-button">Shuffle</button>
                <button onClick={onTogglePrevious}>Previous</button>
                <button onClick={onToggleSeekLeft}>Seek Left</button>
                <button onClick={onTogglePlay}>
                    {isPlaying ? "Pause" : "Play"}
                </button>
                <button onClick={onToggleSeekRight}>Seek Right</button>
                <button onClick={onToggleNext}>Next</button>
                <button onClick={onToggleRepeat} className="repeat-button">Repeat</button>
            </div>
        </div>
        
    );
}

export default MusicControls;