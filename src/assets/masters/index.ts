// Define the image paths and metadata
export const mastersImages = {
  augusta1: '/src/assets/masters/augusta-1.jpg',
  augusta2: '/src/assets/masters/augusta-2.jpg',
  augusta3: '/src/assets/masters/augusta-3.jpg',
  augusta4: '/src/assets/masters/augusta-4.jpg',
} as const;

// Get a random image from the collection
export function getRandomMastersImage(): string {
  const images = Object.values(mastersImages);
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
}