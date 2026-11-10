import { getUserTracks } from "../../../Express-backend/src/api/library";
import { supabase } from "../lib/supabase";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShareNetworkIcon } from "@phosphor-icons/react";
import ShareTrackDialog from "./ShareTrackDialog";

import "../styles/Home.css";

function Home({ session, onStartQueue }) {
  const [username, setUsername] = useState("");
  const [tracks, setTracks] = useState([]);
  const [trackMessage, setTrackMessage] = useState("");
  const [rotations, setRotations] = useState({});
  const [sharing, setSharing] = useState(null);

  //Fetching the Username from personal.users.username
  useEffect(() => {
    supabase
      .from("users")
      .select("user_name")
      .eq("user_id", session.user.id)
      .single()
      .then(({ data }) => setUsername(data?.user_name ?? ""));
  }, [session]);

  // Fetches the tracks that the user owns
  useEffect(() => {
    async function loadTracks() {
      try {
        const userTracks = await getUserTracks(
          session.access_token
        );
        setTracks(userTracks);
      } catch (error) {
        setTrackMessage(error.message);
      }
    }

    loadTracks();
  }, [session]);

  return (
    <div>
      <h2>Welcome, {username}</h2>
      <h2>Home</h2>

      <section>
        <h3>Your Music</h3>

        {tracks.length === 0 && (
          <p>You have not uploaded any tracks yet.</p>
        )}

        <section className="track-grid">
          {tracks.map((track, index) => (
            // Share sits beside the card because buttons can't nest
            <div className="track-card-wrapper" key={track.id}>
              <motion.button
                className="track-card"
                type="button"
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotateY: rotations[track.id] || 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
                whileHover={{
                  y: -10,
                  scale: 1.04,
                  rotateY: 360,
                }}
                whileTap={{
                  scale: 0.95,
                  y: 4,
                  transition: {
                    type: "spring",
                    duration: 0.1,
                    bounce: 0,
                  },
                }}
                onClick={() => onStartQueue(tracks, index)}
              >
                <img
                  src={track.coverArtUrl}
                  alt={`${track.title} cover art`}
                  className="user-track-cover"
                />
                <p>{track.title}</p>
                <p>{track.artists}</p>
              </motion.button>

              <button
                className="track-share"
                type="button"
                title="Share with a friend"
                onClick={() => setSharing(track)}
              >
                <ShareNetworkIcon size={16} />
              </button>
            </div>
          ))}
        </section>

        {trackMessage && <p>{trackMessage}</p>}
      </section>

      {sharing && (
        <ShareTrackDialog
          session={session}
          track={sharing}
          onClose={(shared) => {
            if (shared) setTrackMessage(`Shared "${sharing.title}".`);
            setSharing(null);
          }}
        />
      )}
    </div>
  );
}

export default Home;
