import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import MusicControls from "./MusicControls";
import UploadProgress from "./UploadProgress";
import "../styles/MusicPlayer.css";

function MusicPlayer({
  currentQueue,
  playOrder,
  playPosition,
  onFileUpload,
  uploadProgress,
  savedTracks,
  signedIn
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrackIndex = playOrder[playPosition];
  const currentSong = currentQueue[currentTrackIndex];

  // useEffect(() => {
  //     setCurrentTime(0);
  //     setIsPlaying(false);
  // }, [selectedSong]);

  // function togglePlay() {
  //     if (!audioRef.current || !selectedSong) return;

  //     if (audioRef.current.paused) {
  //         audioRef.current.play();
  //     } else {
  //         audioRef.current.pause();
  //     }
  // }

  // function handlePlay() {
  //     if (selectedSong) {
  //         console.log(`Playing ${selectedSong.title}`);
  //     }
  // }

  // function seekSong(event) {
  //     const newTime = Number(event.target.value);

  //     if (!audioRef.current) return;

  //     audioRef.current.currentTime = newTime;
  //     setCurrentTime(newTime);
  // }

  function loadSavedTracks() {}

  return (
    <main className="player">
      {currentSong && signedIn ? (
        <>
          <h1>{currentSong.title}</h1>

          <audio
            ref={audioRef}
            src={currentSong.audioUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={() =>
              setCurrentTime(audioRef.current.currentTime)
            }
            onLoadedMetadata={() =>
              setDuration(audioRef.current.duration)
            }
          />

          <div>{savedTracks}</div>
        </>
      ) : (
        <>
          {/* Native input stays for keyboard/a11y; the label is the visible button */}
          <label
            className={`upload-button${uploadProgress ? " upload-button--busy" : ""}`}
          >
            <input
              className="upload-input"
              type="file"
              multiple
              accept="audio/*"
              onChange={onFileUpload}
              disabled={Boolean(uploadProgress)}
            />
            {uploadProgress ? "Uploading…" : "Upload songs"}
          </label>
          <p className="upload-hint">
            MP3, WAV, or any audio file. You can pick several at once.
          </p>
          {uploadProgress && <UploadProgress {...uploadProgress} />}
          <p>No song selected yet.</p>
        </>
      )}

      {/* <MusicControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onTogglePlay={togglePlay}
                onSeek={seekSong}
            /> */}
    </main>
  );
}

export default MusicPlayer;
