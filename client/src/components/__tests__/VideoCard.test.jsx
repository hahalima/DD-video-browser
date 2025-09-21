import "@testing-library/jest-dom";
import { screen, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import VideoCard from "../VideoCard.jsx";

function renderCard(overrides = {}) {
  const item = {
    id: "movie:27205",
    title: "Inception",
    date: "2010-07-16",
    rating: 8.37,
    runtime: 148, // 2h 28m
    backdropUrl: "/img/backdrop.jpg",
    posterUrl: "/img/poster.jpg",
    ...overrides,
  };
  const ui = (
    <MemoryRouter>
      <VideoCard item={item} />
    </MemoryRouter>
  );

  const utils = render(ui);
  return { item, ...utils };
}

describe("VideoCard", () => {
  test("renders title, image with alt, and link href", () => {
    const { item } = renderCard();

    // Title
    expect(screen.getByText(item.title)).toBeInTheDocument();

    // Image alt + src
    const img = screen.getByRole("img", { name: item.title });
    expect(img).toHaveAttribute("src", item.backdropUrl);
    expect(img).toHaveAttribute("alt", item.title);
    expect(img).toHaveAttribute("loading", "lazy");

    // Link targets /video/:id
    const link = screen.getByRole("link", { name: item.title });
    expect(link).toHaveAttribute("href", `/video/${item.id}`);
  });

  test("shows year, rating (★), and formatted runtime", () => {
    renderCard();
    expect(screen.getByText("2010")).toBeInTheDocument(); // from date
    expect(screen.getByText("★ 8.4")).toBeInTheDocument(); // toFixed(1)
    expect(screen.getByText("2h 28m")).toBeInTheDocument(); // 148 mins
  });

  test("prefers backdropUrl over posterUrl, falls back when absent", () => {
    const { item, rerender } = renderCard();
    // with backdrop
    expect(screen.getByRole("img", { name: item.title })).toHaveAttribute(
      "src",
      item.backdropUrl,
    );

    // now rerender same container with no backdrop -> poster fallback
    const next = {
      ...item,
      backdropUrl: undefined,
      posterUrl: "/img/poster-only.jpg",
    };
    rerender(
      <MemoryRouter>
        <VideoCard item={next} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("img", { name: item.title })).toHaveAttribute(
      "src",
      "/img/poster-only.jpg",
    );
  });

  test("renders metadata in order: year → rating → runtime", () => {
    const { item } = renderCard(); // has date, rating, runtime

    const year = screen.getByText("2010"); // from item.date
    const rating = screen.getByText("★ 8.4"); // toFixed(1)
    const run = screen.getByText("2h 28m"); // 148 mins

    // helper to assert node A is followed by node B in the DOM
    const isBefore = (a, b) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

    expect(isBefore(year, rating)).toBe(true);
    expect(isBefore(rating, run)).toBe(true);
  });

  test("hides optional metadata when missing", () => {
    renderCard({ date: null, rating: null, runtime: 0 });

    // No year or star/rating or runtime text
    expect(screen.queryByText(/^\d{4}$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^★/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\dh \d+m/)).not.toBeInTheDocument();
  });
});
