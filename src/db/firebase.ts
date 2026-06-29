import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let db: Firestore | null = null;

export const initFirebase = () => {
  if (getApps().length === 0) {
    try {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      let config: any = {};
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
      
      const app = initializeApp(config);
      db = getFirestore(app, config.firestoreDatabaseId);
      console.log('Firebase Client SDK initialized');
    } catch (e) {
      console.error('Failed to initialize Firebase Client SDK:', e);
    }
  } else {
    if (!db) {
      const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
      let config: any = {};
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
      db = getFirestore(getApp(), config.firestoreDatabaseId);
    }
  }
};

export const getFirestoreDb = () => db;
