import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiGet } from "../lib/api";
import { formatRuntime } from "../utils/formatRuntime";
import "../styles/VideoDetailPage.css";

export default function VideoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await apiGet(`/videos/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setVideoInfo(data);
        }
      } catch (e) {
        if (e.name !== "AbortError" && !controller.signal.aborted) {
          setErr(e.message || "Failed to load");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();
    
    return () => controller.abort(); // cancel in-flight request on unmount or id change
  }, [id]);

  if (loading) return <main className="container">Loading…</main>;
  if (err) return <main className="container error-text">{err}</main>;
  if (!videoInfo) return <main className="container">Not found.</main>;

  const year = videoInfo.date ? new Date(videoInfo.date).getFullYear() : null;
  const runtime = formatRuntime(videoInfo.runtime);
  const rating = Number.isFinite(videoInfo.rating) ? videoInfo.rating.toFixed(1) : null;
  const bannerImage = videoInfo.backdropUrl || videoInfo.posterUrl;

  return (
    <main className="container">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="back-button"
        aria-label="Go back"
      >
        ← Back
      </button>

      <div className="media-container video-detail-banner">
        {bannerImage && <img src={bannerImage} alt={videoInfo.title} loading="eager"/>}
      </div>

      <h1 className="video-detail-title">{videoInfo.title}</h1>

      <div className="video-detail-metadata">
        {videoInfo.type && <span>{videoInfo.type.toUpperCase()}</span>}
        {year && <span>{year}</span>}
        {rating && <span>★ {rating}</span>}
        {runtime && <span>{runtime}</span>}
      </div>

      <div className="category-badges">
        {(videoInfo.categories || []).map((category) => (
          <Link
            key={category}
            to={`/search?category=${encodeURIComponent(category)}`}
            className="category-badge"
          >
            {category}
          </Link>
        ))}
      </div>

      <p className="video-description">
        {videoInfo.description || "No description available."}
      </p>

      <button
        type="button"
        className="play-video-button"
        onClick={() => alert("Simulate playing video!")}
        aria-label="Play Video"
      >
        ▶ Play
      </button>
    </main>
  );
}