import express from "express";
import { generateCollections } from "../services/collectionsService.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const collections = await generateCollections(userId);

        res.json(collections);
    } catch (error) {
        console.error("Failed to generate collections:", error);
        res.status(500).json({ error: "Could not generate collections" });
    }
});

export default router;