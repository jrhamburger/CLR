import {
  HouseIcon,
  MagnifyingGlassIcon,
  MusicNotesIcon,
  HeartIcon,
  ChartBarIcon,
  StackIcon,
  UsersThreeIcon,
  SidebarSimpleIcon,
  MusicNoteIcon,
} from "@phosphor-icons/react";
import "../styles/Sidebar.css";

// screen must match a currentScreen value handled in App.jsx
const NAV_ITEMS = [
  { label: "Home", icon: HouseIcon, screen: "home" },
  { label: "Search", icon: MagnifyingGlassIcon, screen: "search" },
  { label: "Genres", icon: MusicNotesIcon, screen: "genres" },
  { label: "Favorites", icon: HeartIcon, screen: "favorites" },
  { label: "Taste Profile", icon: ChartBarIcon, screen: "taste-profile" },
  { label: "Collections", icon: StackIcon, screen: "collections" },
  { label: "Socials", icon: UsersThreeIcon, screen: "socials" },
];

function Sidebar({ isOpen, onToggle, currentScreen, onNavigate, currentSong }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <SidebarSimpleIcon size={22} />
      </button>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ label, icon: Icon, screen }) => (
          <button
            key={label}
            className={`sidebar-link ${currentScreen === screen ? "active" : ""}`}
            onClick={() => onNavigate(screen)}
            title={label}
          >
            <Icon size={22} />
            {isOpen && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Now playing: shows coverUrl once songs have metadata, placeholder until then */}
      <div className="sidebar-now-playing">
        <div className="sidebar-cover">
          {currentSong?.coverUrl ? (
            <img src={currentSong.coverUrl} alt={currentSong.title} />
          ) : (
            <MusicNoteIcon size={isOpen ? 40 : 22} />
          )}
        </div>
        {isOpen && (
          <p className="sidebar-song-title">
            {currentSong?.title ?? "Nothing playing"}
          </p>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
