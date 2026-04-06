import admin from "firebase-admin";

const initializeFirebaseAdmin = () => {
  if (!admin.apps.length) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const projectId = process.env.FIREBASE_PROJECT_ID;

      if (!privateKey || !clientEmail || !projectId) {
        console.warn(
          "Firebase Admin SDK: Missing environment variables. Admin functionality will be unavailable.",
        );
        return null;
      }

      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
    } catch (error) {
      console.error("Firebase admin initialization error:", error);
      return null;
    }
  }
  return admin.app();
};

const app = initializeFirebaseAdmin();

export const adminDb = app ? admin.firestore() : null;
export const adminAuth = app ? admin.auth() : null;
export const adminStorage = app ? admin.storage() : null;
export { admin };
