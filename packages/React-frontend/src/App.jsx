import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from "./lib/supabase";

import SignUp from "./components/SignUp";
import MusicPlayer from "./components/MusicPlayer";
import MiniPlayer from './components/MiniPlayer';

function App() {
  const [currentScreen, setCurrentScreen] = useState("sign-up");
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentQueue, setCurrentQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.auth.getSession();

      console.log("Connected:", data);
      console.log("Error:", error);
    }

    testConnection();
  }, []);

  function showSignUp() {
    setCurrentScreen("sign-up");
  }

  function showPlayer() {
    setCurrentScreen("player");
  }

  // TODO: Fix this function
  function handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const song = {
        title: file.name,
        audioUrl: URL.createObjectURL(file),
      }

      function addToQueue(song) {
        setCurrentQueue((queue) => [...queue, song]);
      }

      addToQueue(song);
      if (currentIndex < 0) {
        setCurrentIndex(currentIndex + 1);
      }
  }

  return (
    <>
      <nav>
        <button onClick={showSignUp}>Sign Up</button>
        <button onClick={showPlayer}>Player</button>
      </nav>

      {currentQueue && <MiniPlayer currentQueue={currentQueue} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex}/>}

      {currentScreen == "sign-up" && <SignUp />}
      {currentScreen == "player" && 
        <MusicPlayer 
          currentQueue={currentQueue} 
          currentIndex={currentIndex}
          onFileUpload={handleFileUpload}
        />
      }
    </>
  );
}

export default App;
