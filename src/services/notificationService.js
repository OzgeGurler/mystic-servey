import { db } from "./firebaseConfig";
import { collection, addDoc, onSnapshot, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";

const notificationsCol = collection(db, "notifications");

export const subscribeToNotifications = (userId, onChange) => {
  const unsubUser = onSnapshot(
    query(notificationsCol, where("target", "==", userId)),
    (snap) => {
      const userItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      onChange((prevAll) => {
        const other = (prevAll || []).filter(n => n.target !== userId);
        return sortItems([...other, ...userItems]);
      });
    }
  );

  const unsubGlobal = onSnapshot(
    query(notificationsCol, where("target", "==", "all")),
    (snap) => {
      const globalItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      onChange((prevAll) => {
        const others = (prevAll || []).filter(n => n.target !== "all");
        return sortItems([...others, ...globalItems]);
      });
    }
  );

  return () => { unsubUser(); unsubGlobal(); };
};

export const markAllRead = async (userId) => {
  const [userSnap, globalSnap] = await Promise.all([
    getDocs(query(notificationsCol, where("target", "==", userId), where("read", "==", false))),
    getDocs(query(notificationsCol, where("target", "==", "all"), where("read", "==", false))),
  ]);
  const updates = [...userSnap.docs, ...globalSnap.docs].map(d => updateDoc(doc(db, "notifications", d.id), { read: true }));
  await Promise.all(updates);
};

export const addNotification = async ({ target = "all", type = "info", title, message }) => {
  await addDoc(notificationsCol, {
    target,
    type,
    title,
    message,
    read: false,
    createdAt: serverTimestamp(),
  });
};

const sortItems = (items) => {
  return [...items].sort((a, b) => {
    const ta = a.createdAt?.seconds || 0;
    const tb = b.createdAt?.seconds || 0;
    return tb - ta;
  }).slice(0, 50);
};

export default { subscribeToNotifications, markAllRead, addNotification }; 