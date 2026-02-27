'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore } from 'firebase/firestore';

let cachedSdks: { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore } | null = null;

export function initializeFirebase() {
  if (cachedSdks) return cachedSdks;

  let firebaseApp: FirebaseApp;
  
  if (getApps().length > 0) {
    firebaseApp = getApp();
  } else {
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      firebaseApp = getApp();
    }
  }

  const firestore = initializeFirestore(firebaseApp, {
    experimentalForceLongPolling: true,
    // @ts-ignore
    useFetchStreams: false,
    ignoreUndefinedProperties: true,
  });

  cachedSdks = {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore
  };

  return cachedSdks;
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';