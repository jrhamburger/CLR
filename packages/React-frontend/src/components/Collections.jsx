import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  DotsThreeOutline,
  Play,
  Sparkle
} from "@phosphor-icons/react";
import { supabase } from "../lib/supabase.js";
import "../styles/Collections.css";

const MAP_SLOTS = [
  { x: 3, y: 15, w: 29, h: 27, tone: "amber", shape: "one" },
  {
    x: 28,
    y: 19,
    w: 46,
    h: 44,
    tone: "violet",
    shape: "two",
    featured: true
  },
  { x: 67, y: 3, w: 30, h: 29, tone: "rose", shape: "three" },
  { x: 74, y: 44, w: 25, h: 27, tone: "coral", shape: "four" },
  { x: 1, y: 56, w: 30, h: 29, tone: "blue", shape: "five" },
  { x: 25, y: 73, w: 27, h: 25, tone: "orange", shape: "six" },
  { x: 51, y: 76, w: 25, h: 24, tone: "lilac", shape: "seven" },
  { x: 75, y: 75, w: 23, h: 26, tone: "teal", shape: "eight" }
];

function getArtist(track) {
  return track.artist || track.artists || "Unknown artist";
}

function getArtwork(track) {
  return track?.coverArtUrl || track?.cover_art_url || null;
}

function splitTitle(title) {
  const words = title.split(" ");
  if (words.length < 3) return [title];
  const midpoint = Math.ceil(words.length / 2);
  return [
    words.slice(0, midpoint).join(" "),
    words.slice(midpoint).join(" ")
  ];
}

function CollectionArtwork({ collection, className = "" }) {
  const cover = getArtwork(collection.tracks?.[0]);
  return (
    <span
      className={`collection-artwork ${className}`}
      style={
        cover
          ? { "--collection-art": `url("${cover}")` }
          : undefined
      }
      aria-hidden="true">
      <span className="collection-artwork__aurora" />
      <span className="collection-artwork__horizon" />
      <span className="collection-artwork__grain" />
    </span>
  );
}

function Collections({ onStartQueue }) {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    setIsLoading(true);
    setError("");

    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch("/api/collections", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok)
        throw new Error("Could not load collections.");

      const data = await response.json();
      setCollections(data);
      setSelectedId(data[0]?.id ?? null);
    } catch (loadError) {
      console.error(loadError);
      setError(
        "We could not build your collections right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const mappedCollections = useMemo(
    () =>
      collections.map((collection, index) => ({
        ...collection,
        ...MAP_SLOTS[index % MAP_SLOTS.length],
        slotIndex: index
      })),
    [collections]
  );

  const selectedCollection =
    mappedCollections.find(
      (collection) => collection.id === selectedId
    ) || mappedCollections[0];

  function startCollection(collection, trackIndex = 0) {
    if (collection?.tracks?.length)
      onStartQueue?.(collection.tracks, trackIndex);
  }

  if (isLoading) {
    return (
      <main className="collections-screen collections-screen--status">
        <div className="collections-loading-orb" />
        <p>Building your sound worlds...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="collections-screen collections-screen--status">
        <p>{error}</p>
        <button
          className="collections-retry"
          onClick={loadCollections}>
          Try again
        </button>
      </main>
    );
  }

  if (mappedCollections.length === 0) {
    return (
      <main className="collections-screen collections-screen--status">
        <Sparkle size={30} weight="fill" />
        <h1>Your collections are waiting</h1>
        <p>
          Listen to a few tracks and we’ll start shaping
          personalized spaces around your taste.
        </p>
      </main>
    );
  }

  return (
    <main className="collections-screen">
      <section
        className="collections-workspace"
        aria-labelledby="collections-heading">
        <header className="collections-heading">
          <span className="collections-eyebrow">
            <Sparkle size={14} weight="fill" /> PERSONALIZED FOR
            YOU
          </span>
          <h1 id="collections-heading">Your Collections</h1>
          <p>
            Built from your listening patterns, favorite
            artists, and new discoveries.
          </p>
        </header>

        <div
          className="collections-map"
          aria-label="Your collection map">
          <div className="collections-atmosphere collections-atmosphere--one" />
          <div className="collections-atmosphere collections-atmosphere--two" />
          <svg
            className="collection-connections"
            viewBox="0 0 1000 760"
            preserveAspectRatio="none"
            aria-hidden="true">
            <path d="M80 215 C192 125 219 298 364 233 S484 197 526 248" />
            <path d="M171 206 C95 372 297 357 281 501 S413 616 531 652" />
            <path d="M540 238 C653 150 656 88 757 104 S853 214 818 330" />
            <path d="M524 418 C669 423 653 519 754 539 S836 612 838 663" />
            <path d="M269 502 C357 462 482 558 573 638 S749 694 795 637" />
          </svg>

          {mappedCollections.map((collection) => {
            const isSelected =
              selectedCollection?.id === collection.id;
            const titleLines = splitTitle(collection.title);
            const labelStyle = {
              "--x": `${collection.x}%`,
              "--y": `${collection.y}%`,
              "--w": `${collection.w}%`,
              "--h": `${collection.h}%`
            };

            return (
              <motion.article
                key={collection.id}
                className={`collection-blob collection-blob--${collection.tone} collection-blob--${collection.shape} ${collection.featured ? "collection-blob--featured" : ""} ${isSelected ? "is-selected" : ""}`}
                style={labelStyle}
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{
                  opacity: 1,
                  scale: isSelected ? 1.035 : 1
                }}
                transition={{
                  type: "spring",
                  stiffness: 170,
                  damping: 19,
                  delay: collection.slotIndex * 0.07
                }}>
                <button
                  type="button"
                  className="collection-blob__select"
                  onClick={() => setSelectedId(collection.id)}
                  aria-pressed={isSelected}
                  aria-label={`Show ${collection.title}`}
                />
                <span
                  className="collection-blob__media"
                  aria-hidden="true">
                  <CollectionArtwork collection={collection} />
                  <span className="collection-blob__wash" />
                </span>
                <span className="collection-blob__copy">
                  <span className="collection-blob__title">
                    {titleLines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </span>
                  <span className="collection-blob__count">
                    {collection.tracks.length}{" "}
                    {collection.tracks.length === 1
                      ? "track"
                      : "tracks"}
                  </span>
                </span>
                <button
                  type="button"
                  className="collection-blob__node"
                  onClick={() => startCollection(collection)}
                  aria-label={`Play ${collection.title}`}>
                  <i />
                  <Play size={18} weight="fill" />
                </button>
              </motion.article>
            );
          })}
        </div>
      </section>

      <motion.aside
        className="collection-detail"
        aria-label="Selected collection details"
        key={selectedCollection.id}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}>
        <div
          className={`collection-detail__art collection-blob--${selectedCollection.tone}`}>
          <CollectionArtwork collection={selectedCollection} />
          <span className="collection-detail__art-caption">
            YOUR SOUND SPACE
          </span>
        </div>
        <div className="collection-detail__title-row">
          <h2>{selectedCollection.title}</h2>
          <button
            className="collection-detail__more"
            aria-label="More collection options">
            <DotsThreeOutline size={24} weight="bold" />
          </button>
        </div>
        <p className="collection-detail__description">
          {selectedCollection.description}
        </p>
        <button
          className="collection-detail__play"
          onClick={() => startCollection(selectedCollection)}>
          <span>
            <Play size={18} weight="fill" />
          </span>
          Play collection
        </button>
        <div className="collection-detail__rule" />
        <ol className="collection-track-list">
          {selectedCollection.tracks
            .slice(0, 5)
            .map((track, index) => (
              <li key={track.id ?? `${track.title}-${index}`}>
                <button
                  onClick={() =>
                    startCollection(selectedCollection, index)
                  }>
                  <span
                    className={`collection-track-list__cover collection-blob--${selectedCollection.tone}`}>
                    {getArtwork(track) ? (
                      <img src={getArtwork(track)} alt="" />
                    ) : (
                      <CollectionArtwork
                        collection={{ tracks: [track] }}
                      />
                    )}
                  </span>
                  <span className="collection-track-list__copy">
                    <b>{track.title}</b>
                    <small>{getArtist(track)}</small>
                  </span>
                  <Play
                    className="collection-track-list__play"
                    size={15}
                    weight="fill"
                  />
                </button>
              </li>
            ))}
        </ol>
      </motion.aside>
    </main>
  );
}

export default Collections;
