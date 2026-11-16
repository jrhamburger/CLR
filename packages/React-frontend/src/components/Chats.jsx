import { useState, useEffect } from "react";
import {
  fetchRecentMessages,
  subscribeToIncoming
} from "../lib/socials";
import Avatar from "./Avatar";
import ChatConversation from "./ChatConversation";
import "../styles/Socials.css";

function otherUser(msg, userId) {
  return msg.from_user === userId ? msg.to_user : msg.from_user;
}

// Maps each friend's id to the newest message between you
function latestByFriend(messages, userId) {
  const latest = {};
  for (const msg of messages) {
    const otherId = otherUser(msg, userId);
    if (!latest[otherId]) latest[otherId] = msg;
  }
  return latest;
}

function Chats({ userId, friends }) {
  const [latest, setLatest] = useState({});
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRecentMessages(userId).then(({ data, error }) => {
      if (error) setMessage(error.message);
      else setLatest(latestByFriend(data, userId));
    });

    return subscribeToIncoming(
      `chat-list-${userId}`,
      userId,
      (msg) =>
        setLatest((current) => ({
          ...current,
          [otherUser(msg, userId)]: msg
        }))
    );
  }, [userId]);

  function recordLatest(msg) {
    setLatest((current) => ({
      ...current,
      [otherUser(msg, userId)]: msg
    }));
  }

  if (selected) {
    return (
      <ChatConversation
        key={selected.friend_id}
        userId={userId}
        friend={selected}
        onBack={() => setSelected(null)}
        onSent={recordLatest}
      />
    );
  }

  // Most recent conversation first; friends you haven't messaged last
  const sorted = [...friends].sort((a, b) => {
    const aTime = latest[a.friend_id]?.created_at ?? "";
    const bTime = latest[b.friend_id]?.created_at ?? "";
    return bTime.localeCompare(aTime);
  });

  return (
    <section className="socials-section">
      <h2 className="socials-heading">Chats</h2>

      {message && <p className="socials-message">{message}</p>}

      {friends.length === 0 && (
        <p className="socials-empty">
          No friends yet — add someone in the Friends tab to
          start chatting
        </p>
      )}

      <ul className="socials-list">
        {sorted.map((friend) => {
          const last = latest[friend.friend_id];
          return (
            <li key={friend.friend_id}>
              <button
                className="socials-card chat-row"
                onClick={() => setSelected(friend)}>
                <Avatar
                  userName={friend.users?.user_name}
                  userId={friend.friend_id}
                />
                <span className="socials-name share-details">
                  <span>{friend.users?.user_name}</span>
                  <span className="chat-preview">
                    {last
                      ? `${last.from_user === userId ? "You: " : ""}${last.body}`
                      : "No messages yet"}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default Chats;
