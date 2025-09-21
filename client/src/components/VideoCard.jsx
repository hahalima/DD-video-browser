import { Link } from "react-router-dom";
import "../styles/VideoCard.css";
import { formatRuntime } from "../utils/formatRuntime";

export default function VideoCard({ item }) {
  const src = item.backdropUrl || item.posterUrl;
  const year = item.date ? new Date(item.date).getFullYear() : null;
  const rating = Number.isFinite(item.rating) ? item.rating.toFixed(1) : null;
  const runtime = formatRuntime(item.runtime);
  
  return (
    <Link to={`/video/${item.id}`} className="card">
      <img className="card-media" src={src} alt={item.title} loading="lazy" />
      <div className="card-body">
        <div className="card-title" title={item.title}>
          {item.title}
        </div>
        <div className="card-metadata">
          {year && <span>{year}</span>}
          {rating && <span>★ {rating}</span>}
          {runtime && <span>{runtime}</span>}
        </div>
      </div>
    </Link>
  );
}
