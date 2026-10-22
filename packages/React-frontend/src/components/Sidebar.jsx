import {
  House,
  MagnifyingGlass,
  MusicNotes,
  Heart,
  ChartBar,
  Stack,
  SidebarSimple,
  MusicNote,
} from "@phosphor-icons/react";
import "../styles/Sidebar.css";

// screen: null means the page doesn't exist yet, so the link does nothing
const NAV_ITEMS = [
  { label: "Home", icon: House, screen: "home" },
  { label: "Search", icon: MagnifyingGlass, screen: null },
  { label: "Genres", icon: MusicNotes, screen: null },
  { label: "Favorites", icon: Heart, screen: null },
  { label: "Taste Profile", icon: ChartBar, screen: null },
  { label: "Collections", icon: Stack, screen: null },
];

function Sidebar({ isOpen, onToggle, currentScreen, onNavigate, currentSong }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <SidebarSimple size={22} />
      </button>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ label, icon: Icon, screen }) => (
          <button
            key={label}
            className={`sidebar-link ${screen && currentScreen === screen ? "active" : ""}`}
            onClick={() => screen && onNavigate(screen)}
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
            <MusicNote size={isOpen ? 40 : 22} />
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
