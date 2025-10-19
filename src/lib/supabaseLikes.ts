import { supabase } from './supabaseClient';

const POETRY_COLUMN_CANDIDATES = ['poetry_id', 'poetryid', 'poetryId', 'poem_id', 'poemId', 'poetry'];
const USER_ID_CANDIDATES = ['user_id', 'userId', 'userid', 'user'];
const USER_NAME_CANDIDATES = ['user_name', 'userName', 'username', 'name'];
const USER_PHOTO_CANDIDATES = ['user_photo', 'userPhoto', 'userphoto', 'photo', 'avatar'];

function normalizeLikeRow(row: any) {
  const normalized: any = {};
  // poetry id
  for (const c of POETRY_COLUMN_CANDIDATES) {
    if (row[c] !== undefined) {
      normalized.poetry_id = row[c];
      break;
    }
  }
  // user id
  for (const c of USER_ID_CANDIDATES) {
    if (row[c] !== undefined) {
      normalized.user_id = row[c];
      break;
    }
  }
  // user name
  for (const c of USER_NAME_CANDIDATES) {
    if (row[c] !== undefined) {
      normalized.user_name = row[c];
      break;
    }
  }
  // user photo
  for (const c of USER_PHOTO_CANDIDATES) {
    if (row[c] !== undefined) {
      normalized.user_photo = row[c];
      break;
    }
  }
  // include any other fields as-is
  normalized._raw = row;
  // convenience fields expected by UI
  normalized.id = normalized.user_id ?? row.id ?? null;
  normalized.name = normalized.user_name ?? row.name ?? row.user_name ?? null;
  normalized.photo = normalized.user_photo ?? row.photo ?? row.user_photo ?? null;
  return normalized;
}

async function tryCandidates<T>(fn: (col: string) => any) {
  const errors: any[] = [];
  for (const col of POETRY_COLUMN_CANDIDATES) {
    try {
      const res = await (fn(col) as any);
      if (res.error) {
        // If the error message complains about column not existing, try next candidate
        const msg = String(res.error?.message || res.error);
        if (/does not exist/i.test(msg) || /column .* does not exist/i.test(msg)) {
          errors.push({ col, error: res.error });
          continue; // try next
        }
        // other errors bubble up
        return { data: null, error: res.error };
      }
      return { data: res.data, error: null };
    } catch (e) {
      errors.push({ col, error: e });
      // continue trying
    }
  }
  // none succeeded
  const err = new Error(`All candidate columns failed. Tried: ${POETRY_COLUMN_CANDIDATES.join(', ')}`);
  // @ts-ignore
  err.details = errors;
  return { data: null, error: err };
}

export async function getLikesForPoetry(poetryId: string) {
  // Simpler and more robust approach: fetch up to 1000 rows and filter client-side.
  try {
    const { data, error } = await supabase.from('likes').select('*').limit(1000);
    if (error) {
      const err = new Error(`Supabase getLikes error: ${error.message || JSON.stringify(error)}`);
      // @ts-ignore
      err.details = error;
      throw err;
    }
    const rows = (data as any[]) || [];
    const matched = rows.filter((r) => {
      const nr = normalizeLikeRow(r);
      if (nr.poetry_id !== undefined && nr.poetry_id !== null) return String(nr.poetry_id) === String(poetryId);
      return Object.values(r).some((v) => String(v) === String(poetryId));
    });
    return matched.map(normalizeLikeRow);
  } catch (error: any) {
    const err = new Error(`Supabase getLikes error: ${error?.message || JSON.stringify(error)}`);
    // @ts-ignore
    err.details = error;
    throw err;
  }
}

function buildInsertPayload(poetryCol: string, poetryId: string, user: { id: string; name: string; photo?: string }) {
  const payload: any = {};
  payload[poetryCol] = poetryId;
  // prefer canonical names for user fields, but include alternatives if needed
  payload['user_id'] = user.id;
  payload['user_name'] = user.name;
  payload['user_photo'] = user.photo || '';
  return payload;
}

export async function likePoetrySupabase(poetryId: string, user: { id: string, name: string, photo?: string }) {
  // Prevent duplicate likes: fetch existing likes and return early if user already liked.
  try {
    const existing = await getLikesForPoetry(poetryId);
    if (existing.some((r: any) => String(r.user_id) === String(user.id))) {
      return existing;
    }
  } catch (e) {
    // ignore and continue to attempt insert; getLikesForPoetry may fail if schema unexpected
  }

  const errors: any[] = [];
  for (const col of POETRY_COLUMN_CANDIDATES) {
    const payload = buildInsertPayload(col, poetryId, user);
    try {
      const { data, error } = await supabase.from('likes').insert([payload]).select();
      if (error) {
        const msg = String(error.message || error);
        if (/does not exist/i.test(msg) || /column .* does not exist/i.test(msg)) {
          errors.push({ col, error });
          continue; // try next candidate
        }
        const err = new Error(`Supabase like insert error: ${error.message || JSON.stringify(error)}`);
        // @ts-ignore
        err.details = error;
        throw err;
      }
      return (data || []).map(normalizeLikeRow);
    } catch (e: any) {
      errors.push({ col, error: e });
    }
  }
  const err = new Error('Supabase like insert failed for all candidate poetry columns');
  // @ts-ignore
  err.details = errors;
  throw err;
}

export async function unlikePoetrySupabase(poetryId: string, userId: string) {
  const errors: any[] = [];
  for (const pcol of POETRY_COLUMN_CANDIDATES) {
    for (const ucol of USER_ID_CANDIDATES) {
      try {
        const { data, error } = await supabase
          .from('likes')
          .delete()
          .eq(pcol, poetryId)
          .eq(ucol, userId);
        if (error) {
          const msg = String(error.message || error);
          if (/does not exist/i.test(msg) || /column .* does not exist/i.test(msg)) {
            errors.push({ pcol, ucol, error });
            continue;
          }
          const err = new Error(`Supabase unlike error: ${error.message || JSON.stringify(error)}`);
          // @ts-ignore
          err.details = error;
          throw err;
        }
        return data;
      } catch (e: any) {
        errors.push({ pcol, ucol, error: e });
      }
    }
  }
  const err = new Error('Supabase unlike failed for all candidate poetry/user columns');
  // @ts-ignore
  err.details = errors;
  throw err;
}
