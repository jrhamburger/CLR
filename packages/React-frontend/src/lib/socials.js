import { supabase } from "./supabase";

export function fetchIncoming(userId) {
  return supabase
    .from("friend")
    .select(
      "user_id, created_at, users!friend_user_id_fkey(user_name)"
    )
    .eq("friend_id", userId)
    .eq("status", "pending");
}

export function fetchFriends(userId) {
  return supabase
    .from("friend")
    .select("friend_id, users!friend_friend_id_fkey(user_name)")
    .eq("user_id", userId)
    .eq("status", "accepted");
}

export function fetchBlocked(userId) {
  return supabase
    .from("blocked")
    .select(
      "blocked_id, users!blocked_blocked_id_fkey(user_name)"
    )
    .eq("user_id", userId);
}

export function searchUsers(query, userId) {
  return supabase
    .from("users")
    .select("user_id, user_name")
    .ilike("user_name", `%${query}%`)
    .neq("user_id", userId)
    .limit(10);
}

// RLS only accepts the insert when friendId is an accepted friend
export function shareTrack(userId, friendId, trackId, note) {
  return supabase.from("shared_tracks").insert({
    from_user: userId,
    to_user: friendId,
    track_id: trackId,
    note: note || null
  });
}

export function fetchSharedWithMe(userId) {
  return supabase
    .from("shared_tracks")
    .select(
      `
      id,
      note,
      created_at,
      from_user,
      users!shared_tracks_from_user_fkey(user_name),
      tracks(id, title, artists, album, cover_art_url)
    `
    )
    .eq("to_user", userId)
    .order("created_at", { ascending: false });
}

export function saveToLibrary(userId, trackId) {
  return supabase
    .from("user_tracks")
    .insert({ user_id: userId, track_id: trackId });
}

export function dismissShare(shareId) {
  return supabase
    .from("shared_tracks")
    .delete()
    .eq("id", shareId);
}

// Newest first, so the first hit per friend is their latest message
export function fetchRecentMessages(userId) {
  return supabase
    .from("messages")
    .select("id, from_user, to_user, body, created_at")
    .or(`from_user.eq.${userId},to_user.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(500);
}

export function fetchConversation(userId, friendId) {
  return supabase
    .from("messages")
    .select("id, from_user, to_user, body, created_at")
    .or(
      `and(from_user.eq.${userId},to_user.eq.${friendId}),` +
        `and(from_user.eq.${friendId},to_user.eq.${userId})`
    )
    .order("created_at", { ascending: true });
}

// RLS only accepts the insert when friendId is an accepted friend
export function sendMessage(userId, friendId, body) {
  return supabase
    .from("messages")
    .insert({ from_user: userId, to_user: friendId, body })
    .select("id, from_user, to_user, body, created_at")
    .single();
}

// Calls onMessage for each new message sent to userId; returns
// an unsubscribe function
export function subscribeToIncoming(
  channelName,
  userId,
  onMessage
) {
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `to_user=eq.${userId}`
      },
      (payload) => onMessage(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
