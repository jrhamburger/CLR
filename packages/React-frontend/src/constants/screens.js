// Single source of truth for every screen the app can show.
// Use these instead of typing the strings, e.g. SCREENS.HOME not "home".
export const SCREENS = Object.freeze({
  SIGN_UP: "sign-up",
  SIGN_IN: "sign-in",
  HOME: "home",
  PLAYLISTS: "playlists",
  PLAYER: "player",
  NOW_PLAYING: "now-playing",
  SEARCH: "search",
  GENRES: "genres",
  FAVORITES: "favorites",
  TASTE_PROFILE: "taste-profile",
  COLLECTIONS: "collections",
  SOCIALS: "socials",
});

const VALID_SCREENS = Object.values(SCREENS);

// Throws on a typo (e.g. SCREENS.PLAYLIST is undefined) instead of
// silently rendering a blank page
export function assertValidScreen(screen) {
  if (!VALID_SCREENS.includes(screen)) {
    throw new Error(`Unknown screen: "${screen}". Add it to SCREENS in constants/screens.js.`);
  }
}
