import { motion } from "framer-motion";
import { useRef, useState } from "react";



function MusicPlayer() {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [songUrl, setSongUrl] = useState(null);

    function togglePlay() {
        if (!audioRef.current || !songUrl) return;

        if (audioRef.current.paused) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setSongUrl(url);
        setCurrentTime(0);
        setIsPlaying(false);
    }

    function seekSong(event) {
        const newTime = Number(event.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }
}
