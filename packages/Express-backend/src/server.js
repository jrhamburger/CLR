import express from 'express';
import cors from 'cors';
import "dotenv/config";

import catalogRoutes from "./routes/catalogRoutes.js"

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/api/catalog", catalogRoutes);

app.get("/api/health", (req, res) => {
    res.json({ message: "Backend is running" });
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});