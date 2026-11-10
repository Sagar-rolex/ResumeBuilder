import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(express.json());
app.get("/", (_req, res) => res.send("Server is live..."));

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server is running on port ${PORT}`));