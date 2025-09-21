import { render, screen } from "@testing-library/react";
import CategoryRow from "../CategoryRow.jsx";

// Mock the carousel so we can assert it renders and forwards children
jest.mock("../HorizontalCarousel.jsx", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid='hc'>{children}</div>,
}));

// Mock the card to a simple anchor; avoids needing a router in this test
jest.mock("../VideoCard.jsx", () => ({
  __esModule: true,
  default: ({ item }) => (
    <a data-testid='video-card' href={`/video/${item.id}`}>
      {item.title}
    </a>
  ),
}));

describe("CategoryRow", () => {
  test("renders nothing when items are empty or missing", () => {
    const { container, rerender } = render(
      <CategoryRow title='Action Movies' items={[]} />,
    );
    expect(container.firstChild).toBeNull();

    rerender(<CategoryRow title='Action Movies' items={null} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders a heading, a HorizontalCarousel, and one card per item", () => {
    const items = [
      { id: "id1", title: "Movie 1" },
      { id: "id2", title: "Movie 2" },
      { id: "id3", title: "Movie 3" },
    ];

    render(<CategoryRow title='Action Movies' items={items} />);

    // heading
    expect(
      screen.getByRole("heading", { name: "Action Movies", level: 2 }),
    ).toBeInTheDocument();

    // carousel present
    expect(screen.getByTestId("hc")).toBeInTheDocument();

    // one "card" per item
    const cards = screen.getAllByTestId("video-card");
    expect(cards).toHaveLength(items.length);
    // spot-check the first card's link
    expect(cards[0]).toHaveAttribute("href", "/video/id1");
  });
});
