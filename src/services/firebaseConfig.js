import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeVMwLsO2raWMjiXNM6DPK_n2FvTgmuPM",
  authDomain: "mystic-servey.firebaseapp.com",
  projectId: "mystic-servey",
  storageBucket: "mystic-servey.firebasestorage.app",
  messagingSenderId: "653959214569",
  appId: "1:653959214569:web:59a234e519692555388778",
  measurementId: "G-DPFTG8M4ZR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app)