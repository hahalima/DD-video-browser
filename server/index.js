import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import fs from "node:fs/promises";
import path from "node:path";

const app = express();

// middleware
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

// loading data from json files
let categories = [];
let titles = [];
let titlesById = new Map(); // for fast /videos/:id calls, ok for static dataset

try {
  const categoriesPath = path.resolve("data/categories.json");
  const titlesPath = path.resolve("data/titles.json");

  const [categoriesRawData, titlesRawData] = await Promise.all([
    fs.readFile(categoriesPath, "utf8"),
    fs.readFile(titlesPath, "utf8"),
  ]);

  const parsedTitles = JSON.parse(titlesRawData);
  titles = parsedTitles.titles ?? [];

  const parsedCategories = JSON.parse(categoriesRawData);
  categories = parsedCategories.categories ?? [];

  titlesById = new Map(titles.map((t) => [t.id, t]));
  console.log(
    `Loaded ${titles.length} titles across ${categories.length} categories`,
  );
} catch (err) {
  console.error("Failed to load data files", err);
  process.exit(1);
}

// health check
app.get("/health", (req, res) => res.json({ ok: true, service: "api" }));

// main endpoints
app.get("/categories", (_req, res) => {
  res.json(categories);
});

app.get("/videos", (req, res) => {
  // const { category, type, q } = req.query;

  // normalize query params to strings
  const categoryQuery =
    typeof req.query.category === "string" ? req.query.category : "";
  const typeQuery = typeof req.query.type === "string" ? req.query.type : "";
  const searchQuery = typeof req.query.q === "string" ? req.query.q : "";

  // handle cases where page or limit are not strings representing numbers
  const pageStr = typeof req.query.page === "string" ? req.query.page : "";
  const limitStr = typeof req.query.limit === "string" ? req.query.limit : "";
  let page = Number.parseInt(pageStr || "1", 10); // avoid 0 or negatives
  if (!Number.isFinite(page) || page <= 0) {
    page = 1;
  }
  let limit = Number.parseInt(limitStr || "20", 10); // have range of 1-100
  if (!Number.isFinite(limit) || limit <= 0) {
    limit = 20;
  }
  if (limit > 100) {
    limit = 100;
  }

  const start = (page - 1) * limit;

  let results = titles;

  if (categoryQuery) {
    results = results.filter((t) => t.categories?.includes(categoryQuery));
  }
  if (typeQuery) {
    results = results.filter((t) => t.type === typeQuery);
  }
  if (searchQuery) {
    const searchTerm = searchQuery.toLowerCase();
    results = results.filter((t) =>
      (t.title ?? "").toLowerCase().includes(searchTerm),
    );
  }

  const total = results.length;
  const totalPages = total ? Math.ceil(total / limit) : 0;
  const pageResults = results.slice(start, start + limit);

  res.json({ total, page, limit, totalPages, results: pageResults });
});

app.get("/videos/:id", (req, res) => {
  const { id } = req.params;

  const item = titlesById.get(id);
  if (!item) return res.status(404).json({ error: "Not Found" });
  res.json(item);
});

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
