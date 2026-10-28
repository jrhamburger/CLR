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
import { SCREENS } from "../constants/screens";
import "../styles/Sidebar.css";

// screen values come from constants/screens.js
const NAV_ITEMS = [
  { label: "Home", icon: HouseIcon, screen: SCREENS.HOME },
  { label: "Search", icon: MagnifyingGlassIcon, screen: SCREENS.SEARCH },
  { label: "Genres", icon: MusicNotesIcon, screen: SCREENS.GENRES },
  { label: "Favorites", icon: HeartIcon, screen: SCREENS.FAVORITES },
  { label: "Taste Profile", icon: ChartBarIcon, screen: SCREENS.TASTE_PROFILE },
  { label: "Collections", icon: StackIcon, screen: SCREENS.COLLECTIONS },
  { label: "Socials", icon: UsersThreeIcon, screen: SCREENS.SOCIALS },
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
