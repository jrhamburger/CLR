import { supabase } from "./supabase.js"

export async function recordHistory(userId, trackId) {
    const { error } = await supabase
        .from("listening_hist")
        .insert({
            user_id: userId,
            track_id: trackId,
            played_at: new Date().toISOString(),
        });
        
    if (error) {
        throw new Error(`Could not record listening history: ${error.message}`);
    }
}