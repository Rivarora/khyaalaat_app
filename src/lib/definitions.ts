import type { ImagePlaceholder } from './placeholder-images';

export type Poetry = {
  id: string;
  title: string;
  image: ImagePlaceholder;
  likes: number;
  genre: 'Love' | 'Sad' | 'Motivational' | 'Nature' | 'Other';
};
