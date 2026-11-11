import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

function Collections() {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      const response = await fetch("/api/collections", {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error("Could not load collections.");
      }

      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h2>Collections</h2>

      {isLoading ? (
        <p>Building your collections...</p>
      ) : (
        <section>
          {collections.map((collection) => (
            <div key={collection.id}>
              <h2>{collection.title}</h2>
              <p>{collection.description}</p>

              {collection.tracks.map((track) => (
                <p key={track.id}>
                  {track.title} — {track.artist}
                </p>
              ))}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default Collections;

// import { useMemo, useState } from "react";
// import "../styles/Collections.css";

// const filters = ["Mood", "Genre", "Energy", "Evolving"];

// const collectionSeeds = [
//   {
//     id: "discoveries",
//     label: "New\nDiscoveries",
//     tone: "gold",
//     x: 0,
//     y: 18,
//     w: 29,
//     h: 27
//   },
//   {
//     id: "late-night",
//     label: "Late-Night\nElectronic",
//     sublabel: "18 tracks",
//     tone: "violet",
//     featured: true,
//     x: 28,
//     y: 21,
//     w: 45,
//     h: 45
//   },
//   {
//     id: "comfort",
//     label: "Comfort Zone",
//     tone: "peach",
//     x: 63,
//     y: 2,
//     w: 31,
//     h: 30
//   },
//   {
//     id: "energy",
//     label: "High Energy",
//     tone: "red",
//     x: 70,
//     y: 41,
//     w: 25,
//     h: 28
//   },
//   {
//     id: "indie",
//     label: "Indie /\nAlternative",
//     tone: "slate",
//     x: -2,
//     y: 56,
//     w: 31,
//     h: 29
//   },
//   {
//     id: "soulful",
//     label: "Soulful & Warm",
//     tone: "orange",
//     x: 23,
//     y: 72,
//     w: 27,
//     h: 26
//   },
//   {
//     id: "dreamy",
//     label: "Dreamy",
//     tone: "lilac",
//     x: 47,
//     y: 75,
//     w: 26,
//     h: 25
//   },
//   {
//     id: "focus",
//     label: "Deep Focus",
//     tone: "teal",
//     x: 71,
//     y: 76,
//     w: 25,
//     h: 27
//   }
// ];

// const demoTracks = [
//   ["Midnight Drift", "Kairo", "4:32", "violet"],
//   ["Glass Horizon", "Telen.", "5:21", "lilac"],
//   ["Falling Light", "Auralis", "4:08", "blue"],
//   ["Parallel Minds", "Noctil", "6:17", "slate"]
// ];

// function splitLabel(label) {
//   return label
//     .split("\n")
//     .map((line, index) => (
//       <span key={line + index}>{line}</span>
//     ));
// }

// export default function CollectionsTasteMap({
//   onPlayCollection,
//   onTrackSelect,
//   initialCollection = "late-night"
// }) {
//   const [activeFilter, setActiveFilter] = useState("Mood");
//   const [selectedId, setSelectedId] = useState(
//     initialCollection
//   );
//   const selected = useMemo(
//     () =>
//       collectionSeeds.find(
//         (collection) => collection.id === selectedId
//       ) ?? collectionSeeds[1],
//     [selectedId]
//   );

//   const selectCollection = (collection) =>
//     setSelectedId(collection.id);

//   return (
//     <main className="taste-map-screen">
//       <section
//         className="taste-map-workspace"
//         aria-labelledby="collections-heading">
//         <header className="taste-map-heading">
//           <h1 id="collections-heading">Your Collections</h1>
//           <p>
//             Built around your taste, listening patterns, and
//             discoveries.
//           </p>
//           <div
//             className="taste-map-tabs"
//             role="tablist"
//             aria-label="Collection grouping">
//             {filters.map((filter) => (
//               <button
//                 className={
//                   activeFilter === filter ? "is-active" : ""
//                 }
//                 key={filter}
//                 onClick={() => setActiveFilter(filter)}
//                 role="tab"
//                 aria-selected={activeFilter === filter}>
//                 {filter}
//               </button>
//             ))}
//           </div>
//         </header>

//         <div
//           className="map-stage"
//           aria-label={`${activeFilter} collection map`}>
//           <svg
//             className="map-connections"
//             viewBox="0 0 1000 760"
//             preserveAspectRatio="none"
//             aria-hidden="true">
//             <path d="M32 224 C145 144 182 298 302 232 S411 202 448 248" />
//             <path d="M143 210 C83 374 273 354 242 493 S407 603 488 644" />
//             <path d="M502 235 C626 166 620 84 708 96 S819 212 781 320" />
//             <path d="M510 414 C657 419 634 511 738 529 S806 609 812 664" />
//             <path d="M236 498 C345 456 478 558 551 631 S736 689 761 631" />
//             <path d="M695 315 C619 405 747 394 752 499" />
//             <path d="M179 636 C178 693 267 735 329 695" />
//           </svg>

//           {collectionSeeds.map((collection) => (
//             <button
//               type="button"
//               key={collection.id}
//               className={`collection-orb orb-${collection.tone} ${collection.featured ? "is-featured" : ""} ${selected.id === collection.id ? "is-selected" : ""}`}
//               style={{
//                 "--x": `${collection.x}%`,
//                 "--y": `${collection.y}%`,
//                 "--w": `${collection.w}%`,
//                 "--h": `${collection.h}%`
//               }}
//               onClick={() => selectCollection(collection)}
//               aria-pressed={selected.id === collection.id}>
//               <span className="orb-art" />
//               <span className="orb-copy">
//                 <span className="orb-label">
//                   {splitLabel(collection.label)}
//                 </span>
//                 {collection.sublabel && (
//                   <span className="orb-sublabel">
//                     {collection.sublabel}
//                   </span>
//                 )}
//               </span>
//               {collection.featured && (
//                 <span className="orb-play" aria-hidden="true">
//                   <span />
//                 </span>
//               )}
//               <span className="orb-node" aria-hidden="true">
//                 <i />
//               </span>
//             </button>
//           ))}
//         </div>
//       </section>

//       {/* <aside
//         className="collection-detail"
//         aria-label="Selected collection details">
//         <div className={`detail-art orb-${selected.tone}`}>
//           <span />
//         </div>
//         <h2>{selected.label.replace("\n", " ")}</h2>
//         <p>
//           Atmospheric tracks for when you want something
//           immersive.
//         </p>
//         <div className="detail-actions">
//           <button
//             className="detail-play"
//             onClick={() => onPlayCollection?.(selected)}
//             aria-label={`Play ${selected.label}`}>
//             <span />
//           </button>
//           <button
//             className="play-label"
//             onClick={() => onPlayCollection?.(selected)}>
//             Play Collection
//           </button>
//           <button
//             className="more-button"
//             aria-label="More collection options">
//             •••
//           </button>
//         </div>
//         <div className="detail-rule" />
//         <ol className="track-list">
//           {demoTracks.map(([title, artist, duration, tone]) => (
//             <li key={title}>
//               <button
//                 onClick={() =>
//                   onTrackSelect?.({ title, artist, duration })
//                 }>
//                 <span className={`track-cover orb-${tone}`}>
//                   <i />
//                 </span>
//                 <span className="track-copy">
//                   <b>{title}</b>
//                   <small>{artist}</small>
//                 </span>
//                 <small className="track-duration">
//                   {duration}
//                 </small>
//                 <span className="track-more" aria-hidden="true">
//                   •••
//                 </span>
//               </button>
//             </li>
//           ))}
//         </ol>
//       </aside> */}
//     </main>
//   );
// }
