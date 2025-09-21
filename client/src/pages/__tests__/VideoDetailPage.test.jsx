import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import VideoDetailPage from '../VideoDetailPage.jsx';

// Mock the API
import { apiGet } from '../../lib/api';
jest.mock('../../lib/api', () => ({ apiGet: jest.fn() }));

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path='/video/:id' element={<VideoDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  jest.clearAllMocks();
});

test('shows Loading… then renders video details and category badges', async () => {
  const mock = {
    id: 'movie:27205',
    title: 'Inception',
    description: 'A mind-bending heist.',
    type: 'movie',
    date: '2010-07-16',
    rating: 8.37,
    runtime: 148,
    backdropUrl: '/img/backdrop.jpg',
    posterUrl: '/img/poster.jpg',
    categories: ['Action', 'Science Fiction'],
  };
  apiGet.mockResolvedValueOnce(mock);

  renderAt('/video/movie:27205');

  // initial state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // success state
  expect(
    await screen.findByRole('heading', { name: /inception/i }),
  ).toBeInTheDocument();
  // metadata bits (type uppercased, year, star, runtime)
  expect(screen.getByText(/MOVIE/)).toBeInTheDocument();
  expect(screen.getByText('2010')).toBeInTheDocument();
  expect(screen.getByText('★ 8.4')).toBeInTheDocument();
  expect(screen.getByText('2h 28m')).toBeInTheDocument();

  // hero image
  const img = screen.getByRole('img', { name: /inception/i });
  expect(img).toHaveAttribute('src', mock.backdropUrl);

  // category badges (links)
  expect(screen.getByRole('link', { name: 'Action' })).toHaveAttribute(
    'href',
    '/search?category=Action',
  );
  expect(screen.getByRole('link', { name: 'Science Fiction' })).toHaveAttribute(
    'href',
    '/search?category=Science%20Fiction',
  );
});

test('shows error when fetch fails', async () => {
  apiGet.mockRejectedValueOnce(new Error('Boom'));
  renderAt('/video/movie:1');

  // initial
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // error
  expect(await screen.findByText(/boom/i)).toBeInTheDocument();
});

test('shows "Not found." when API returns null', async () => {
  // Your apiGet throws on non-OK, but if it resolved null somehow, page shows "Not found."
  apiGet.mockResolvedValueOnce(null);
  renderAt('/video/movie:404');

  expect(await screen.findByText(/not found\./i)).toBeInTheDocument();
});

test('Play button calls alert (simulated playback)', async () => {
  const mock = {
    id: 'movie:2',
    title: 'Test Movie',
    type: 'movie',
    date: '2020-01-01',
    rating: 7.0,
    runtime: 90,
    backdropUrl: '/img/hero.jpg',
    categories: [],
    description: 'desc',
  };
  apiGet.mockResolvedValueOnce(mock);

  const spy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  renderAt('/video/movie:2');

  const play = await screen.findByRole('button', { name: /play/i });
  play.click();
  expect(spy).toHaveBeenCalled();

  spy.mockRestore();
});
