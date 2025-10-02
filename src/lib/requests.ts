'use server';

// Re-export Supabase queries to maintain compatibility
export {
  getRequests,
  addRequest,
  updateRequestStatus,
  deleteRequestById,
} from './supabase/queries';