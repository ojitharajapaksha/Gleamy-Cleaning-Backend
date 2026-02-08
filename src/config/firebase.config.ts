import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

let firebaseInitialized = false;

export const initializeFirebase = () => {
  if (firebaseInitialized) {
    return;
  }

  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
    const serviceAccountFullPath = join(process.cwd(), serviceAccountPath);
    
    const serviceAccount = JSON.parse(readFileSync(serviceAccountFullPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    throw error;
  }
};

export const getAuth = () => {
  if (!firebaseInitialized) {
    initializeFirebase();
  }
  return admin.auth();
};

export default admin;
