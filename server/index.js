import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";

const app = express();

// middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

// health check
app.get("/health", (req, res) => res.json({ ok: true, service: "api" }));

// 404 + error handlers (after routes)
app.use((req, res) => res.status(404).json({ error: "Not Found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server Error" });
});

// start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});