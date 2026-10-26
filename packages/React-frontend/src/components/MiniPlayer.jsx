import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import MusicControls from "./MusicControls";



function MiniPlayer({ 
    queue,
    modes,
    controls
}) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const {
      tracks: currentQueue,
      order: playOrder,
      position: playPosition
    } = queue;

    const { isShuffle, isRepeating } = modes;

    const {
      nextTrack,
      previousTrack,
      toggleShuffle,
      toggleRepeat
    } = controls;

    const currentTrackIndex = playOrder[playPosition];
    const currentSong = currentQueue[currentTrackIndex];

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
        if (!audioRef.current || !currentSong) return;

        const newTime = Math.max(
            audioRef.current.currentTime - 5,
            0
        );

        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }

    function onToggleNext() {
        if (!currentSong) return;

        nextTrack();
    }

    function onTogglePrevious() {
        if (
          audioRef.current.currentTime < 1 &&
          playPosition > 0
        ) {
          previousTrack(); // asks App to change tracks
        } else {
          audioRef.current.currentTime = 0; // local audio action
          setCurrentTime(0);
        }
    }

    function onToggleShuffle() {
        if (!currentSong) return;

        toggleShuffle();
    }

    function onToggleRepeat() {
        toggleRepeat();
    }

    function onEnded() {
        nextTrack();
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
                isShuffle={isShuffle}
                isPlaying={isPlaying}
                isRepeating={isRepeating}
                currentTime={currentTime}
                duration={duration}
                onTogglePlay={togglePlay}
                onSeek={seekSong}
                onToggleSeekRight={onToggleSeekRight}
                onToggleSeekLeft={onToggleSeekLeft}
                onToggleNext={onToggleNext}
                onTogglePrevious={onTogglePrevious}
                onToggleShuffle={onToggleShuffle}
                onToggleRepeat={onToggleRepeat}
            />

        </main>
    )
}

export default MiniPlayer;
