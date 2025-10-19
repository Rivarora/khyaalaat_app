import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // fetch a single row from likes table to infer columns
    const { data, error } = await supabase.from('likes').select('*').limit(1);
    if (error) {
      return NextResponse.json({ ok: false, error: String(error.message || error) }, { status: 500 });
    }
    if (!data || data.length === 0) {
      return NextResponse.json({ ok: true, columns: [], sample: null });
    }
    const sample = data[0];
    const columns = Object.keys(sample);
    return NextResponse.json({ ok: true, columns, sample });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e.message || e) }, { status: 500 });
  }
}
