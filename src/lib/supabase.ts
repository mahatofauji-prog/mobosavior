import { createClient } from '@supabase/supabase-js';
import { sanitizePayload, mapDatabaseRowToCamelCase } from './dbSanitizer';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cynrkcrjcxpyiuagyvxj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_63nVtmzyXYHGi1lLJWxwxw_6rY8XeKh';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const db = 'supabase';

export function collection(db: any, path: string) {
  return { type: 'collection', path };
}

export function doc(db: any, path?: string, id?: string) {
  if (db && db.type === 'collection' && !path) {
    const newId = crypto.randomUUID();
    return { type: 'doc', path: `${db.path}/${newId}`, id: newId };
  }
  if (arguments.length === 2 && db && db.type === 'collection') {
    return { type: 'doc', path: `${db.path}/${path}`, id: path };
  }
  const resolvedId = id || (path && path.split('/').pop()) || crypto.randomUUID();
  return { type: 'doc', path: id ? `${path}/${id}` : path, id: resolvedId };
}

export function query(col: any, ...constraints: any[]) {
  return { ...col, constraints };
}

export function where(field: string, op: string, value: any) {
  return { type: 'where', field, op, value };
}

export function orderBy(field: string, dir: 'asc' | 'desc' = 'asc') {
  return { type: 'orderBy', field, dir };
}

export function limit(n: number) {
  return { type: 'limit', n };
}

function buildSupabaseQuery(q: any) {
  const path = q.path;
  let sQuery: any = supabase.from(path as any).select('*');
  
  if (q.constraints) {
    for (const c of q.constraints) {
      if (c.type === 'where') {
        if (c.op === '==') sQuery = sQuery.eq(c.field, c.value);
        if (c.op === '<') sQuery = sQuery.lt(c.field, c.value);
        if (c.op === '>') sQuery = sQuery.gt(c.field, c.value);
        if (c.op === '<=') sQuery = sQuery.lte(c.field, c.value);
        if (c.op === '>=') sQuery = sQuery.gte(c.field, c.value);
        if (c.op === '!=') sQuery = sQuery.neq(c.field, c.value);
        if (c.op === 'array-contains') sQuery = sQuery.contains(c.field, [c.value]);
      } else if (c.type === 'orderBy') {
        const snakeField = c.field.replace(/[A-Z]/g, (m: string) => `_${m.toLowerCase()}`);
        sQuery = sQuery.order(snakeField, { ascending: c.dir === 'asc' });
      } else if (c.type === 'limit') {
        sQuery = sQuery.limit(c.n);
      }
    }
  }
  return sQuery;
}

export async function getDocs(q: any) {
  let list: any[] = [];
  try {
    const { data, error } = await buildSupabaseQuery(q);
    if (!error && data) {
      list = data;
    } else {
      const path = q.path;
      const { data: retryData, error: retryErr } = await supabase.from(path as any).select('*');
      if (!retryErr && retryData) {
        list = retryData;
      } else if (error || retryErr) {
        console.error(`[Supabase getDocs error]:`, error || retryErr);
      }
    }
  } catch (err) {
    console.error(`[Supabase getDocs exception]:`, err);
  }

  // Map each row in the list to camelCase and merge with raw data to retain snake_case compatibility
  const mappedList = list.map(d => {
    const mapped = mapDatabaseRowToCamelCase(d);
    return { ...d, ...mapped };
  });

  return {
    empty: mappedList.length === 0,
    size: mappedList.length,
    docs: mappedList.map((d: any) => ({
      id: d.id,
      data: () => d,
      exists: () => true,
      ref: { id: d.id, path: `${q.path}/${d.id}` },
      ...d
    })),
    forEach: (cb: any) => mappedList.forEach((d: any) => cb({
      id: d.id,
      data: () => d,
      exists: () => true,
      ref: { id: d.id, path: `${q.path}/${d.id}` },
      ...d
    }))
  };
}

export async function getDoc(docRef: any) {
  try {
    const parts = docRef.path.split('/');
    if (parts.length < 2) return { exists: () => false };
    const col = parts[0];
    const id = parts[1];
    
    if (col === 'settings') {
      const { data, error } = await (supabase.from('settings' as any)).select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        return { exists: () => false, data: () => undefined, id };
      }
      const unwrapped = data.data && Object.keys(data.data).length > 0 ? data.data : (data.value || data);
      return { exists: () => true, data: () => ({ id, ...unwrapped }), id, ref: docRef };
    }

    const { data, error } = await (supabase.from(col as any)).select('*').eq('id', id).maybeSingle();
    if (error || !data) {
      return { exists: () => false, data: () => undefined, id };
    }
    
    // Map to camelCase and merge with raw data
    const mapped = mapDatabaseRowToCamelCase(data);
    const merged = { ...data, ...mapped };
    
    return { exists: () => true, data: () => merged, id, ref: docRef, ...merged };
  } catch {
    return { exists: () => false, data: () => undefined, id: docRef?.id };
  }
}

export async function safeUpsert(tableName: string, payload: any, options?: any): Promise<{ data: any; error: any }> {
  let currentPayload = Array.isArray(payload) 
    ? payload.map(p => sanitizePayload(tableName, p))
    : sanitizePayload(tableName, payload) as Record<string, any>;

  let maxAttempts = 15;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data, error } = options 
      ? await supabase.from(tableName as any).upsert(currentPayload as any, options)
      : await supabase.from(tableName as any).upsert(currentPayload as any);

    if (!error) {
      return { data, error: null };
    }

    const errMsg = error.message || error.details || error.hint || '';
    const match = 
      errMsg.match(/Could not find the '([^']+)' column/i) ||
      errMsg.match(/column [\\"']?([^\\"'\\s]+)[\\"']? (?:of relation [^ ]+ )?does not exist/i) ||
      errMsg.match(/has no column named [\\"']?([^\\"'\\s]+)[\\"']?/i);

    if (match && match[1]) {
      const missingCol = match[1];
      console.warn(`[safeUpsert] Table '${tableName}' missing column '${missingCol}'. Stripping and retrying (attempt ${attempt + 1})...`);
      
      if (Array.isArray(currentPayload)) {
        currentPayload.forEach((p: any) => delete p[missingCol]);
      } else if (typeof currentPayload === 'object' && currentPayload !== null) {
        delete (currentPayload as any)[missingCol];
      }
      continue;
    }

    return { data: null, error };
  }

  return { data: null, error: new Error(`Failed to upsert to table '${tableName}' after removing missing columns.`) };
}

export async function safeUpdate(tableName: string, payload: any, matchCol: string, matchVal: any): Promise<{ data: any; error: any }> {
  let currentPayload = sanitizePayload(tableName, payload) as Record<string, any>;
  let maxAttempts = 15;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data, error } = await supabase.from(tableName as any).update(currentPayload).eq(matchCol, matchVal);

    if (!error) {
      return { data, error: null };
    }

    const errMsg = error.message || error.details || error.hint || '';
    const match = 
      errMsg.match(/Could not find the '([^']+)' column/i) ||
      errMsg.match(/column [\\"']?([^\\"'\\s]+)[\\"']? (?:of relation [^ ]+ )?does not exist/i) ||
      errMsg.match(/has no column named [\\"']?([^\\"'\\s]+)[\\"']?/i);

    if (match && match[1]) {
      const missingCol = match[1];
      console.warn(`[safeUpdate] Table '${tableName}' missing column '${missingCol}'. Stripping and retrying (attempt ${attempt + 1})...`);
      delete currentPayload[missingCol];
      continue;
    }

    return { data: null, error };
  }

  return { data: null, error: new Error(`Failed to update table '${tableName}' after removing missing columns.`) };
}

export async function setDoc(docRef: any, data: any, options?: any) {
  const parts = docRef.path.split('/');
  const col = parts[0];
  const id = parts.length > 1 ? parts[1] : undefined;
  
  if (col === 'settings') {
    const payload = {
      id,
      data: data,
      value: data,
      updated_at: new Date().toISOString()
    };
    const { error } = await safeUpsert('settings', payload);
    if (error) {
      console.error(`[Supabase setDoc settings error]:`, error);
      throw error;
    }
    return;
  }

  let rawPayload: any = { ...data };
  if (id) rawPayload.id = id;

  const { error } = await safeUpsert(col, rawPayload);
  if (error) {
    console.error(`[Supabase setDoc ${col} error]:`, error);
    throw error;
  }
}

export async function addDoc(colRef: any, data: any) {
  const col = colRef.path;
  const cleanPayload = sanitizePayload(col, data);
  const { data: result, error } = await supabase.from(col as any).insert(cleanPayload).select().single();
  if (error) {
    console.error(`[Supabase addDoc ${col} error]:`, error);
    throw error;
  }
  return { id: result.id, path: `${col}/${result.id}` };
}

export async function updateDoc(docRef: any, data: any) {
  const parts = docRef.path.split('/');
  const col = parts[0];
  const id = parts[1];
  
  const { error } = await safeUpdate(col, data, 'id', id);
  if (error) {
    console.error(`[Supabase updateDoc ${col} error]:`, error);
    throw error;
  }
}

export async function deleteDoc(docRef: any) {
  const parts = docRef.path.split('/');
  const col = parts[0];
  const id = parts[1];
  
  const { error } = await supabase.from(col as any).delete().eq('id', id);
  if (error) {
    console.error(`[Supabase deleteDoc ${col} error]:`, error);
    throw error;
  }
}

export function onSnapshot(target: any, callback: any, errorCallback?: any) {
  const isDoc = target?.type === 'doc';
  const parts = (target?.path || '').split('/');
  const col = parts[0] || 'general';
  const docId = isDoc ? parts[1] : undefined;

  const fetchCurrent = async () => {
    try {
      if (isDoc) {
        const snap = await getDoc(target);
        callback(snap);
      } else {
        const snap = await getDocs(target);
        callback(snap);
      }
    } catch (err) {
      if (errorCallback) errorCallback(err);
      else console.error('onSnapshot fetch error:', err);
    }
  };

  const channelName = `public:${col}:${docId || 'all'}:${Math.random().toString(36).substring(2, 7)}`;
  const channel = supabase.channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: col }, () => {
      fetchCurrent();
    })
    .subscribe();
    
  fetchCurrent();
    
  return () => {
    supabase.removeChannel(channel);
  };
}

export function writeBatch(db: any) {
  let ops: any[] = [];
  return {
    set: (docRef: any, data: any, options?: any) => ops.push({ type: 'upsert', docRef, data }),
    update: (docRef: any, data: any) => ops.push({ type: 'update', docRef, data }),
    delete: (docRef: any) => ops.push({ type: 'delete', docRef }),
    commit: async () => {
      await Promise.all(ops.map(async op => {
        if (op.type === 'upsert') await setDoc(op.docRef, op.data);
        if (op.type === 'update') await updateDoc(op.docRef, op.data);
        if (op.type === 'delete') await deleteDoc(op.docRef);
      }));
    }
  };
}

export function serverTimestamp() {
  return new Date().toISOString();
}

export const auth = {
  currentUser: null,
  signOut: async () => {}
};
export async function signOut(auth?: any) {}
