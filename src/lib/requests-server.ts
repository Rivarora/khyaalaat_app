'use server';

import type { PoemRequest } from './definitions';
import { supabaseAdmin } from './supabase-admin';

export async function addRequest(request: PoemRequest): Promise<void> {
  const { error } = await supabaseAdmin.from('poem_requests').insert({
    id: request.id,
    name: request.name,
    topic: request.topic,
    genre: request.genre,
    mood: request.mood,
    description: request.description,
    created_at: request.createdAt,
    completed: request.completed,
  });
  if (error) {
    console.error('Error inserting request into Supabase:', error);
    throw error;
  }
}

export async function updateRequestStatus(id: string, completed: boolean): Promise<void> {
  const { error } = await supabaseAdmin
    .from('poem_requests')
    .update({ completed })
    .eq('id', id);
  if (error) {
    console.error('Error updating request status in Supabase:', error);
    throw error;
  }
}

export async function deleteRequestById(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('poem_requests')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting request in Supabase:', error);
    throw error;
  }
}
