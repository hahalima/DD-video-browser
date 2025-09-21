import '@testing-library/jest-dom';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import HorizontalCarousel from '../HorizontalCarousel';

// ---- helpers ----
function mockViewportLayout(
  viewport,
  { clientWidth, scrollWidth, slideWidth, start = 0 },
) {
  // Give JSDOM the sizes it doesn't have
  Object.defineProperty(viewport, 'clientWidth', {
    value: clientWidth,
    configurable: true,
  });
  Object.defineProperty(viewport, 'scrollWidth', {
    value: scrollWidth,
    configurable: true,
  });
  Object.defineProperty(viewport, 'scrollLeft', {
    value: start,
    writable: true,
    configurable: true,
  });

  // First slide width (used by the component to compute step)
  const firstSlide = viewport.querySelector('.carousel-slide');
  if (firstSlide) {
    firstSlide.getBoundingClientRect = () => ({
      width: slideWidth,
      height: 200,
      top: 0,
      left: 0,
      right: slideWidth,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON() {},
    });
  }

  // Stub scrollBy to update scrollLeft and fire a 'scroll' event
  viewport.scrollBy = jest.fn(({ left }) => {
    const max = viewport.scrollWidth - viewport.clientWidth;
    const next = Math.max(0, Math.min(viewport.scrollLeft + left, max));
    viewport.scrollLeft = next;
    viewport.dispatchEvent(new Event('scroll'));
  });
}

function renderCarousel({ childrenCount = 10, scrollBySlides = 3 } = {}) {
  const kids = Array.from({ length: childrenCount }, (_, i) => (
    <div key={i}>Card {i + 1}</div>
  ));
  render(
    <HorizontalCarousel scrollBy={scrollBySlides}>{kids}</HorizontalCarousel>,
  );
  const viewport = document.querySelector('.carousel-viewport');
  const prev = screen.getByRole('button', { name: /previous/i });
  const next = screen.getByRole('button', { name: /next/i });
  return { viewport, prev, next };
}

// ---- tests ----
test('clicking Next/Prev scrolls by slide widths', async () => {
  const { viewport, prev, next } = renderCarousel({ scrollBySlides: 3 });

  // Step = 3 slides * 300px = 900
  // Total content = 3600, viewport = 900, so we have exactly 3 steps to the end
  mockViewportLayout(viewport, {
    clientWidth: 900,
    scrollWidth: 3600,
    slideWidth: 300,
    start: 0,
  });

  // Trigger initial update in the component
  await act(async () => {
    window.dispatchEvent(new Event('resize'));
  });

  // Next: +900
  fireEvent.click(next);
  expect(viewport.scrollBy).toHaveBeenLastCalledWith({
    left: 900,
    behavior: 'smooth',
  });

  // Prev: -900
  fireEvent.click(prev);
  expect(viewport.scrollBy).toHaveBeenLastCalledWith({
    left: -900,
    behavior: 'smooth',
  });
});

test('disables Prev at start, disables Next at end, re-enables when moving back', async () => {
  const { viewport, prev, next } = renderCarousel({ scrollBySlides: 3 });

  mockViewportLayout(viewport, {
    clientWidth: 900,
    scrollWidth: 3600, // end after 3 steps
    slideWidth: 300,
    start: 0,
  });

  // Let the component compute button states
  await act(async () => {
    window.dispatchEvent(new Event('resize'));
  });

  // Start: prev disabled, next enabled
  expect(prev).toBeDisabled();
  expect(next).toBeEnabled();

  // Go to the end (3 steps)
  fireEvent.click(next);
  fireEvent.click(next);
  fireEvent.click(next);

  // Wait for the "end" state
  await waitFor(() => {
    expect(next).toBeDisabled();
    expect(prev).toBeEnabled();
  });

  // Go back one step; next should re-enable (not at the edge anymore)
  fireEvent.click(prev);
  await waitFor(() => {
    expect(next).toBeEnabled();
  });

  // Go back to the very start; prev should disable again
  fireEvent.click(prev);
  fireEvent.click(prev);
  await waitFor(() => {
    expect(prev).toBeDisabled();
  });
});
