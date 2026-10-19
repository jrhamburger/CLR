import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import MusicControls from "./MusicControls";


function MusicPlayer({ currentQueue, playOrder, playPosition, onFileUpload, savedTracks }) {
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

    function loadSavedTracks() {

    }

    return (
        <main className="player">
            <input type="file" multiple accept="audio/*" onChange={onFileUpload} />

            {currentSong ? (
                <>
                    <h1>{currentSong.title}</h1>

                    <audio
                        ref={audioRef}
                        src={currentSong.audioUrl}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
                        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
                    />

                    <div>
                        {savedTracks}
                    </div>

                </>
            ) : (
                <p>No song selected yet.</p>
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
