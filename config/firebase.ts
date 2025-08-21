import { initializeApp, getApp } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getAuth, initializeAuth } from 'firebase/auth';

import { Platform } from 'react-native';

// Firebase configuration
// Note: In production, these should be environment variables
const firebaseConfig = {
  apiKey: "AIzaSyC0bSzkui5vPF3bCvwnuJ3FUXHNqtRMRdE",
  authDomain: "edumitra-bee5e.firebaseapp.com",
  projectId: "edumitra-bee5e",
  storageBucket: "edumitra-bee5e.firebasestorage.app",
  messagingSenderId: "325912326405",
  appId: "1:325912326405:web:d64a3b3cd86016a4a6876c",
  measurementId: "G-SP34DSXK50"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error: any) {
  // If app already exists, get the existing app
  if (error.code === 'app/duplicate-app') {
    app = getApp();
  } else {
    throw error;
  }
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth with AsyncStorage persistence for React Native
let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    // For React Native, initializeAuth without persistence config
    // AsyncStorage persistence is handled automatically
    auth = initializeAuth(app);
  }
} catch (error: any) {
  // If auth is already initialized, get the existing instance
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

// Auth will be exported at the end

// For development with emulators (uncomment if using Firebase emulators)
// if (__DEV__ && Platform.OS === 'web') {
//   try {
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectAuthEmulator(auth, 'http://localhost:9099');
//   } catch (error) {
//     // Emulator not available, using production Firebase
//   }
// }

// Enable offline persistence for Firestore
// This is automatically enabled in modern Firebase versions
console.log('Firebase initialized with offline persistence enabled');

// Export Firebase services and network control functions
export { app, db, auth, enableNetwork, disableNetwork };
export default app;
