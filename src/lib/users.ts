'use server';

import type { User } from './definitions';
import { db, storage } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const usersCollection = collection(db, 'users');

function userFromDoc(doc: any): User {
  const data = doc.data();
  return {
    uid: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
  };
}

export async function createUserDocument(uid: string, email: string, name: string): Promise<User> {
  const role = email === 'arorariva19@gmail.com' ? 'admin' : 'user';
  
  const userData: Omit<User, 'uid'> = {
    name,
    email,
    role,
    createdAt: new Date(),
  };

  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      createdAt: serverTimestamp(),
    });

    return { uid, ...userData };
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
}

export async function getUserDocument(uid: string): Promise<User | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return userFromDoc(docSnap);
    }
    return null;
  } catch (error) {
    console.error('Error getting user document:', error);
    return null;
  }
}

export async function updateUserProfile(
  uid: string, 
  updates: Partial<Pick<User, 'name' | 'photoURL'>>
): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function uploadUserAvatar(uid: string, file: File): Promise<string> {
  try {
    const imageRef = ref(storage, `avatars/${uid}/${file.name}`);
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update user document with new photo URL
    await updateUserProfile(uid, { photoURL: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

export async function deleteUserAvatar(uid: string, photoURL: string): Promise<void> {
  try {
    // Extract path from URL and delete from storage
    const pathRegex = /avatars%2F[^?]+/;
    const match = photoURL.match(pathRegex);
    
    if (match) {
      const decodedPath = decodeURIComponent(match[0]);
      const imageRef = ref(storage, decodedPath);
      await deleteObject(imageRef);
    }
    
    // Update user document to remove photo URL
    await updateUserProfile(uid, { photoURL: undefined });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const querySnapshot = await getDocs(usersCollection);
    return querySnapshot.docs.map(userFromDoc);
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}

export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const user = await getUserDocument(uid);
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}