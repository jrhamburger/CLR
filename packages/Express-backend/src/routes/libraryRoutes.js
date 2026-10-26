import { supabase } from "../lib/supabase.js";
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/tracks", requireAuth, async (req, res) => {
  const { data: tracks, error } = await supabase
    .from("tracks")
    .select(
      `
            id,
            title,
            artists,
            album,
            genre,
            external_url,
            cover_art_url,
            audio_path
            
        `
    )
    .eq("owner_id", req.user.id)
    .order("title");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  try {
    const tracksWithAudioUrls = await Promise.all(
      tracks.map(async (track) => {
        const { data: signedUrlData, signedUrlError } =
          await supabase.storage
            .from("audio-files")
            .createSignedUrl(track.audio_path, 60 * 60);

        if (signedUrlError) {
          throw signedUrlError;
        }

        return {
          ...track,
          audioUrl: signedUrlData.signedUrl
        };
      })
    );

    res.json(tracksWithAudioUrls);
  } catch (signedUrlError) {
    console.error("could not create signed audio URLs:", signedUrlError);
    
    res.status(500).json({ error: signedUrlError.message });
  }
});

export default router;
