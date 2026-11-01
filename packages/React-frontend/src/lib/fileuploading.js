import { parseBlob } from "music-metadata";
import { supabase } from "./supabase";

const AUDIO_BUCKET = "audio-files";
const COVER_ART_BUCKET = "cover-art";

// 1) Storage path for an upload: <userId>/<random id>-<cleaned file name>
// The random id keeps two uploads with the same name from overwriting each other.
export function buildAudioPath(userId, fileName) {
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    return `${userId}/${crypto.randomUUID()}-${safeFileName}`;
}

function buildCoverArtPath(userId, picture) {
    const extension = 
        picture.format === "image/png" ? "png" :
        picture.format === "image/webp" ? "webp" :
        "jpg";

    return `${userId}/${crypto.randomUUID()}.${extension}`;
}

async function extractTrackMetadata(file) {
    const fallbackTitle = file.name.replace(/\.[^/.]+$/, "");

    try {
        const { common } = await parseBlob(file);

        return {
            title: common.title ?? fallbackTitle,
            artists: common.artist ?? common.artists?.join(", ") ?? "Unknown artist",
            album: common.album ?? null,
            genre: common.genre?.[0] ?? null,
            picture: common.picture?.[0] ?? null,
        };
    } catch (error) {
        console.warn(`Could not read metadata from ${file.name}:`, error);

        return {
            title: fallbackTitle,
            artists: "Unknown artist",
            album: null,
            genre: null,
            picture: null,
        };
    }
}

// 2) Upload one file: storage -> tracks row -> user's library.
// Returns { track } on success or { error } on failure. Never throws.
// If a later step fails, earlier steps are undone so nothing is left half-saved.
export async function uploadFile(file, userId) {
    if (!file.type.startsWith("audio/")) {
        return { error: `${file.name} is not an audio file.` };
    }

    const audioPath = buildAudioPath(userId, file.name);

    try {
        // Attempts to upload audio into storage bucket
        const { error: uploadError } = await supabase.storage
            .from(AUDIO_BUCKET)
            .upload(audioPath, file, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error(uploadError);
            return { error: `Could not upload ${file.name}.` };
        }

        const metadata = await extractTrackMetadata(file);
        let coverArtPath = null;

        // Audio is safely uploaded now.
        // If the track contains embedded cover art, upload that image too.
        if (metadata.picture) {
            coverArtPath = buildCoverArtPath(userId, metadata.picture);

            const coverArtBlob = new Blob(
                [metadata.picture.data],
                { type: metadata.picture.format }
            );

            const { error: coverArtUploadError } = await supabase.storage
                .from(COVER_ART_BUCKET)
                .upload(coverArtPath, coverArtBlob, {
                    contentType: metadata.picture.format,
                    upsert: false,
                });

            if (coverArtUploadError) {
                console.error(coverArtUploadError);
                await supabase.storage.from(AUDIO_BUCKET).remove([audioPath]);
                return { error: `Could not upload cover art for ${file.name}.`};
            }
        }

        // Insert the database row after after both uploads succeed
        const { data: track, error: trackError } = await supabase
            .from("tracks")
            .insert({
                title: metadata.title,
                artists: metadata.artists,
                album: metadata.album,
                genre: metadata.genre,
                source: "upload",
                owner_id: userId,
                audio_path: audioPath,
                cover_art_url: coverArtPath,
            })
            .select()
            .single();

        if (trackError) {
            console.error(trackError);
            await supabase.storage.from(AUDIO_BUCKET).remove([audioPath]);
            return { error: `Could not save ${file.name}'s track information.` };
        }

        const { error: libraryError } = await supabase
            .from("user_tracks")
            .insert({ user_id: userId, track_id: track.id });

        if (libraryError) {
            console.error(libraryError);
            await supabase.from("tracks").delete().eq("id", track.id);
            await supabase.storage.from(AUDIO_BUCKET).remove([audioPath]);
            return { error: `Could not add ${file.name} to the library.` };
        }

        return { track };
    } catch (error) {
        // e.g. network dropped mid-upload
        console.error(error);
        return { error: `Could not upload ${file.name}.` };
    }
}

// 3) Upload a list of files. Each file is independent: one failing
// doesn't stop or undo the others.
// onProgress(doneCount, totalCount) is called each time a file finishes, pass or fail.
// Returns { uploaded: [tracks], failed: [error messages] }
export async function uploadFiles(files, userId, onProgress) {
    let doneCount = 0;

    const results = await Promise.all(
        files.map(async (file) => {
            const result = await uploadFile(file, userId);
            doneCount++;
            onProgress?.(doneCount, files.length);
            return result;
        })
    );

    return {
        uploaded: results.filter((result) => result.track).map((result) => result.track),
        failed: results.filter((result) => result.error).map((result) => result.error),
    };
}
