import "@testing-library/jest-dom";
import { render, screen, within, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../Header.jsx";

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );
}

test("renders brand and nav links with correct hrefs", () => {
  renderAt("/");
  const nav = screen.getByRole("navigation");
  const home = within(nav).getByRole("link", { name: /home/i });
  const search = within(nav).getByRole("link", { name: /search/i });
  const brand = screen.getByRole("link", { name: /video browser/i });

  expect(brand).toHaveAttribute("href", "/");
  expect(home).toHaveAttribute("href", "/");
  expect(search).toHaveAttribute("href", "/search");
  cleanup();
});

test("marks Home as active on '/' and Search as active on '/search'", () => {
  // First render at "/"
  renderAt("/");
  let nav = screen.getByRole("navigation");
  let home = within(nav).getByRole("link", { name: /home/i });
  let search = within(nav).getByRole("link", { name: /search/i });

  expect(home).toHaveClass("active");
  expect(home).toHaveAttribute("aria-current", "page");
  expect(search).not.toHaveClass("active");
  expect(search).not.toHaveAttribute("aria-current");

  cleanup();

  // Fresh render at "/search"
  renderAt("/search");
  nav = screen.getByRole("navigation");
  home = within(nav).getByRole("link", { name: /home/i });
  search = within(nav).getByRole("link", { name: /search/i });

  expect(search).toHaveClass("active");
  expect(search).toHaveAttribute("aria-current", "page");
  expect(home).not.toHaveClass("active");
  expect(home).not.toHaveAttribute("aria-current");
  cleanup();
});
