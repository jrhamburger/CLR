import express from "express";
import { searchCatalog } from "../services/musicCatalogService.js";

const router = express.Router();

router.get("/search", async (req, res) => {
    try {
        const query = req.query.q?.trim();

        if (!query) {
            return res.status(400).json({ error: "A search query is required." });
        }

        const tracks = await searchCatalog(query);

        res.json({ tracks });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Catalog search failed." });
    }
});

export default router;