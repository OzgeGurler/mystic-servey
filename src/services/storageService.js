import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth } from './firebaseConfig';
import { initializeApp } from 'firebase/app';
import { db } from './firebaseConfig';

export const uploadProfilePhoto = async (userId, dataUrl) => {
  const storage = getStorage();
  const fileRef = ref(storage, `profilePhotos/${userId}.jpg`);
  await uploadString(fileRef, dataUrl, 'data_url');
  const url = await getDownloadURL(fileRef);
  return url;
};

export default { uploadProfilePhoto }; 