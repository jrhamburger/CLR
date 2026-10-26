import { useState, useEffect } from "react";
import "./App.css";
import { supabase } from "./lib/supabase";

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
  { label: "Home", screen: "home" },
  { label: "Playlists", screen: "playlists" },
  { label: "Player", screen: "player" },
  { label: "Now Playing", screen: "now-playing" }
];

function App() {
  const [currentScreen, setCurrentScreen] = useState("sign-up");
  const [currentQueue, setCurrentQueue] = useState([]);
  const [playOrder, setPlayOrder] = useState([]);
  const [playPosition, setPlayPosition] = useState(0);

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  const [session, setSession] = useState(null);
  const [savedTracks, setSavedTracks] = useState([]);
  const [signedIn, setSignedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    toggleRepeat: handleToggleRepeat,
  };

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setCurrentScreen(session ? "home" : "sign-in");
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  // TODO: Fix this function
  async function handleFileUpload(event) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) return;

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(userError);
      return;
    }
    if (!user)
      throw new Error("You must be logged in to upload.");

    const uploadedTracks = [];
    const failedFiles = [];

    for (const file of files) {
      if (!file.type.startsWith("audio/")) {
        failedFiles.push(`${file.name} is not an audio file.`);
        continue;
      }

      const safeFileName = file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

      const audioPath = `${user.id}/${crypto.randomUUID()}-${safeFileName}`;

      // 1. Upload the actual audio file to storage
      const { error: uploadError } = await supabase.storage
        .from("audio-files")
        .upload(audioPath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error(uploadError);
        failedFiles.push(`Could not upload ${file.name}.`);
        continue;
      }

      // 2. Create its tracks-table row.
      const title = file.name.replace(/\.[^/.]+$/, "");

      const { data: newTrack, error: trackError } =
        await supabase
          .from("tracks")
          .insert({
            title,
            owner_id: user.id,
            audio_path: audioPath
          })
          .select()
          .single();

      if (trackError) {
        console.error(trackError);
        failedFiles.push(
          `Could not save ${file.name}'s track information.`
        );

        await supabase.storage
          .from("audio-files")
          .remove([audioPath]);
        continue;
      }

      // 3. Save that track to this user's library.
      const { error: savedTrackError } = await supabase
        .from("user_tracks")
        .insert({
          user_id: user.id,
          track_id: newTrack.id
        });

      if (savedTrackError) {
        console.error(savedTrackError);
        failedFiles.push(
          `Could not add ${file.name} to the library.`
        );
        continue;
      }

      uploadedTracks.push(newTrack);

      // Immediately update React state with all successful uploads.
      setSavedTracks((currentTracks) => [
        ...uploadedTracks,
        ...currentTracks
      ]);

      if (failedFiles.length > 0) {
        console.log(failedFiles);
        alert(
          `${uploadedTracks.length} uploaded; ${failedFiles.length} failed.`
        );
      } else {
        alert(
          `${uploadedTracks.length} song(s) uploaded successfully.`
        );
      }

      // Allows the user to select the same file(s) again later if needed.
      event.target.value = "";
    }

    // const uploadedSongs = files.map((file) => ({
    //   title: file.name,
    //   audioUrl: URL.createObjectURL(file),
    // }))

    // startQueue(uploadedSongs);

    // event.target.value = "";
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
       const normalOrder = currentQueue.map(
         (_, index) => index
       );

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
          <button onClick={() => setCurrentScreen("sign-up")}>
            Sign Up
          </button>
          <button onClick={() => setCurrentScreen("sign-in")}>
            Sign In
          </button>
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
        <nav className="top-nav">
          {TOP_NAV_ITEMS.map(({ label, screen }) => (
            <button
              key={screen}
              className={
                currentScreen === screen ? "active" : ""
              }
              onClick={() => setCurrentScreen(screen)}>
              {label}
            </button>
          ))}
          <button className="sign-out" onClick={handleSignOut}>
            Sign out
          </button>
        </nav>

        {currentScreen === "home" && (
          <Home session={session} onStartQueue={startQueue} />
        )}
        {currentScreen === "playlists" && (
          <Playlists session={session} />
        )}
        {currentScreen === "search" && <Search />}
        {currentScreen === "genres" && <Genres />}
        {currentScreen === "favorites" && <Favorites />}
        {currentScreen === "taste-profile" && <TasteProfile />}
        {currentScreen === "collections" && <Collections />}
        {currentScreen === "socials" && <Socials />}
        {currentScreen === "now-playing" && (
          <NowPlaying
            currentSong={currentSong}
            upNext={upNext}
          />
        )}

        {currentScreen === "player" && (
          <MusicPlayer
            currentQueue={currentQueue}
            playOrder={playOrder}
            playPosition={playPosition}
            onFileUpload={handleFileUpload}
          />
        )}
      </div>

      {/* On the Now Playing page the column's content is the page itself */}
      {currentScreen !== "now-playing" && (
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
