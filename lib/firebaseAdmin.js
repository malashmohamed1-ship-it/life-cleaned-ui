import { initializeApp, getApps, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential:
        process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
          ? cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
            })
          : applicationDefault(),
    });

export const adminDb = getFirestore(app);
