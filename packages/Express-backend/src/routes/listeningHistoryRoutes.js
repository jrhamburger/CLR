
import express from "express";
import { getListeningHistory } from "../services/listeningHistoryService.js";

const router = express.Router();

router.get("/tracks", async (req, res) => {
    try {
        const userId = req.query.userId;
        const history = await getListeningHistory(userId);

        res.json(history);
    } catch (error) {
        res.status(500).json({
            error: "Could not load listening history.",
        });
    }
});

export default router;