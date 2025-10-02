import type { PoemRequest } from './definitions';
import { supabase } from './supabase';

type PoemRequestRow = {
  id: string;
  name: string;
  topic: string;
  genre: PoemRequest['genre'];
  mood: string;
  description: string;
  created_at: string | null;
  completed: boolean | null;
};

export async function getRequests(): Promise<PoemRequest[]> {
  const { data, error } = await supabase
    .from('poem_requests')
    .select('id, name, topic, genre, mood, description, created_at, completed')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching requests from Supabase:', error);
    return [];
  }

  const rows: PoemRequestRow[] = (data as unknown as PoemRequestRow[]) || [];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    topic: row.topic,
    genre: row.genre,
    mood: row.mood,
    description: row.description,
    createdAt: row.created_at ?? new Date().toISOString(),
    completed: row.completed ?? false,
  }));
}
