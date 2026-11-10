import "../styles/Socials.css";

// Mid-tone colours that keep white initials readable in light and dark mode
const PALETTE = [
  "#e5484d",
  "#d6409f",
  "#8e4ec6",
  "#3e63dd",
  "#0d74ce",
  "#12a594",
  "#30a46c",
  "#dc6b19"
];

// Same user id always hashes to the same palette entry
function colourFor(userId) {
  let hash = 0;
  for (const char of userId ?? "") {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function Avatar({ userName, userId }) {
  const initial = (userName ?? "?").charAt(0).toUpperCase();

  return (
    <span
      className="avatar"
      style={{ background: colourFor(userId) }}
      aria-hidden="true">
      {initial}
    </span>
  );
}

export default Avatar;
