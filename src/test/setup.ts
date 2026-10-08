// Shared setup for the `dom` test project.
import { afterEach } from 'vitest';
import { cleanup } from '@solidjs/testing-library';
import '@testing-library/jest-dom/vitest';

afterEach(() => cleanup());

// jsdom has no matchMedia (used for prefers-color-scheme / reduced motion).
// Always "no match"; tests needing a specific answer stub it themselves.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// jsdom has no ResizeObserver or real layout (everything is 0 wide); the
// stub only needs to exist for components that measure themselves.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom has no pointer capture; Kobalte's swipe and press handling call it.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}
