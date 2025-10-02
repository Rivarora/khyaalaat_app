
'use server';

// Re-export Supabase queries to maintain compatibility
export {
  getPoetryData,
  addPoetry,
  deletePoetryById,
  updatePoetryLikes,
  addCommentToPoetry,
  deleteCommentFromPoetry,
} from './supabase/queries';
