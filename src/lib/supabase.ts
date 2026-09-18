import { createClient } from '@supabase/supabase-js';

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
        sQuery = sQuery.order(c.field, { ascending: c.dir === 'asc' });
      } else if (c.type === 'limit') {
        sQuery = sQuery.limit(c.n);
      }
    }
  }
  return sQuery;
}

export async function getDocs(q: any) {
  const { data, error } = await buildSupabaseQuery(q);
  if (error) {
    console.warn(`Supabase error on ${q.path}:`, error.message);
    return { empty: true, size: 0, docs: [], forEach: (cb: any) => {} };
  }
  
  return {
    empty: data.length === 0,
    size: data.length,
    docs: data.map((d: any) => ({
      id: d.id,
      data: () => d,
      exists: () => true,
      ref: { id: d.id, path: `${q.path}/${d.id}` }
    })),
    forEach: (cb: any) => data.forEach((d: any) => cb({
      id: d.id,
      data: () => d,
      exists: () => true,
      ref: { id: d.id, path: `${q.path}/${d.id}` }
    }))
  };
}

export async function getDoc(docRef: any) {
  const parts = docRef.path.split('/');
  if (parts.length < 2) return { exists: () => false };
  const col = parts[0];
  const id = parts[1];
  
  const { data, error } = await supabase.from(col as any).select('*').eq('id', id).maybeSingle();
  if (error) {
    console.warn(`Supabase error on ${docRef.path}:`, error.message);
    return { exists: () => false, data: () => undefined, id };
  }
  
  if (!data) {
    return { exists: () => false, data: () => undefined, id };
  }
  
  return { exists: () => true, data: () => data, id, ref: docRef };
}

export async function setDoc(docRef: any, data: any, options?: any) {
  const parts = docRef.path.split('/');
  const col = parts[0];
  const id = parts.length > 1 ? parts[1] : undefined;
  
  const payload = { ...data };
  if (id) payload.id = id;
  
  const { error } = await supabase.from(col as any).upsert(payload).select();
  if (error) throw error;
}

export async function addDoc(colRef: any, data: any) {
  const col = colRef.path;
  const { data: result, error } = await supabase.from(col as any).insert(data).select().single();
  if (error) throw error;
  return { id: result.id, path: `${col}/${result.id}` };
}

export async function updateDoc(docRef: any, data: any) {
  const parts = docRef.path.split('/');
  const col = parts[0];
  const id = parts[1];
  
  const { error } = await supabase.from(col as any).update(data).eq('id', id);
  if (error) throw error;
}

export async function deleteDoc(docRef: any) {
  const parts = docRef.path.split('/');
  const col = parts[0];
  const id = parts[1];
  
  const { error } = await supabase.from(col as any).delete().eq('id', id);
  if (error) throw error;
}

export function onSnapshot(q: any, callback: any, errorCallback?: any) {
  const col = q.path;
  
  const channel = supabase.channel(`public:${col}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: col }, () => {
      getDocs(q).then(snapshot => callback(snapshot)).catch(console.error);
    })
    .subscribe();
    
  getDocs(q).then(snapshot => callback(snapshot)).catch(console.error);
    
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
        if (op.type === 'upsert') await setDoc(op.docRef, op.data).catch(console.warn);
        if (op.type === 'update') await updateDoc(op.docRef, op.data).catch(console.warn);
        if (op.type === 'delete') await deleteDoc(op.docRef).catch(console.warn);
      }));
    }
  };
}

export function serverTimestamp() {
  return new Date().toISOString();
}

export const auth = {
  currentUser: null,
  signOut: async () => {
    // local passcode signout
  }
};
export async function signOut(auth?: any) {}
