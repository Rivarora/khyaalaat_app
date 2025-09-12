import type { ImagePlaceholder } from './placeholder-images';

export type Poetry = {
  id: string;
  title: string;
  image: ImagePlaceholder;
  likes: number;
  genre: 'Love' | 'Sad' | 'Motivational' | 'Nature' | 'Other';
  comments: string[];
};

export type PoemRequest = {
  id: string;
  name: string;
  topic: string;
  genre: 'Love' | 'Sad' | 'Motivational' | 'Nature';
  mood: string;
  description: string;
  createdAt: string;
  completed: boolean;
};
