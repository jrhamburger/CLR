import { useState, useEffect, useRef } from "react";
import {
  UserCircleIcon,
  UserIcon,
  GearIcon,
  QuestionIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import "../styles/ProfileMenu.css";

// Menu items without an onClick don't do anything yet
function ProfileMenu({ onSignOut }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the popup when clicking anywhere outside it
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (!menuRef.current.contains(event.target)) setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="profile-menu" ref={menuRef}>
      {isOpen && (
        <div className="profile-popup">
          <button><UserIcon size={18} /> Account</button>
          <button><GearIcon size={18} /> Settings</button>
          <button><QuestionIcon size={18} /> Help</button>
          <hr />
          <button onClick={onSignOut}><SignOutIcon size={18} /> Sign out</button>
        </div>
      )}

      <button
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Profile"
      >
        <UserCircleIcon size={32} />
      </button>
    </div>
  );
}

export default ProfileMenu;
