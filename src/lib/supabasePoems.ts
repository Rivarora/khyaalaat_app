import { supabase } from './supabaseClient';
import type { Poetry, Comment, UserInfo } from './definitions';

// Candidate columns to be resilient to schema naming
const ID_CANDIDATES = ['id', 'poem_id', 'poetry_id'];
const TITLE_CANDIDATES = ['title', 'name'];
const GENRE_CANDIDATES = ['genre', 'category'];
const CAPTION_CANDIDATES = ['caption', 'summary', 'subtitle'];
const POEM_TEXT_CANDIDATES = ['poem', 'content', 'body', 'text'];
const IMAGE_URL_CANDIDATES = ['image_url', 'imageUrl', 'image', 'thumbnail'];
const IMAGE_HINT_CANDIDATES = ['image_hint', 'imageHint', 'hint'];
const IMAGE_DESC_CANDIDATES = ['image_description', 'imageDescription', 'description'];

function pickFirst<T extends Record<string, any>>(row: T, candidates: string[], fallback?: any) {
  for (const key of candidates) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return fallback;
}

function normalizePoemRow(row: any): Poetry | null {
  const id = String(pickFirst(row, ID_CANDIDATES, row.id));
  if (!id) return null;
  const title = String(pickFirst(row, TITLE_CANDIDATES, 'Untitled'));
  const genre = pickFirst(row, GENRE_CANDIDATES, 'Other');
  const caption = pickFirst(row, CAPTION_CANDIDATES, undefined);
  const poem = String(pickFirst(row, POEM_TEXT_CANDIDATES, ''));
  const imageUrl = String(pickFirst(row, IMAGE_URL_CANDIDATES, ''));
  const imageHint = String(pickFirst(row, IMAGE_HINT_CANDIDATES, 'poetry image'));
  const imageDesc = String(pickFirst(row, IMAGE_DESC_CANDIDATES, title));

  return {
    id,
    title,
    genre,
    caption,
    poem,
    image: {
      id: id + '-img',
      imageUrl,
      imageHint,
      description: imageDesc,
    },
    likes: [],
    comments: [],
  } as Poetry;
}

export async function getPoetryDataClient(): Promise<Poetry[]> {
  const TABLE_CANDIDATES = ['poems', 'poetry', 'posts'];
  for (const table of TABLE_CANDIDATES) {
    try {
      const { data, error } = await supabase.from(table).select('*').order('id', { ascending: false });
      if (error) {
        const msg = String(error.message || error);
        if (/schema cache|not exist|not found|relation .* does not exist/i.test(msg)) {
          continue;
        }
        continue;
      }
      const rows = Array.isArray(data) ? data : [];
      return rows.map(normalizePoemRow).filter(Boolean) as Poetry[];
    } catch (e) {
      continue;
    }
  }
  return [];
}

// Comments
const COMMENT_ID_CANDIDATES = ['id', 'comment_id'];
const COMMENT_TEXT_CANDIDATES = ['text', 'comment', 'body', 'content'];
const COMMENT_POEM_ID_CANDIDATES = ['poem_id', 'poetry_id', 'poemId', 'poetryId'];
const COMMENT_USER_ID_CANDIDATES = ['user_id', 'userId'];
const COMMENT_USER_NAME_CANDIDATES = ['user_name', 'userName', 'name'];
const COMMENT_USER_PHOTO_CANDIDATES = ['user_photo', 'userPhoto', 'photo', 'avatar'];

function normalizeCommentRow(row: any): Comment {
  const id = String(pickFirst(row, COMMENT_ID_CANDIDATES, row.id || `${Date.now()}`));
  const text = String(pickFirst(row, COMMENT_TEXT_CANDIDATES, ''));
  const user: UserInfo = {
    id: String(pickFirst(row, COMMENT_USER_ID_CANDIDATES, 'unknown')),
    name: String(pickFirst(row, COMMENT_USER_NAME_CANDIDATES, 'Anonymous')),
    photo: String(pickFirst(row, COMMENT_USER_PHOTO_CANDIDATES, '')),
  };
  return { id, text, user };
}

export async function addCommentSupabase(poetryId: string, text: string, user: UserInfo) {
  const TABLE_CANDIDATES = ['comments', 'poem_comments'];
  const PID_COL_CANDIDATES = COMMENT_POEM_ID_CANDIDATES; // ['poem_id','poetry_id','poemId','poetryId']
  const TEXT_COL_CANDIDATES = COMMENT_TEXT_CANDIDATES; // ['text','comment','body','content']
  let lastErrorMsg: string | null = null;

  for (const table of TABLE_CANDIDATES) {
    for (const pidCol of PID_COL_CANDIDATES) {
      for (const textCol of TEXT_COL_CANDIDATES) {
        const payload: any = {
          user_id: user.id,
          user_name: user.name,
          user_photo: user.photo || '',
        };
        payload[pidCol] = poetryId;
        payload[textCol] = text;
        const { data, error } = await supabase.from(table).insert([payload]).select('*').maybeSingle();
        if (!error && data) return normalizeCommentRow(data);
        if (error) {
          const msg = String(error.message || error);
          lastErrorMsg = msg;
          // If either of the columns doesn't exist, try next candidate
          if (/column .* does not exist/i.test(msg)) {
            continue;
          }
          // If table missing, bail to next table
          if (/schema cache|relation .* does not exist|not found/i.test(msg)) {
            break;
          }
          // Other errors: keep trying next combos
          continue;
        }
      }
    }
  }
  // Fail loudly with last known message for easier debugging
  throw new Error(lastErrorMsg || 'Failed to add comment. Ensure table and RLS policies allow insert.');
}

export async function deleteCommentSupabase(poetryId: string, commentId: string) {
  // Try deleting by id; if schema differs, attempt by poem+id variants
  const TABLE_CANDIDATES = ['comments', 'poem_comments'];
  for (const table of TABLE_CANDIDATES) {
    const attempts: Array<Promise<any>> = [];
    attempts.push(supabase.from(table).delete().eq('id', commentId));
    attempts.push(supabase.from(table).delete().eq('comment_id', commentId));
    for (const attempt of attempts) {
      const { error } = await attempt;
      if (!error) return;
    }
  }
  return;
}

export async function getCommentsSupabase(poetryId: string) {
  // Fetch comments and normalize
  const TABLE_CANDIDATES = ['comments', 'poem_comments'];
  let rows: any[] = [];
  for (const table of TABLE_CANDIDATES) {
    const { data, error } = await supabase.from(table).select('*').limit(1000);
    if (error) {
      const msg = String(error.message || error);
      if (/schema cache|not exist|not found|relation .* does not exist/i.test(msg)) continue;
      continue;
    }
    rows = Array.isArray(data) ? data : [];
    break;
  }
  // Filter by poem id with tolerant check
  const filtered = rows.filter((r: any) => {
    const pid = pickFirst(r, COMMENT_POEM_ID_CANDIDATES, r.poem_id);
    return String(pid) === String(poetryId);
  });
  return filtered.map(normalizeCommentRow);
}

export async function deletePoemSupabase(poetryId: string) {
  // Delete poem row; images managed separately if needed
  const TABLE_CANDIDATES = ['poems', 'poetry', 'posts'];
  for (const table of TABLE_CANDIDATES) {
    const attempts: Array<Promise<any>> = [];
    attempts.push(supabase.from(table).delete().eq('id', poetryId));
    attempts.push(supabase.from(table).delete().eq('poem_id', poetryId));
    attempts.push(supabase.from(table).delete().eq('poetry_id', poetryId));
    for (const attempt of attempts) {
      const { error } = await attempt;
      if (!error) return;
    }
  }
  return;
}

export async function insertPoemSupabase(poem: Poetry) {
  const TABLE_CANDIDATES = ['poems', 'poetry', 'posts'];
  const row: any = {
    id: poem.id,
    title: poem.title,
    genre: poem.genre,
    caption: poem.caption ?? null,
    poem: poem.poem,
    image_url: poem.image.imageUrl,
    image_hint: poem.image.imageHint,
    image_description: poem.image.description,
  };
  for (const table of TABLE_CANDIDATES) {
    const { data, error } = await supabase.from(table).insert([row]).select('*').maybeSingle();
    if (!error && data) return normalizePoemRow(data);
    if (error) {
      const msg = String(error.message || error);
      if (/schema cache|not exist|not found|relation .* does not exist/i.test(msg)) continue;
    }
  }
  // If none succeeded, just return the original poem (local-only persistence will still work)
  return poem;
}


