import HorizontalCarousel from "./HorizontalCarousel.jsx";
import VideoCard from "./VideoCard.jsx";
import "../styles/CategoryRow.css";

export default function CategoryRow({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className='category-row'>
      <h2>{title}</h2>
      <HorizontalCarousel>
        {items.map((m) => (
          <VideoCard key={m.id} item={m} />
        ))}
      </HorizontalCarousel>
    </section>
  );
}
