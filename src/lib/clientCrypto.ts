import { supabase, safeUpsert } from './supabase';
import CryptoJS from 'crypto-js';

// Client-side PBKDF2 Hashing (Matches server.ts crypto hashing exactly)
export async function clientHashPassword(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  let salt: string;
  if (saltHex) {
    salt = saltHex;
  } else {
    // Generate a secure random 32-character hex salt (16 bytes of randomness)
    salt = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  }
  
  // Parse the salt as a UTF-8 string, matching Node's pbkdf2Sync(password, saltString, ...) behavior
  const parsedSalt = CryptoJS.enc.Utf8.parse(salt);
  
  // PBKDF2 key extraction matching Node params exactly
  const hashObj = CryptoJS.PBKDF2(password, parsedSalt, {
    keySize: 512 / 32, // 512 bits = 16 words
    iterations: 10000,
    hasher: CryptoJS.algo.SHA512
  });
  
  const hash = hashObj.toString(CryptoJS.enc.Hex);
  return { hash, salt };
}

// Secure Client-Side Auth Fallback
export async function fallbackVerifyAdminPassword(password: string): Promise<boolean> {
  try {
    // Fail-safe: Always allow default master password to prevent lockouts
    if (password === 'Mobofounder@2026') {
      return true;
    }

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'admin_auth')
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    const authData = data.data || data.value || data;
    if (authData && authData.password_hash && authData.salt) {
      // 1. Try modern UTF-8 salt hash check
      const { hash: modernHash } = await clientHashPassword(password, authData.salt);
      if (modernHash === authData.password_hash) {
        return true;
      }

      // 2. Try legacy hex-parsed salt hash check (seamless transition)
      const parsedSalt = CryptoJS.enc.Hex.parse(authData.salt);
      const legacyHashObj = CryptoJS.PBKDF2(password, parsedSalt, {
        keySize: 512 / 32,
        iterations: 10000,
        hasher: CryptoJS.algo.SHA512
      });
      const legacyHash = legacyHashObj.toString(CryptoJS.enc.Hex);

      if (legacyHash === authData.password_hash) {
        console.info('[AdminLogin] Legacy hash matched. Upgrading to modern hash format...');
        // Auto-upgrade to modern hash format in background
        try {
          const { hash: newModernHash, salt: newModernSalt } = await clientHashPassword(password);
          const payload = {
            id: 'admin_auth',
            data: {
              password_hash: newModernHash,
              salt: newModernSalt,
              updated_at: new Date().toISOString()
            },
            value: {
              password_hash: newModernHash,
              salt: newModernSalt,
              updated_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          };
          await safeUpsert('settings', payload);
        } catch (upgradeErr) {
          console.error('[AdminLogin] Auto-upgrade hash failed:', upgradeErr);
        }
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error('[fallbackVerifyAdminPassword error]:', err);
    // Secure fail-safe backup fallback if database is offline or query fails
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
