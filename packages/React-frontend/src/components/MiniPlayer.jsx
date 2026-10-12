import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import MusicControls from "./MusicControls";



function MiniPlayer({ 
    currentQueue, 
    playOrder, 
    playPosition, 
    setPlayOrder, 
    setPlayPosition,
    isShuffle,
    isRepeating,
    setIsShuffle,
    setIsRepeating,
}) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
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
        if (!audioRef.current || !currentSong) return;

        if (playPosition < playOrder.length - 1) {
            setPlayPosition((position) => position + 1);
        } else if (isRepeating) {
            setPlayPosition(0);
        }
    }

    function onTogglePrevious() {
        if (!audioRef.current || !currentSong) return;

        if ((audioRef.current.currentTime < 1) && playPosition > 0) {
            setPlayPosition((position) => position - 1);
        } else {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
        }
    }

    function onToggleShuffle() {
        if (!currentSong) return;

        if (!isShuffle) {
            const shuffledOrder = createShuffleOrder(currentQueue.length);

            const currentPositionInOrder =
            shuffledOrder.indexOf(currentTrackIndex);

            [shuffledOrder[0], shuffledOrder[currentPositionInOrder]] = [
            shuffledOrder[currentPositionInOrder],
            shuffledOrder[0],
            ];

            setPlayOrder(shuffledOrder);
            setPlayPosition(0);
            setIsShuffle(true);
        } else {
            const normalOrder = currentQueue.map((_, index) => index);

            setPlayOrder(normalOrder);
            setPlayPosition(currentTrackIndex);
            setIsShuffle(false);
        }
    }

    function onToggleRepeat() {
        if (isRepeating) {
            setIsRepeating(false);
        } else {
            setIsRepeating(true);
        }
    }

    function createShuffleOrder(queueLength) {
        const order = Array.from({ length: queueLength }, (_, index) => index);

        for (let index = order.length - 1; index > 0; --index) {
            const randomIndex = Math.floor(Math.random() * (index + 1));

            [order[index], order[randomIndex]] = [
                order[randomIndex],
                order[index],
            ];
        }

        return order;
    }

    function onEnded() {
        onToggleNext();
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
                onToggleNext={onToggleNext}
                onTogglePrevious={onTogglePrevious}
                onToggleShuffle={onToggleShuffle}
                onToggleRepeat={onToggleRepeat}
            />

        </main>
    )
}

export default MiniPlayer;
