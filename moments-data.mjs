import { DESIGN } from './design-data.js';

// Append supplied photographs here; the reel derives its frames and controls from this list.
export const MOMENT_PHOTOS = [
  ...DESIGN.main.slice(1, 5),
  { src: 'assets/moments/studio-field.jpeg', w: 1920, h: 1280, studio: true },
  { src: 'assets/moments/studio-white-flowers.jpg', w: 1030, h: 1440, studio: true },
  { src: 'assets/moments/studio-purple-flowers.jpg', w: 1280, h: 1920, studio: true },
];
