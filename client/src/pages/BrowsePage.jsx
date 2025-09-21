import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import CategoryRow from "../components/CategoryRow.jsx";

const MOVIE = "movie"; // focusing on movies for MVP1, tv series later
const LIMIT_PER_CATEGORY = 20;

export default function BrowsePage() {
  const [categoryNames, setCategoryNames] = useState([]);
  const [videosByCategory, setVideosByCategory] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const categories = await apiGet("/categories", {
          signal: controller.signal,
        });

        const pairs = await Promise.all(
          categories.map(async (category) => {
            const data = await apiGet(
              `/videos?category=${encodeURIComponent(category)}&type=${MOVIE}&limit=${LIMIT_PER_CATEGORY}`,
              { signal: controller.signal },
            );
            return [category, data.results];
          }),
        );
        if (!controller.signal.aborted) {
          setCategoryNames(categories);
          setVideosByCategory(Object.fromEntries(pairs));
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          setError(e.message || "Failed to load");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  if (isLoading) {
    return <main className='container'>Loading…</main>;
  }
  if (error) {
    return <main className='container'>{error}</main>;
  }

  return (
    <main className='container'>
      {categoryNames.map((category) => (
        <CategoryRow
          key={category}
          title={`${category} Movies`}
          items={videosByCategory[category] || []}
        />
      ))}
    </main>
  );
}
