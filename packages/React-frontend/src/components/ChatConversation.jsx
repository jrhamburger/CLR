import { useState, useEffect, useRef } from "react";
import { CaretLeftIcon } from "@phosphor-icons/react";
import {
  fetchConversation,
  sendMessage,
  subscribeToIncoming
} from "../lib/socials";
import Avatar from "./Avatar";
import "../styles/Socials.css";

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function ChatConversation({ userId, friend, onBack, onSent }) {
  const friendId = friend.friend_id;
  const friendName = friend.users?.user_name;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    fetchConversation(userId, friendId).then(
      ({ data, error }) => {
        setLoading(false);
        if (error) setMessage(error.message);
        else setMessages(data);
      }
    );

    return subscribeToIncoming(
      `chat-${userId}-${friendId}`,
      userId,
      (incoming) => {
        if (incoming.from_user !== friendId) return;
        setMessages((current) => [...current, incoming]);
      }
    );
  }, [userId, friendId]);

  // Keep the newest message in view
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setSending(true);
    const { data, error } = await sendMessage(
      userId,
      friendId,
      body
    );
    setSending(false);

    if (error) {
      setMessage(`Couldn't send: ${error.message}`);
      return;
    }

    setMessage("");
    setDraft("");
    setMessages((current) => [...current, data]);
    onSent(data);
  }

  return (
    <section className="socials-section chat">
      <div className="chat-header">
        <button
          className="socials-button chat-back"
          onClick={onBack}
          title="Back to chats">
          <CaretLeftIcon size={14} />
          Back
        </button>
        <Avatar userName={friendName} userId={friendId} />
        <span className="socials-name">{friendName}</span>
      </div>

      <div className="chat-messages" ref={listRef}>
        {loading && <p className="socials-empty">Loading…</p>}

        {!loading && messages.length === 0 && (
          <p className="socials-empty">
            No messages yet — say hi to {friendName}
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.from_user === userId
                ? "chat-bubble chat-bubble--mine"
                : "chat-bubble"
            }>
            <span>{msg.body}</span>
            <span className="chat-time">
              {formatTime(msg.created_at)}
            </span>
          </div>
        ))}
      </div>

      {message && <p className="socials-message">{message}</p>}

      <form className="chat-compose" onSubmit={handleSend}>
        <input
          className="socials-search chat-input"
          type="text"
          placeholder={`Message ${friendName}`}
          value={draft}
          maxLength={2000}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          type="submit"
          className="socials-button socials-button--primary"
          disabled={!draft.trim() || sending}>
          Send
        </button>
      </form>
    </section>
  );
}

export default ChatConversation;
