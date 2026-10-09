import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, inMemoryPersistence } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCDyD95sj4uP_ltPsVQHsvyJyDy3Zu_yVw",
  authDomain: "project-0a11be79-79d4-4881-b4f.firebaseapp.com",
  projectId: "project-0a11be79-79d4-4881-b4f",
  storageBucket: "project-0a11be79-79d4-4881-b4f.firebasestorage.app",
  messagingSenderId: "686785706766",
  appId: "1:686785706766:web:9d1d7a017ca3b71061b55f",
  firestoreDatabaseId: "ai-studio-mindsafeai-b2dff81f-0e76-409a-9036-c975efc7b441"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Safe persistence setup for iframe/third-party cookie restrictions
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    setPersistence(auth, inMemoryPersistence).catch(() => {});
  });
}

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Validate Connection to Firestore on startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration or network status.", error);
    }
  }
}

testConnection();
