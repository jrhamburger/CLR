import { supabase } from "./supabase";

const AUDIO_BUCKET = "audio-files";

// 1) Storage path for an upload: <userId>/<random id>-<cleaned file name>
// The random id keeps two uploads with the same name from overwriting each other.
export function buildAudioPath(userId, fileName) {
    const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    return `${userId}/${crypto.randomUUID()}-${safeFileName}`;
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

        const title = file.name.replace(/\.[^/.]+$/, "");

        const { data: track, error: trackError } = await supabase
            .from("tracks")
            .insert({ title, owner_id: userId, audio_path: audioPath })
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
