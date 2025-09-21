import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import SearchPage from "../SearchPage.jsx";
import { apiGet } from "../../lib/api";

jest.mock("../../lib/api", () => ({ apiGet: jest.fn() }));

function renderAt(path = "/search") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path='/search' element={<SearchPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

test("typing updates the URL params (via useSearchParams) and shows results after debounce", async () => {
  // 1st call: /categories
  apiGet.mockResolvedValueOnce(["Action", "Comedy"]);
  // 2nd call: /videos?q=inc
  apiGet.mockResolvedValueOnce({
    results: [
      {
        id: "movie:1",
        title: "Inc",
        date: "2020-01-01",
        rating: 7.0,
        runtime: 100,
        backdropUrl: "/img/b.jpg",
        posterUrl: "/img/p.jpg",
      },
    ],
  });

  renderAt("/search");

  // IMPORTANT: bind userEvent to fake timers
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  const input = screen.getByPlaceholderText(/search titles/i);
  await user.type(input, "inc");

  // Let the 250ms debounce elapse
  await act(async () => {
    jest.advanceTimersByTime(300);
  });

  // Assert a result renders
  const link = await screen.findByRole("link", { name: "Inc" });
  expect(link).toHaveAttribute("href", "/video/movie:1");

  // (Optional) Sanity-check that the second api call was for /videos
  expect(apiGet).toHaveBeenLastCalledWith(
    expect.stringMatching(/^\/videos\?/),
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  );
});
