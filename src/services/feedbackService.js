import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';

const feedbackCol = collection(db, 'feedback');

export const addFeedback = async ({ name, email, subject, message, rating = 0, userId = null }) => {
  await addDoc(feedbackCol, {
    name: name || null,
    email: email || null,
    subject: subject || '',
    message: message || '',
    rating: Number(rating) || 0,
    userId: userId || null,
    createdAt: serverTimestamp(),
    status: 'new'
  });
};

export const listFeedback = async () => {
  const snap = await getDocs(query(feedbackCol, orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export default { addFeedback, listFeedback }; 