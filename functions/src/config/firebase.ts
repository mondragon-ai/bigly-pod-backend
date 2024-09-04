import * as admin from "firebase-admin";

admin.initializeApp();

const firestoreDB: FirebaseFirestore.Firestore = admin.firestore();

firestoreDB.settings({
  timestampsInSnapshots: true,
});
export const db = firestoreDB;

export const storage = admin.storage();
