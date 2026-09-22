import { supabase, safeUpsert } from './supabase';

// Hex to ArrayBuffer
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// ArrayBuffer to Hex
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Client-side PBKDF2 Hashing (Matches server.ts crypto hashing exactly)
export async function clientHashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  let saltBytes: Uint8Array;
  let salt: string;
  if (saltHex) {
    saltBytes = hexToBuffer(saltHex);
    salt = saltHex;
  } else {
    saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
    salt = bufferToHex(saltBytes);
  }
  
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 10000,
      hash: 'SHA-512'
    },
    baseKey,
    64 * 8 // 64 bytes = 512 bits
  );
  
  const hash = bufferToHex(derivedBits);
  return { hash, salt };
}

// Secure Client-Side Auth Fallback
export async function fallbackVerifyAdminPassword(password: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'admin_auth')
      .maybeSingle();

    if (error || !data) {
      // Default password fallback
      return password === 'Mobofounder@2026';
    }

    const authData = data.data || data.value || data;
    if (authData && authData.password_hash && authData.salt) {
      const { hash } = await clientHashPassword(password, authData.salt);
      return hash === authData.password_hash;
    }

    return password === 'Mobofounder@2026';
  } catch (err) {
    console.error('[fallbackVerifyAdminPassword error]:', err);
    return password === 'Mobofounder@2026';
  }
}

// Secure Client-Side Change Password Fallback
export async function fallbackChangeAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Verify current password first
    const isValid = await fallbackVerifyAdminPassword(currentPassword);
    if (!isValid) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    // 2. Hash new password
    const { hash, salt } = await clientHashPassword(newPassword);

    // 3. Save new hash and salt directly to settings table
    const payload = {
      id: 'admin_auth',
      data: {
        password_hash: hash,
        salt: salt,
        updated_at: new Date().toISOString()
      },
      value: {
        password_hash: hash,
        salt: salt,
        updated_at: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    };

    const { error } = await safeUpsert('settings', payload);
    if (error) {
      console.error('[fallbackChangeAdminPassword save error]:', error);
      return { success: false, message: 'Failed to save new password in Supabase.' };
    }

    return { success: true, message: 'Password changed successfully.' };
  } catch (err: any) {
    console.error('[fallbackChangeAdminPassword exception]:', err);
    return { success: false, message: err?.message || 'Error updating password.' };
  }
}
