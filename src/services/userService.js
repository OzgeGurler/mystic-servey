import { db } from "../services/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

const usersCollection = collection(db, "users");

// Kullanıcıları getir
const getAllUsers = async () => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Yeni kullanıcı ekle
const addUser = async (userData) => {
  await addDoc(usersCollection, {
    ...userData,
    isActive: true,
    createdAt: serverTimestamp(),
    completesurvey: 0
  });
};

// Kullanıcıyı güncelle
const updateUser = async (id, updatedData) => {
  const userDoc = doc(db, "users", id);
  await updateDoc(userDoc, updatedData);
};

// Kullanıcı sil
const deleteUser = async (id) => {
  const userDoc = doc(db, "users", id);
  await deleteDoc(userDoc);
};

// Kullanıcı aktif/pasif durumu değiştir
const toggleUserStatus = async (id, newStatus) => {
  const userDoc = doc(db, "users", id);
  await updateDoc(userDoc, { isActive: newStatus });
};
// Kullanıcı istatistiklerini getir
const getUserStats = async () => {
  const snapshot = await getDocs(usersCollection);
  let total = 0;
  let active = 0;
  let inactive = 0;

  snapshot.forEach(doc => {
    total++;
    if (doc.data().isActive) {
      active++;
    } else {
      inactive++;
    }
  });

  return { total, active, inactive };
};

export default {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats,
};
