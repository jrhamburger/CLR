import { useState, useEffect } from "react";
import { fetchFriends, shareTrack } from "../lib/socials";
import Avatar from "./Avatar";
import "../styles/Socials.css";

function ShareTrackDialog({ session, track, onClose }) {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendId, setFriendId] = useState(null);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFriends(session.user.id).then(({ data, error }) => {
      setLoading(false);
      if (error) setMessage(error.message);
      else setFriends(data);
    });
  }, [session]);

  async function handleShare(event) {
    event.preventDefault();
    if (!friendId) return;

    setSending(true);
    const { error } = await shareTrack(
      session.user.id,
      friendId,
      track.id,
      note.trim()
    );
    setSending(false);

    if (error) {
      setMessage(`Couldn't share: ${error.message}`);
      return;
    }

    onClose(true);
  }

  return (
    <div
      className="share-backdrop"
      onClick={() => onClose(false)}>
      <form
        className="share-dialog"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleShare}>
        <h2 className="socials-heading">
          Share "{track.title}"
        </h2>

        {loading && (
          <p className="socials-empty">Loading friends…</p>
        )}

        {!loading && friends.length === 0 && (
          <p className="socials-empty">
            No friends yet — add some in Socials first
          </p>
        )}

        <ul className="socials-list share-friends">
          {friends.map((friend) => (
            <li key={friend.friend_id}>
              <label
                className={
                  friendId === friend.friend_id
                    ? "socials-card share-friend share-friend--selected"
                    : "socials-card share-friend"
                }>
                <input
                  type="radio"
                  name="share-friend"
                  checked={friendId === friend.friend_id}
                  onChange={() => setFriendId(friend.friend_id)}
                />
                <Avatar
                  userName={friend.users?.user_name}
                  userId={friend.friend_id}
                />
                <span className="socials-name">
                  {friend.users?.user_name}
                </span>
              </label>
            </li>
          ))}
        </ul>

        <input
          className="socials-search share-note"
          type="text"
          placeholder="Add a note (optional)"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />

        {message && (
          <p className="socials-message">{message}</p>
        )}

        <div className="socials-actions share-buttons">
          <button
            type="button"
            className="socials-button"
            onClick={() => onClose(false)}>
            Cancel
          </button>
          <button
            type="submit"
            className="socials-button socials-button--primary"
            disabled={!friendId || sending}>
            {sending ? "Sharing…" : "Share"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ShareTrackDialog;
