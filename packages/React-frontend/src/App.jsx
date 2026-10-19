import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from "./lib/supabase";

import SignUp from "./components/SignUp";
import MusicPlayer from "./components/MusicPlayer";
import MiniPlayer from './components/MiniPlayer';
import SignIn from './components/SignIn';

function App() {
  const [currentScreen, setCurrentScreen] = useState("sign-up");
  const [currentQueue, setCurrentQueue] = useState([]);
  const [playOrder, setPlayOrder] = useState([]);
  const [playPosition, setPlayPosition] = useState(0);

  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);

  const [savedTracks, setSavedTracks] = useState([]);
  const [signedIn, setSignedIn] = useState(false);

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

  function showSignIn() {
    setCurrentScreen("sign-in");
  }

  // TODO: Fix this function
  async function handleFileUpload(event) {
      const files = Array.from(event.target.files ?? []);

      if (files.length === 0) return;

      const { 
        data: { user }, 
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(userError);
        return;
      }
      if (!user) throw new Error("You must be logged in to upload.");

      const uploadedTracks = [];
      const failedFiles = [];

      for (const file of files) {
        if (!file.type.startsWith("audio/")) {
          failedFiles.push(`${file.name} is not an audio file.`);
          continue;
        }

        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        const audioPath = `${user.id}/${crypto.randomUUID()}-${safeFileName}`;

        // 1. Upload the actual audio file to storage
        const { error: uploadError } = await supabase.storage
          .from("audio-files")
          .upload(audioPath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error(uploadError);
          failedFiles.push(`Could not upload ${file.name}.`);
          continue;
        }

        // 2. Create its tracks-table row.
        const title = file.name.replace(/\.[^/.]+$/, "");

        const { data: newTrack, error: trackError } = await supabase
          .from("tracks")
          .insert({
            title,
            owner_id: user.id,
            audio_path: audioPath,
          })
          .select()
          .single();

        if (trackError) {
          console.error(trackError);
          failedFiles.push(`Could not save ${file.name}'s track information.`);

          await supabase.storage.from("audio-files").remove([audioPath]);
          continue;
        }

        // 3. Save that track to this user's library.
        const { error: savedTrackError } = await supabase
          .from("user_tracks")
          .insert({
            user_id: user.id,
            track_id: newTrack.id,
          });

        if (savedTrackError) {
          console.error(savedTrackError);
          failedFiles.push(`Could not add ${file.name} to the library.`);
          continue;
        }

        uploadedTracks.push(newTrack);

        // Immediately update React state with all successful uploads.
        setSavedTracks((currentTracks) => [
          ...uploadedTracks,
          ...currentTracks,
        ]);

        if (failedFiles.length > 0) {
          console.log(failedFiles);
          alert(`${uploadedTracks.length} uploaded; ${failedFiles.length} failed.`);
        } else {
          alert(`${uploadedTracks.length} song(s) uploaded successfully.`);
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

  return (
    <>
      <nav>
        <button onClick={showSignUp}>Sign Up</button>
        <button onClick={showPlayer}>Player</button>
        <button onClick={showSignIn}>Sign In</button>
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
          savedTracks={savedTracks}
          signedIn={signedIn}
        />
      }
      {currentScreen == "sign-in" && <SignIn setSignedIn={setSignedIn} />}
    </>
  );
}

export default App;
