import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from "./lib/supabase";

import SignUp from "./components/SignUp";
import MusicPlayer from "./components/MusicPlayer";
import MiniPlayer from './components/MiniPlayer';

function App() {
  const [currentScreen, setCurrentScreen] = useState("sign-up");
  const [currentQueue, setCurrentQueue] = useState([]);
  const [playOrder, setPlayOrder] = useState([]);
  const [playPosition, setPlayPosition] = useState(0);

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

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
  async function handleFileUpload(event) {
      const files = Array.from(event.target.files ?? []);

      if (files.length === 0) return;

      const { 
        data: { user }, 
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("You must be logged in to upload.");

      const uploadedSongs = files.map((file) => ({
        title: file.name,
        audioUrl: URL.createObjectURL(file),
      }))

      startQueue(uploadedSongs);

      event.target.value = "";
  }

  function startQueue(tracks, startingIndex = 0) {
    const normalOrder = tracks.map((_, index) => index);

    setCurrentQueue(tracks);
    setPlayOrder(normalOrder);
    setPlayPosition(startingIndex);
  }

  return (
    <>
      <nav>
        <button onClick={showSignUp}>Sign Up</button>
        <button onClick={showPlayer}>Player</button>
      </nav>

      {currentQueue && <MiniPlayer 
        currentQueue={currentQueue}
        playOrder={playOrder} 
        playPosition={playPosition}
        setPlayPosition={setPlayPosition}
        setPlayOrder={setPlayOrder}
        isShuffle={isShuffle}
        isRepeating={isRepeating}
        setIsShuffle={setIsShuffle}
        setIsRepeating={setIsRepeating}
      />}

      {currentScreen == "sign-up" && <SignUp />}
      {currentScreen == "player" && 
        <MusicPlayer 
          currentQueue={currentQueue}
          playOrder={playOrder}
          playPosition={playPosition} 
          onFileUpload={handleFileUpload}
        />
      }
    </>
  );
}

export default App;
