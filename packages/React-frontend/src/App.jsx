import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from "./lib/supabase";

import SignUp from "./components/SignUp";
import MusicPlayer from "./components/MusicPlayer";
import MiniPlayer from './components/MiniPlayer';
import SignIn from "./components/SignIn";
import Home from "./components/Home";
import Playlists from "./components/Playlists";

function App() {
  const [currentScreen, setCurrentScreen] = useState("sign-up");
  const [currentQueue, setCurrentQueue] = useState([]);
  const [playOrder, setPlayOrder] = useState([]);
  const [playPosition, setPlayPosition] = useState(0);

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  const [session, setSession] = useState(null);

  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => setSession(data.session));
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      setCurrentScreen(session ? "home" : "sign-in");
    }
    );
    return () => listener.subscription.unsubscribe();
  }, []);   

  function showSignUp() {
    setCurrentScreen("sign-up");
  }

  function showPlayer() {
    setCurrentScreen("player");
  }

  function showSignIn(){
    setCurrentScreen("sign-in");
  }

  // TODO: Fix this function
  function handleFileUpload(event) {
      const files = Array.from(event.target.files ?? []);

      if (files.length === 0) return;
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
        {!session && <button onClick={() => setCurrentScreen("sign-up")}>Sign Up</button>}
        {!session && <button onClick={() => setCurrentScreen("sign-in")}>Sign In</button>}
        {session && <button onClick={() => setCurrentScreen("home")}>Home</button>}
        {session && <button onClick={() => setCurrentScreen("playlists")}>Playlists</button>}
        {session && <button onClick={() => setCurrentScreen("player")}>Player</button>}
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

      {!session && currentScreen === "sign-up" && <SignUp />}
      {!session && currentScreen === "sign-in" && <SignIn />}

      {session && currentScreen === "home" && <Home session={session} />}
      {session && currentScreen === "playlists" && <Playlists session={session} />}

      {session && currentScreen === "player" && 
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
