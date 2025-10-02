'use server';

import type { Poetry, PoemRequest } from './definitions';

// Demo data for testing without Supabase
const demoPoetry: Poetry[] = [
  {
    id: "1",
    title: "Whispers of Dawn",
    genre: "Nature",
    caption: "A gentle morning poem about new beginnings",
    poem: `Golden rays pierce through morning mist,
Awakening the world with nature's kiss.
Birds sing melodies of hope and light,
Chasing away the remnants of night.

In this moment of perfect peace,
All worries and sorrows cease.
The earth breathes deep, so fresh and new,
Painting the sky in morning's hue.`,
    image: {
      id: "img-1",
      imageUrl: "/uploads/1757672106473-Dark Photocentric Social Media Manager Notepad Instagram Post   (1).png",
      imageHint: "Morning sunrise",
      description: "Beautiful sunrise over mountains"
    },
    likes: [
      { id: "user1", name: "Alice Johnson", photo: null },
      { id: "user2", name: "Bob Smith", photo: null }
    ],
    comments: [
      {
        id: "comment1",
        text: "Beautiful poem! Really captures the essence of morning.",
        user: { id: "user1", name: "Alice Johnson", photo: null }
      }
    ]
  },
  {
    id: "2",
    title: "Love's Eternal Dance",
    genre: "Love",
    caption: "A romantic poem about enduring love",
    poem: `Two hearts that beat in perfect time,
A love that's both pure and sublime.
Through seasons of joy and tears we've shared,
A bond so strong, beyond compare.

In your eyes I see my home,
No matter how far I may roam.
Hand in hand we face each day,
Love lighting up our chosen way.`,
    image: {
      id: "img-2",
      imageUrl: "/uploads/1757680554908-Dark Photocentric Social Media Manager Notepad Instagram Post   - Copy.png",
      imageHint: "Romantic sunset",
      description: "Couple watching sunset together"
    },
    likes: [
      { id: "user3", name: "Carol Davis", photo: null }
    ],
    comments: []
  },
  {
    id: "3",
    title: "Rise Above",
    genre: "Motivational",
    caption: "An inspiring poem about overcoming challenges",
    poem: `When the mountain seems too high to climb,
And you're running short on hope and time,
Remember that within you lies
The power to reach beyond the skies.

Each step you take, however small,
Builds the strength to conquer all.
Rise above the doubt and fear,
Your dreams are closer than they appear.`,
    image: {
      id: "img-3",
      imageUrl: "/uploads/1757694219620-Dark Photocentric Social Media Manager Notepad Instagram Post   (2).png",
      imageHint: "Mountain peak",
      description: "Person standing on mountain peak"
    },
    likes: [],
    comments: [
      {
        id: "comment2",
        text: "This is exactly what I needed to read today. Thank you!",
        user: { id: "user4", name: "David Wilson", photo: null }
      },
      {
        id: "comment3",
        text: "Very motivating! Saved this one.",
        user: { id: "user5", name: "Eve Brown", photo: null }
      }
    ]
  }
];

const demoRequests: PoemRequest[] = [
  {
    id: "req1",
    name: "Sarah Miller",
    topic: "Ocean waves",
    genre: "Nature",
    mood: "Peaceful and calming",
    description: "I'd love a poem about the soothing sound of ocean waves and how they bring inner peace.",
    createdAt: "2024-10-01T10:00:00Z",
    completed: false
  },
  {
    id: "req2",
    name: "Michael Chen",
    topic: "First love",
    genre: "Love",
    mood: "Nostalgic and sweet",
    description: "A poem about the butterflies and excitement of experiencing first love in high school.",
    createdAt: "2024-09-30T15:30:00Z",
    completed: true
  }
];

export async function getPoetryData(): Promise<Poetry[]> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
  return demoPoetry;
}

export async function addPoetry(poetry: Poetry): Promise<void> {
  console.log('Demo mode: Would add poetry:', poetry.title);
}

export async function deletePoetryById(poetryId: string): Promise<Poetry | undefined> {
  console.log('Demo mode: Would delete poetry:', poetryId);
  return demoPoetry.find(p => p.id === poetryId);
}

export async function updatePoetryLikes(poetryId: string, user: any, isLiked: boolean): Promise<void> {
  console.log('Demo mode: Would update likes for:', poetryId, isLiked);
}

export async function addCommentToPoetry(poetryId: string, commentText: string, user: any): Promise<void> {
  console.log('Demo mode: Would add comment to:', poetryId, commentText);
}

export async function deleteCommentFromPoetry(poetryId: string, commentId: string): Promise<void> {
  console.log('Demo mode: Would delete comment:', commentId);
}

export async function getRequests(): Promise<PoemRequest[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return demoRequests;
}

export async function addRequest(request: PoemRequest): Promise<void> {
  console.log('Demo mode: Would add request:', request.name);
}

export async function updateRequestStatus(id: string, completed: boolean): Promise<void> {
  console.log('Demo mode: Would update request status:', id, completed);
}

export async function deleteRequestById(id: string): Promise<void> {
  console.log('Demo mode: Would delete request:', id);
}