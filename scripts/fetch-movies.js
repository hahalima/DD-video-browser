import "dotenv/config";
import fs from "node:fs/promises";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
if (!TMDB_API_KEY) {
  console.error("Missing TMDB_API_KEY in .env");
  process.exit(1);
}

// map each category/genre string with TMDB's internal id
const MOVIE_CATEGORIES_BY_ID = {
  "Action": 28,
  "Adventure": 12,
  "Animation": 16,
  "Comedy": 35,
  "Mystery": 9648,
  "Drama": 18,
  "Science Fiction": 878
};

const CATEGORIES = Object.keys(MOVIE_CATEGORIES_BY_ID);
const TMDB_API_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const ITEMS_PER_CATEGORY = Number(process.env.ITEMS_PER_CATEGORY || 35);
const MAX_PAGES = Number(process.env.MAX_PAGES || 5);
const MIN_VOTES = Number(process.env.MIN_VOTES || 300);

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchMoviesByCategory(category, moviesById) {
  const selectedIdsForCategory = new Set();
  const genreId = MOVIE_CATEGORIES_BY_ID[category];

  for (let page = 1; selectedIdsForCategory.size < ITEMS_PER_CATEGORY && page <= MAX_PAGES; page++) {
    const qs = new URLSearchParams({
      "with_genres": String(genreId),
      "sort_by": "popularity.desc",
      "vote_count.gte": String(MIN_VOTES),
      "include_adult": "false",
      "language": "en-US",
      "region": "US",
      "page": String(page),
      "api_key": TMDB_API_KEY
    });

    let data;
    try {
      data = await getJson(`${TMDB_API_BASE_URL}/discover/movie?${qs}`);
    } catch (err) {
      console.error(`/discover/movie failed for ${category} page ${page}:`, err.message);
      break;
    }

    const results = data.results || [];
    if (!results.length) break;

    for (const movie of results) {
      if (selectedIdsForCategory.size >= ITEMS_PER_CATEGORY) break;
      if (!movie?.id || !movie.poster_path) continue;

      const id = `movie:${movie.id}`; // add an id prefix to guarantee uniqueness
      const categories = CATEGORIES.filter((name) =>
        (movie.genre_ids || []).includes(MOVIE_CATEGORIES_BY_ID[name])
      );

      if (moviesById.has(id)) {  // handle case when a movie is in multiple categories
        const existingMovie= moviesById.get(id);
          const mergedCategories = [
            ...new Set([...(existingMovie.categories ?? []), ...categories])
          ];
        moviesById.set(id, { ...existingMovie, categories: mergedCategories });
        selectedIdsForCategory.add(id);
        continue;
      }

      let runtime = null;
      try {
        const detailQueryParams = new URLSearchParams({ "api_key": TMDB_API_KEY, "language": "en-US" });
        const detail = await getJson(`${TMDB_API_BASE_URL}/movie/${movie.id}?${detailQueryParams}`);
        runtime = (typeof detail.runtime === "number" && detail.runtime > 0) ? detail.runtime : null;
      } catch (err) {
        console.error(`/movie/:id failed for ${category} page ${page}:`, err.message);
      }
      const rating = (typeof movie.vote_average === "number") ? movie.vote_average : null;

      const obj = {
        id,
        tmdbId: movie.id,
        type: "movie",
        title: movie.title || movie.name,
        description: movie.overview || "",
        date: movie.release_date || null,
        posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}/w342${movie.poster_path}` : null,
        backdropUrl: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}/w780${movie.backdrop_path}` : null,
        categories,
        rating,
        runtime
      };

      moviesById.set(id, obj);
      selectedIdsForCategory.add(id);
    }
  }

  if (selectedIdsForCategory.size < ITEMS_PER_CATEGORY) {
    console.warn(`Only ${selectedIdsForCategory.size}/${ITEMS_PER_CATEGORY} for ${category}.`);
  }
}

async function main() {
  const moviesById = new Map();
  for (const category of CATEGORIES) {
    console.log(`Fetching ${category}…`);
    await fetchMoviesByCategory(category, moviesById);
  }

  const titles = Array.from(moviesById.values());
  await fs.writeFile(
    "data/titles.json",
    JSON.stringify({ titles }, null, 2),
    "utf8"
  );

  console.log(`Done! Wrote data/titles.json. Total titles: ${titles.length}.`);
}

main().catch((err) => { 
  console.error(err); 
  process.exit(1); 
});