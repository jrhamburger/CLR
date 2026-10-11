import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import MusicControls from "./MusicControls";



function MiniPlayer({ currentQueue, currentIndex, setCurrentIndex }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    let currentSong = currentQueue[currentIndex];

    useEffect(() => {
        if (!currentSong || !audioRef.current) return;

        setCurrentTime(0);

        audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));

    }, [currentSong]);

    function togglePlay() {
        if (!audioRef.current || !currentSong) return;

        if (audioRef.current.paused) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }

    function seekSong(event) {
        const newTime = Number(event.target.value);

        if (!audioRef.current) return;

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }

    function onToggleSeekRight() {
        const newTime = Math.min(
            audioRef.current.currentTime + 5,
            audioRef.current.duration
        );

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }

    function onToggleSeekLeft() {
        const newTime = Math.max(
            audioRef.current.currentTime - 5,
            0
        );

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }

    function onEnded() {
        if (currentIndex < currentQueue.length - 1) {
            setCurrentIndex((index) => index + 1);
        } else {
            setIsPlaying(false);
        }
    }


    return (
        <main className="player">
            {currentSong && (
                <>
                    <audio
                        ref={audioRef}
                        src={currentSong.audioUrl}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => onEnded()}
                        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
                        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
                    />

                </>
            )}

            <MusicControls
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onTogglePlay={togglePlay}
                onSeek={seekSong}
                onToggleSeekRight={onToggleSeekRight}
                onToggleSeekLeft={onToggleSeekLeft}
            />

        </main>
    )
}

export default MiniPlayer;
