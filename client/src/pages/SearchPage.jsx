import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useDebounced } from "../hooks/useDebounced";
import VideoCard from "../components/VideoCard.jsx";
import "../styles/SearchPage.css";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const category = params.get("category") || "";

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [allCategories, setAllCategories] = useState([]);

  const debouncedQuery = useDebounced(q, 250);
  const isDebouncing = q !== debouncedQuery;
  const hasQuery = Boolean(debouncedQuery || category);

  // load categories once
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const categoriesList = await apiGet("/categories", {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setAllCategories(categoriesList || []);
        }
      } catch (e) {
        if (e.name !== "AbortError" && !controller.signal.aborted) {
          setAllCategories([]);
        }
      }
    })();
    return () => controller.abort();
  }, []);

  // fetch videos when filters change
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      // if raw filters are empty, clear immediately (no fetch)
      if (!q && !category) {
        setErr(null);
        setVideos([]);
        setLoading(false);
        return;
      }
      // if we have raw q but the debounced value hasn't caught up yet, do nothing and let debounce finish instead of firing a fetch.
      if (!debouncedQuery && q) return;

      setLoading(true);
      setErr(null);
      try {
        const searchParams = new URLSearchParams();
        if (debouncedQuery) {
          searchParams.set("q", debouncedQuery);
        }
        if (category) {
          searchParams.set("category", category);
        }
        searchParams.set("limit", "50");

        const data = await apiGet(`/videos?${searchParams.toString()}`, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setVideos(data.results || []);
        }
      } catch (e) {
        if (e.name !== "AbortError" && !controller.signal.aborted) {
          setErr(e.message || "Search failed");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();
    return () => controller.abort();
  }, [q, debouncedQuery, category]);

  const handleQueryChange = (e) => {
    const value = e.target.value;
    const urlParams = new URLSearchParams(params);
    if (value) {
      urlParams.set("q", value);
    } else {
      urlParams.delete("q");
    }
    setParams(urlParams);
  };

  const handleCategoryToggle = (name) => {
    const urlParams = new URLSearchParams(params);
    if (name === category) {
      urlParams.delete("category");
    } else {
      urlParams.set("category", name);
    }
    setParams(urlParams);
  };

  const handleClearFilters = () => {
    const urlParams = new URLSearchParams(params);
    urlParams.delete("q");
    urlParams.delete("category");
    setParams(urlParams);
  };

  return (
    <main className='container'>
      <h2>Search Movies:</h2>

      <form className='search-form' onSubmit={(e) => e.preventDefault()}>
        <input
          className='search'
          placeholder='Search titles…'
          value={q}
          onChange={handleQueryChange}
        />
      </form>

      <div className='category-filters'>
        {allCategories.map((name) => (
          <button
            key={name}
            type='button'
            onClick={() => handleCategoryToggle(name)}
            className={`filter-pill ${name === category ? "active" : ""}`}
          >
            {name}
          </button>
        ))}
        {(q || category) && (
          <button
            type='button'
            onClick={handleClearFilters}
            className='filter-pill clear'
          >
            Clear
          </button>
        )}
      </div>

      {err && !loading && !isDebouncing && <div>{err}</div>}

      {videos.length > 0 && (
        <div className='videos-grid'>
          {videos.map((m) => (
            <VideoCard key={m.id} item={m} />
          ))}
        </div>
      )}

      {!loading && !isDebouncing && !err && hasQuery && videos.length === 0 && (
        <div>No results.</div>
      )}
    </main>
  );
}
