
'use server';

import * as supabaseQueries from './supabase/queries';
import * as demoData from './demo-data';

// Check if we have valid Supabase configuration
const hasSupabaseConfig = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('demo') &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('demo');

// Use appropriate data source based on configuration
const dataSource = hasSupabaseConfig ? supabaseQueries : demoData;

if (!hasSupabaseConfig) {
  console.log('📝 Running in demo mode - using sample data');
}

export const getPoetryData = dataSource.getPoetryData;
export const addPoetry = dataSource.addPoetry;
export const deletePoetryById = dataSource.deletePoetryById;
export const updatePoetryLikes = dataSource.updatePoetryLikes;
export const addCommentToPoetry = dataSource.addCommentToPoetry;
export const deleteCommentFromPoetry = dataSource.deleteCommentFromPoetry;
