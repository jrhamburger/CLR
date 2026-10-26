import { supabase } from "../lib/supabase.js";

export async function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Missing authorization token" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ error: "Invalid session" });
    }

    req.user = data.user;
    next();
}