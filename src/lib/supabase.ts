import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvumawxgspmovexblofn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dW1hd3hnc3Btb3ZleGJsb2ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzg1NDUsImV4cCI6MjA3MjcxNDU0NX0.2mKMlOJJY3SmYx2CORu4a_g6uiBUp3ObjaiV3Vvbfus';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);