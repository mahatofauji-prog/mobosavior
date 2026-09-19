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
  let list: any[] = [];
  try {
    const { data, error } = await buildSupabaseQuery(q);
    if (!error && data) {
      list = data;
    }
  } catch {}

  // Merge with local offline cache for bookings if Supabase query failed or returned empty
  try {
    const col = q.path;
    if (col === 'service_bookings' || col === 'service_bookings_public') {
      const storageKey = `ms_backup_${col}`;
      const cachedStr = localStorage.getItem(storageKey);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        const existingIds = new Set(list.map((d: any) => d.id || d.service_id));
        for (const item of cached) {
          if (!existingIds.has(item.id) && !existingIds.has(item.service_id)) {
            list.push(item);
          }
        }
      }
    }
  } catch {}
  
  return {
    empty: list.length === 0,
    size: list.length,
    docs: list.map((d: any) => ({
      id: d.id,
      data: () => d,
      exists: () => true,
      ref: { id: d.id, path: `${q.path}/${d.id}` },
      ...d
    })),
    forEach: (cb: any) => list.forEach((d: any) => cb({
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
      // If not found in Supabase (e.g. RLS blocked or offline), check localStorage
      try {
        const storageKey = `ms_backup_${col}`;
        const cachedStr = localStorage.getItem(storageKey);
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          const match = cached.find((item: any) => item.id === id || item.service_id === id);
          if (match) {
            return { exists: () => true, data: () => match, id, ref: docRef };
          }
        }
      } catch {}
      return { exists: () => false, data: () => undefined, id };
    }
    
    return { exists: () => true, data: () => data, id, ref: docRef };
  } catch {
    return { exists: () => false, data: () => undefined, id: docRef?.id };
  }
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
    const { error } = await (supabase.from('settings' as any)).upsert(payload);
    if (error) {
      console.error(`[Supabase setDoc settings error]:`, error);
      throw error;
    }
    return;
  }

  let payload: any = { ...data };
  if (id) payload.id = id;

  // Cache to localStorage for offline persistence / immediate accessibility
  try {
    if (col === 'service_bookings' || col === 'service_bookings_public' || col === 'bookings') {
      const storageKey = `ms_backup_${col}`;
      const existingStr = localStorage.getItem(storageKey);
      const items = existingStr ? JSON.parse(existingStr) : [];
      const updated = [payload, ...items.filter((item: any) => item.id !== payload.id && item.service_id !== payload.service_id)];
      localStorage.setItem(storageKey, JSON.stringify(updated.slice(0, 100)));
    }
  } catch {}

  // Strict sanitization for branches table to prevent schema cache mismatch
  if (col === 'branches') {
    const metaObj = {
      description: payload.description || '',
      imageUrl: payload.imageUrl || '',
      weeklyHoliday: payload.weeklyHoliday || '',
      serviceIds: payload.serviceIds || [],
      isMain: !!(payload.isMain || payload.isHeadquarters),
      isFeatured: payload.isFeatured !== undefined ? payload.isFeatured : true,
      isActive: payload.isActive !== undefined ? payload.isActive : true,
      seoTitle: payload.seoTitle || '',
      seoDescription: payload.seoDescription || ''
    };
    const bHours = typeof payload.businessHours === 'object' && payload.businessHours !== null ? payload.businessHours : {};
    payload = {
      id: payload.id,
      name: payload.name || '',
      slug: payload.slug || payload.id,
      branchCode: payload.branchCode || payload.branch_code || '',
      branch_code: payload.branchCode || payload.branch_code || '',
      address: payload.address || '',
      city: payload.city || 'Purulia',
      state: payload.state || 'West Bengal',
      pincode: payload.pincode || '723101',
      googleMapsUrl: payload.googleMapsUrl || payload.google_maps_url || '',
      google_maps_url: payload.googleMapsUrl || payload.google_maps_url || '',
      latitude: payload.latitude !== undefined && payload.latitude !== '' && payload.latitude !== null ? parseFloat(payload.latitude) : null,
      longitude: payload.longitude !== undefined && payload.longitude !== '' && payload.longitude !== null ? parseFloat(payload.longitude) : null,
      phone: payload.phone || '',
      whatsapp: payload.whatsapp || '',
      email: payload.email || null,
      businessHours: { ...bHours, _meta: metaObj },
      business_hours: { ...bHours, _meta: metaObj },
      isHeadquarters: !!(payload.isMain || payload.isHeadquarters),
      is_headquarters: !!(payload.isMain || payload.isHeadquarters),
      displayOrder: Number(payload.displayOrder || payload.display_order) || 1,
      display_order: Number(payload.displayOrder || payload.display_order) || 1
    };
  }
  
  const { error } = await (supabase.from(col as any)).upsert(payload);
  if (error) {
    console.error(`[Supabase setDoc ${col} error]:`, error);
    throw error;
  }
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
        try {
          if (op.type === 'upsert') await setDoc(op.docRef, op.data);
          if (op.type === 'update') await updateDoc(op.docRef, op.data);
          if (op.type === 'delete') await deleteDoc(op.docRef);
        } catch {}
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
