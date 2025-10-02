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

export const getRequests = dataSource.getRequests;
export const addRequest = dataSource.addRequest;
export const updateRequestStatus = dataSource.updateRequestStatus;
export const deleteRequestById = dataSource.deleteRequestById;