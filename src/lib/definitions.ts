
import type { ImagePlaceholder } from './placeholder-images';

export type UserInfo = {
  id: string;
  name: string | null;
  photo: string | null;
}

export type Comment = {
  id: string;
  text: string;
  user: UserInfo;
}

export type Poetry = {
  id: string;
  title: string;
  image: ImagePlaceholder;
  likes: UserInfo[];
  genre: 'Love' | 'Sad' | 'Motivational' | 'Nature' | 'Other';
  caption?: string; // Optional short preview
  poem: string; // Full poem text
  comments: Comment[];
};

export type PoemRequest = {
  id:string;
  name: string;
  topic: string;
  genre: 'Love' | 'Sad' | 'Motivational' | 'Nature';
  mood: string;
  description: string;
  createdAt: string;
  completed: boolean;
};
