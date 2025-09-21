import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BrowsePage from '../BrowsePage.jsx';
import { apiGet } from '../../lib/api';

jest.mock('../../lib/api', () => ({ apiGet: jest.fn() }));

// simple factory for video items
function makeVideo(id, title) {
  return {
    id,
    title,
    date: '2020-01-01',
    rating: 7.5,
    runtime: 100,
    backdropUrl: '/img/b.jpg',
    posterUrl: '/img/p.jpg',
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <BrowsePage />
    </MemoryRouter>,
  );
}

describe('BrowsePage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('loads categories and renders one row per category with items', async () => {
    // 1st call: /categories
    apiGet.mockResolvedValueOnce(['Action', 'Drama']);
    // Next calls (order not guaranteed because Promise.all):
    apiGet.mockResolvedValueOnce({
      results: [makeVideo('v1', 'Action One'), makeVideo('v2', 'Action Two')],
    });
    apiGet.mockResolvedValueOnce({ results: [makeVideo('v3', 'Drama One')] });

    renderPage();

    // Rows (headings) appear
    const actionHeading = await screen.findByRole('heading', {
      level: 2,
      name: 'Action Movies',
    });
    const dramaHeading = await screen.findByRole('heading', {
      level: 2,
      name: 'Drama Movies',
    });

    expect(actionHeading).toBeInTheDocument();
    expect(dramaHeading).toBeInTheDocument();

    // Each row contains its video cards (we can assert links by title)
    const actionRow = actionHeading.closest('section');
    expect(
      within(actionRow).getByRole('link', { name: 'Action One' }),
    ).toHaveAttribute('href', '/video/v1');
    expect(
      within(actionRow).getByRole('link', { name: 'Action Two' }),
    ).toHaveAttribute('href', '/video/v2');

    const dramaRow = dramaHeading.closest('section');
    expect(
      within(dramaRow).getByRole('link', { name: 'Drama One' }),
    ).toHaveAttribute('href', '/video/v3');

    // Sanity: API was called with expected endpoints
    expect(apiGet).toHaveBeenCalledWith('/categories', expect.any(Object));
    expect(apiGet).toHaveBeenCalledWith(
      expect.stringMatching(/^\/videos\?category=Action&/),
      expect.any(Object),
    );
    expect(apiGet).toHaveBeenCalledWith(
      expect.stringMatching(/^\/videos\?category=Drama&/),
      expect.any(Object),
    );
  });

  test('shows error state when categories request fails', async () => {
    apiGet.mockRejectedValueOnce(new Error('Boom'));

    renderPage();

    const err = await screen.findByText(/boom|failed to load/i);
    expect(err).toBeInTheDocument();
  });
});
