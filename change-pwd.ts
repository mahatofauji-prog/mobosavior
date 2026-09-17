import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updatePassword, createUserWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const auth = getAuth(app);

async function run() {
  const email = 'admin@mobosavior.com';
  const oldPwd = 'Mobo@2026';
  const newPwd = 'Mobofounder@2026';

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, oldPwd);
    await updatePassword(userCredential.user, newPwd);
    console.log('Password successfully updated!');
  } catch (err: any) {
    console.error('Failed to login with old password:', err.message);
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
       console.log('Attempting to create user with new password directly...');
       try {
         await createUserWithEmailAndPassword(auth, email, newPwd);
         console.log('User created with new password successfully!');
       } catch (createErr: any) {
         console.error('Failed to create user:', createErr.message);
       }
    }
  }
  process.exit(0);
}

run();
