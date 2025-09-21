import { useRef, useState, useEffect, Children } from "react";
import "../styles/HorizontalCarousel.css";

export default function HorizontalCarousel({ children, scrollBy = 3 }) {
  const viewportRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = () => {
    const el = viewportRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    update();
    const el = viewportRef.current;
    if (!el) return;

    const onScroll = () => update();
    el.addEventListener("scroll", onScroll);

    const onResize = () => update();
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handlePrev = () => {
    const el = viewportRef.current;
    if (!el) return;
    const slide = el.querySelector(".carousel-slide");
    const w = slide ? slide.getBoundingClientRect().width : 280;
    el.scrollBy({ left: -w * scrollBy, behavior: "smooth" });
  };

  const handleNext = () => {
    const el = viewportRef.current;
    if (!el) return;
    const slide = el.querySelector(".carousel-slide");
    const w = slide ? slide.getBoundingClientRect().width : 280;
    el.scrollBy({ left: w * scrollBy, behavior: "smooth" });
  };

  return (
    <div className="carousel">
      <button
        className="arrow prev"
        onClick={handlePrev}
        disabled={!canPrev}
        aria-label="Previous"
      >
        ‹
      </button>

      <div className="carousel-viewport" ref={viewportRef}>
        <div className="carousel-track">
          {Children.map(children, (child, i) => (
            <div className="carousel-slide" key={child?.key ?? i}>
              {child}
            </div>
          ))}
        </div>
      </div>

      <button
        className="arrow next"
        onClick={handleNext}
        disabled={!canNext}
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
}