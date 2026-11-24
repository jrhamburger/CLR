# CLR
Team project for CSC3100
Team Members: Andy Cai, Jonathan Resendiz

We're creating a customizable music-collection web app where users can explore approved music, organize songs into themed collections or playlists, tag and favorite songs, and personalize the look of their library. It will have a playful and interactive UI. Users will be able to upload their own music and the app will have the full capabilities of a music player.

## TE7: Testing

- **Red:** Added a test requiring the current track to stay first in the shuffled order. Confirmed it failed.
- **Green:** Updated `createShuffleOrder()` to accept the current track index and place it first. All five tests passed.
- **Refactor:** Removed duplicate swapping logic from `App.jsx` and passed the current track index into the helper.
