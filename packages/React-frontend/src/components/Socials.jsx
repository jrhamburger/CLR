import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  fetchIncoming,
  fetchFriends,
  fetchBlocked,
  searchUsers,
  fetchSharedWithMe,
  saveToLibrary,
  dismissShare
} from "../lib/socials";
import Avatar from "./Avatar";
import Chats from "./Chats";
import "../styles/Socials.css";

const SEARCH_DELAY_MS = 300;

// Postgres unique-violation code, e.g. a track already in user_tracks
const DUPLICATE_KEY = "23505";

function SectionHeading({ title, count, attention }) {
  return (
    <h2 className="socials-heading">
      {title}
      <span
        className={
          attention
            ? "socials-count socials-count--attention"
            : "socials-count"
        }>
        {count}
      </span>
    </h2>
  );
}

function Socials({ session: sessionProp }) {
  // App.jsx doesn't pass session to this screen, so fall back to the client
  const [fetchedSession, setFetchedSession] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [incoming, setIncoming] = useState([]);
  const [friends, setFriends] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [shared, setShared] = useState([]);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("friends");

  const session = sessionProp ?? fetchedSession;
  const userId = session?.user.id;

  useEffect(() => {
    if (sessionProp) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setFetchedSession(data.session));
  }, [sessionProp]);

  useEffect(() => {
    if (!userId) return;
    loadIncoming();
    loadFriends();
    loadBlocked();
    loadShared();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Debounced search: waits for typing to pause before querying
  useEffect(() => {
    const trimmed = query.trim();
    if (!userId || !trimmed) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const { data, error } = await searchUsers(
        trimmed,
        userId
      );
      if (cancelled) return;
      setSearching(false);
      if (error) setMessage(error.message);
      else setResults(data);
    }, SEARCH_DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, userId]);

  // Loading starts on the keystroke; the effect above sends the query
  function handleQueryChange(value) {
    setQuery(value);
    if (value.trim()) {
      setSearching(true);
    } else {
      setResults([]);
      setSearching(false);
    }
  }

  async function loadIncoming() {
    const { data, error } = await fetchIncoming(userId);
    if (error) setMessage(error.message);
    else setIncoming(data);
  }

  async function loadFriends() {
    const { data, error } = await fetchFriends(userId);
    if (error) setMessage(error.message);
    else setFriends(data);
  }

  async function loadBlocked() {
    const { data, error } = await fetchBlocked(userId);
    if (error) setMessage(error.message);
    else setBlocked(data);
  }

  async function loadShared() {
    const { data, error } = await fetchSharedWithMe(userId);
    if (error) setMessage(error.message);
    else setShared(data);
  }

  async function handleSave(share) {
    const { error } = await saveToLibrary(
      userId,
      share.tracks.id
    );

    if (error?.code === DUPLICATE_KEY) {
      setMessage(`"${share.tracks.title}" is already saved.`);
      return;
    }
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      `Saved "${share.tracks.title}" to your library.`
    );
  }

  async function handleDismiss(shareId) {
    const { error } = await dismissShare(shareId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("");
    loadShared();
  }

  async function handleAdd(user) {
    const { error } = await supabase.from("friend").insert({
      user_id: userId,
      friend_id: user.user_id,
      status: "pending"
    });

    if (error) {
      setMessage(
        `Couldn't send a request to ${user.user_name}: ${error.message}`
      );
      return;
    }

    setMessage(`Friend request sent to ${user.user_name}.`);
  }

  async function handleAccept(requesterId) {
    const { error } = await supabase.rpc(
      "accept_friend_request",
      { requester: requesterId }
    );

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("");
    loadIncoming();
    loadFriends();
  }

  async function handleDeny(requesterId) {
    const { error } = await supabase.rpc(
      "deny_friend_request",
      {
        requester: requesterId
      }
    );

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("");
    loadIncoming();
  }

  async function handleRemove(friend) {
    const name = friend.users?.user_name;
    if (!window.confirm(`Remove ${name} from your friends?`))
      return;

    const { error } = await supabase.rpc("remove_friend", {
      other: friend.friend_id
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("");
    loadFriends();
  }

  async function handleBlock(friend) {
    const name = friend.users?.user_name;
    if (!window.confirm(`Block ${name}?`)) return;

    const { error } = await supabase.rpc("block_user", {
      target: friend.friend_id
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("");
    loadFriends();
    loadIncoming();
    loadBlocked();
  }

  async function handleUnblock(blockedId) {
    const { error } = await supabase
      .from("blocked")
      .delete()
      .eq("user_id", userId)
      .eq("blocked_id", blockedId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("");
    loadBlocked();
  }

  if (!session) return <p>Loading…</p>;

  return (
    <div className="socials">
      <h2>Socials</h2>

      <div className="socials-tabs" role="tablist">
        {[
          ["friends", "Friends"],
          ["chats", "Chats"]
        ].map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            className={
              tab === value
                ? "socials-tab socials-tab--active"
                : "socials-tab"
            }
            onClick={() => setTab(value)}>
            {label}
          </button>
        ))}
      </div>

      {message && <p className="socials-message">{message}</p>}

      {tab === "chats" ? (
        <Chats userId={userId} friends={friends} />
      ) : (
        <>
          <section className="socials-section">
            <h2 className="socials-heading">Find people</h2>
            <input
              className="socials-search"
              type="text"
              placeholder="Search by username"
              value={query}
              onChange={(event) =>
                handleQueryChange(event.target.value)
              }
            />

            {searching && (
              <p className="socials-empty">Searching…</p>
            )}

            {!searching &&
              query.trim() &&
              results.length === 0 && (
                <p className="socials-empty">
                  No users match "{query.trim()}"
                </p>
              )}

            {!searching && results.length > 0 && (
              <ul className="socials-list">
                {results.map((user) => (
                  <li
                    className="socials-card"
                    key={user.user_id}>
                    <Avatar
                      userName={user.user_name}
                      userId={user.user_id}
                    />
                    <span className="socials-name">
                      {user.user_name}
                    </span>
                    <div className="socials-actions">
                      <button
                        className="socials-button socials-button--primary"
                        onClick={() => handleAdd(user)}>
                        Add friend
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            className={
              incoming.length > 0
                ? "socials-section socials-section--attention"
                : "socials-section"
            }>
            <SectionHeading
              title="Requests"
              count={incoming.length}
              attention={incoming.length > 0}
            />

            {incoming.length === 0 && (
              <p className="socials-empty">
                No pending requests
              </p>
            )}

            <ul className="socials-list">
              {incoming.map((request) => (
                <li
                  className="socials-card"
                  key={request.user_id}>
                  <Avatar
                    userName={request.users?.user_name}
                    userId={request.user_id}
                  />
                  <span className="socials-name">
                    <strong>{request.users?.user_name}</strong>{" "}
                    wants to connect
                  </span>
                  <div className="socials-actions">
                    <button
                      className="socials-button socials-button--primary"
                      onClick={() =>
                        handleAccept(request.user_id)
                      }>
                      Accept
                    </button>
                    <button
                      className="socials-button"
                      onClick={() =>
                        handleDeny(request.user_id)
                      }>
                      Deny
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="socials-section">
            <SectionHeading
              title="Shared with you"
              count={shared.length}
            />

            {shared.length === 0 && (
              <p className="socials-empty">
                Nothing shared with you yet
              </p>
            )}

            <ul className="socials-list">
              {shared.map((share) => (
                <li
                  className="socials-card socials-card--share"
                  key={share.id}>
                  <Avatar
                    userName={share.users?.user_name}
                    userId={share.from_user}
                  />
                  <div className="socials-name share-details">
                    <span>
                      <strong>{share.users?.user_name}</strong>{" "}
                      shared {share.tracks?.title}
                      {share.tracks?.artists &&
                        ` — ${share.tracks.artists}`}
                    </span>
                    {share.note && (
                      <span className="share-note-text">
                        "{share.note}"
                      </span>
                    )}
                  </div>
                  <div className="socials-actions">
                    <button
                      className="socials-button socials-button--primary"
                      onClick={() => handleSave(share)}
                      disabled={!share.tracks}>
                      Save to library
                    </button>
                    <button
                      className="socials-button"
                      onClick={() => handleDismiss(share.id)}>
                      Dismiss
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="socials-section">
            <SectionHeading
              title="Friends"
              count={friends.length}
            />

            {friends.length === 0 && (
              <p className="socials-empty">
                No friends yet — search for someone above
              </p>
            )}

            <ul className="socials-list">
              {friends.map((friend) => (
                <li
                  className="socials-card"
                  key={friend.friend_id}>
                  <Avatar
                    userName={friend.users?.user_name}
                    userId={friend.friend_id}
                  />
                  <span className="socials-name">
                    {friend.users?.user_name}
                  </span>
                  <div className="socials-actions">
                    <button
                      className="socials-button"
                      onClick={() => handleRemove(friend)}>
                      Remove
                    </button>
                    <button
                      className="socials-button socials-button--danger"
                      onClick={() => handleBlock(friend)}>
                      Block
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="socials-section">
            <SectionHeading
              title="Blocked"
              count={blocked.length}
            />

            {blocked.length === 0 && (
              <p className="socials-empty">
                You haven't blocked anyone
              </p>
            )}

            <ul className="socials-list">
              {blocked.map((entry) => (
                <li
                  className="socials-card"
                  key={entry.blocked_id}>
                  <Avatar
                    userName={entry.users?.user_name}
                    userId={entry.blocked_id}
                  />
                  <span className="socials-name">
                    {entry.users?.user_name}
                  </span>
                  <div className="socials-actions">
                    <button
                      className="socials-button"
                      onClick={() =>
                        handleUnblock(entry.blocked_id)
                      }>
                      Unblock
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

export default Socials;
