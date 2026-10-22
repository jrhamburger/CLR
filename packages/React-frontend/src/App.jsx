import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from "./lib/supabase";

import SignUp from "./components/SignUp";
import MusicPlayer from "./components/MusicPlayer";
import MiniPlayer from './components/MiniPlayer';
import SignIn from "./components/SignIn";
import Home from "./components/Home";
import Playlists from "./components/Playlists";
import Sidebar from "./components/Sidebar";

function App() {
  const [currentScreen, setCurrentScreen] = useState("sign-up");
  const [currentQueue, setCurrentQueue] = useState([]);
  const [playOrder, setPlayOrder] = useState([]);
  const [playPosition, setPlayPosition] = useState(0);

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  const [session, setSession] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const currentSong = currentQueue[playOrder[playPosition]];

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

  async function handleSignOut() {
    await supabase.auth.signOut();
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

  if (!session) {
    return (
      <>
        <nav>
          <button onClick={() => setCurrentScreen("sign-up")}>Sign Up</button>
          <button onClick={() => setCurrentScreen("sign-in")}>Sign In</button>
        </nav>

        {currentScreen === "sign-up" && <SignUp />}
        {currentScreen === "sign-in" && <SignIn />}
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        currentSong={currentSong}
      />

      <div className="app-main">
        <nav>
          <button onClick={handleSignOut}>Sign out</button>
          <button onClick={() => setCurrentScreen("home")}>Home</button>
          <button onClick={() => setCurrentScreen("playlists")}>Playlists</button>
          <button onClick={() => setCurrentScreen("player")}>Player</button>
        </nav>

        {currentScreen === "home" && <Home session={session} />}
        {currentScreen === "playlists" && <Playlists session={session} />}

        {currentScreen === "player" &&
          <MusicPlayer
            currentQueue={currentQueue}
            playOrder={playOrder}
            playPosition={playPosition}
            onFileUpload={handleFileUpload}
          />
        }
      </div>

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
    </div>
  );
}

export default App;
