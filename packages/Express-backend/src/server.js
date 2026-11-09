import express from 'express';
import cors from 'cors';
import "dotenv/config";

import catalogRoutes from "./routes/catalogRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import listeningHistoryRoutes from "./routes/listeningHistoryRoutes.js";
import collectionsRouter from "./routes/collections.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/api/catalog", catalogRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/listening-history", listeningHistoryRoutes);
app.use("/api/collections", collectionsRouter);

app.get("/api/health", (req, res) => {
    res.json({ message: "Backend is running" });
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});