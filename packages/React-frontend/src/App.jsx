import { useState, useEffect } from "react";
import "./App.css";
import { supabase } from "./lib/supabase";
import { uploadFiles } from "./lib/fileuploading";
import { SCREENS, assertValidScreen } from "./constants/screens";

import SignUp from "./components/SignUp";
import MusicPlayer from "./components/MusicPlayer";
import MiniPlayer from "./components/MiniPlayer";
import SignIn from "./components/SignIn";
import Home from "./components/Home";
import Playlists from "./components/Playlists";
import Sidebar from "./components/Sidebar";
import ProfileMenu from "./components/ProfileMenu";
import Search from "./components/Search";
import Genres from "./components/Genres";
import Favorites from "./components/Favorites";
import TasteProfile from "./components/TasteProfile";
import Collections from "./components/Collections";
import Socials from "./components/Socials";
import NowPlaying from "./components/NowPlaying";
import NowPlayingPanel from "./components/NowPlayingPanel";
import "./styles/TopNav.css";

const TOP_NAV_ITEMS = [
  { label: "Home", screen: SCREENS.HOME },
  { label: "Playlists", screen: SCREENS.PLAYLISTS },
  { label: "Player", screen: SCREENS.PLAYER },
  { label: "Now Playing", screen: SCREENS.NOW_PLAYING },
];

function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.SIGN_UP);

  // Always change screens through this so a bad screen name fails loudly
  function navigate(screen) {
    assertValidScreen(screen);
    setCurrentScreen(screen);
  }
  const [currentQueue, setCurrentQueue] = useState([]);
  const [playOrder, setPlayOrder] = useState([]);
  const [playPosition, setPlayPosition] = useState(0);

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  const [session, setSession] = useState(null);
  const [savedTracks, setSavedTracks] = useState([]);
  const [signedIn, setSignedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(null); // { done, total } while uploading
  const [panelMode, setPanelMode] = useState("open"); // right column: "open" | "mini" | "hidden"

  const currentSong = currentQueue[playOrder[playPosition]];
  const upNext = playOrder
    .slice(playPosition + 1)
    .map((index) => currentQueue[index]);

  const queue = {
    tracks: currentQueue,
    order: playOrder,
    position: playPosition
  };

  const modes = {
    isShuffle,
    isRepeating
  };

  const controls = {
    nextTrack: handleNextTrack,
    previousTrack: handlePreviousTrack,
    toggleShuffle: handleToggleShuffle,
    toggleRepeat: handleToggleRepeat
  };

  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => setSession(data.session));
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
      navigate(session ? SCREENS.HOME : SCREENS.SIGN_IN);
    }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  async function handleFileUpload(event) {
    const files = Array.from(event.target.files ?? []);
    // Reset so the same file(s) can be picked again later
    event.target.value = "";

    if (files.length === 0) 
      return;

    setUploadProgress({ done: 0, total: files.length });

    const { uploaded, failed } = await uploadFiles(
      files,
      session.user.id,
      (done, total) => setUploadProgress({ done, total })
    );

    setUploadProgress(null);
    setSavedTracks((currentTracks) => [...uploaded, ...currentTracks]);

    if (failed.length > 0) {
      console.log(failed);
      alert(`${uploaded.length} uploaded; ${failed.length} failed.`);
    } else {
      alert(`${uploaded.length} song(s) uploaded successfully.`);
    }
  }

  function startQueue(tracks, startingIndex = 0) {
    const normalOrder = tracks.map((_, index) => index);

    setCurrentQueue(tracks);
    setPlayOrder(normalOrder);
    setPlayPosition(startingIndex);
  }

  function handleNextTrack() {
    if (!audioRef.current || !currentSong) return;

    if (playPosition < playOrder.length - 1) {
      setPlayPosition((position) => position + 1);
    } else if (isRepeating) {
      setPlayPosition(0);
    }
  }

  function handlePreviousTrack() {
    if (!audioRef.current || !currentSong) return;

    if (audioRef.current.currentTime < 1 && playPosition > 0) {
      setPlayPosition((position) => position - 1);
    } else {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }

  function handleToggleShuffle() {
    if (!currentSong) return;

    if (!isShuffle) {
      const shuffledOrder = createShuffleOrder(
        currentQueue.length
      );

      const currentPositionInOrder = shuffledOrder.indexOf(
        currentTrackIndex
      );

      [
        shuffledOrder[0],
        shuffledOrder[currentPositionInOrder]
      ] = [
        shuffledOrder[currentPositionInOrder],
        shuffledOrder[0]
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

  function handleToggleRepeat() {
    if (isRepeating) {
      setIsRepeating(false);
    } else {
      setIsRepeating(true);
    }
  }

  function createShuffleOrder(queueLength) {
    const order = Array.from(
      { length: queueLength },
      (_, index) => index
    );

    for (let index = order.length - 1; index > 0; --index) {
      const randomIndex = Math.floor(
        Math.random() * (index + 1)
      );

      [order[index], order[randomIndex]] = [
        order[randomIndex],
        order[index]
      ];
    }

    return order;
  }

  if (!session) {
    return (
      <>
        <nav>
          <button onClick={() => navigate(SCREENS.SIGN_UP)}>Sign Up</button>
          <button onClick={() => navigate(SCREENS.SIGN_IN)}>Sign In</button>
        </nav>

        {currentScreen === SCREENS.SIGN_UP && <SignUp />}
        {currentScreen === SCREENS.SIGN_IN && <SignIn />}
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentScreen={currentScreen}
        onNavigate={navigate}
        currentSong={currentSong}
      />

      <div className="app-main">
        <nav className="top-nav">
          {TOP_NAV_ITEMS.map(({ label, screen }) => (
            <button
              key={screen}
              className={currentScreen === screen ? "active" : ""}
              onClick={() => navigate(screen)}
            >
              {label}
            </button>
          ))}
          <button className="sign-out" onClick={handleSignOut}>
            Sign out
          </button>
        </nav>

        {currentScreen === SCREENS.HOME && <Home session={session} onStartQueue={startQueue} />}
        {currentScreen === SCREENS.PLAYLISTS && <Playlists session={session} />}
        {currentScreen === SCREENS.SEARCH && <Search />}
        {currentScreen === SCREENS.GENRES && <Genres />}
        {currentScreen === SCREENS.FAVORITES && <Favorites />}
        {currentScreen === SCREENS.TASTE_PROFILE && <TasteProfile />}
        {currentScreen === SCREENS.COLLECTIONS && <Collections />}
        {currentScreen === SCREENS.SOCIALS && <Socials />}
        {currentScreen === SCREENS.NOW_PLAYING && (
          <NowPlaying currentSong={currentSong} upNext={upNext} />
        )}

        {currentScreen === SCREENS.PLAYER &&
          <MusicPlayer
            currentQueue={currentQueue}
            playOrder={playOrder}
            playPosition={playPosition}
            onFileUpload={handleFileUpload}
            uploadProgress={uploadProgress}
          />
        )}
      </div>

      {/* On the Now Playing page the column's content is the page itself */}
      {currentScreen !== SCREENS.NOW_PLAYING && (
        <NowPlayingPanel
          mode={panelMode}
          onChangeMode={setPanelMode}
          currentSong={currentSong}
          upNext={upNext}
        />
      )}

      {currentQueue && (
        <MiniPlayer
          queue={queue}
          modes={modes}
          controls={controls}
        />
      )}

      <ProfileMenu onSignOut={handleSignOut} />
    </div>
  );
}

export default App;
