
import type { Timestamp } from 'firebase/firestore';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  imagePath?: string; // Path in Firebase Storage
};

export type UserInfo = {
  id: string;
  name: string | null;
  photo: string | null;
}

export type User = {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt: Date | Timestamp;
}

export type Comment = {
  id: string;
  text: string;
  user: UserInfo;
  createdAt: Date | Timestamp;
}

export type Poetry = {
  id: string;
  title: string;
  image: ImagePlaceholder;
  likes: UserInfo[];
  genre: 'Love' | 'Sad' | 'Motivational' | 'Nature' | 'Other';
  caption?: string; // Optional short preview
  poem: string; // Full poem text
  mood?: string;
  tags?: string;
  comments: Comment[]; // Keep for backward compatibility during migration
  commentsCount: number;
  createdAt: Date | Timestamp;
};

export type PoemRequest = {
  id: string;
  name: string;
  topic: string;
  genre: 'Love' | 'Sad' | 'Motivational' | 'Nature';
  mood: string;
  description: string;
  userId?: string; // Optional for backward compatibility
  createdAt: string;
  completed: boolean;
};
