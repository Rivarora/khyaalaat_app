'use server';

import type { Poetry, Comment, UserInfo } from './definitions';
import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  getDoc,
} from 'firebase/firestore';

const poetryCollection = collection(db, 'poetry');

function poetryFromDoc(doc: any): Poetry {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to JS Date objects
        createdAt: data.createdAt?.toDate(),
        comments: data.comments?.map((c: any) => ({
            ...c,
            createdAt: c.createdAt?.toDate(),
        })) || [],
    };
}


export async function getPoetryData(): Promise<Poetry[]> {
  try {
    const q = query(poetryCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(poetryFromDoc);
  } catch (error) {
    console.error('Error reading poetry data from Firestore:', error);
    return [];
  }
}

export async function addPoetry(poetry: Omit<Poetry, 'id'>) {
    await addDoc(poetryCollection, {
      ...poetry,
      createdAt: serverTimestamp(),
    });
}

export async function deletePoetryById(poetryId: string): Promise<Poetry | undefined> {
  try {
    const docRef = doc(db, 'poetry', poetryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const poetryData = poetryFromDoc(docSnap);
      await deleteDoc(docRef);
      return poetryData;
    }
    return undefined;
  } catch (error) {
    console.error('Error deleting poetry from Firestore:', error);
    return undefined;
  }
}

export async function updatePoetryLikes(poetryId: string, user: UserInfo, isLiked: boolean): Promise<void> {
  try {
    const docRef = doc(db, 'poetry', poetryId);
    if (isLiked) {
      await updateDoc(docRef, {
        likes: arrayUnion(user),
      });
    } else {
      await updateDoc(docRef, {
        likes: arrayRemove(user),
      });
    }
  } catch (error) {
    console.error('Error updating likes in Firestore:', error);
  }
}

export async function addCommentToPoetry(poetryId: string, commentText: string, user: UserInfo): Promise<void> {
  try {
    const docRef = doc(db, 'poetry', poetryId);
    const newComment = {
      id: `${Date.now()}-${Math.random()}`,
      text: commentText,
      user: user,
      createdAt: Timestamp.now(),
    };
    await updateDoc(docRef, {
      comments: arrayUnion(newComment),
    });
  } catch (error) {
    console.error('Error adding comment in Firestore:', error);
  }
}

export async function deleteCommentFromPoetry(poetryId: string, commentId: string): Promise<void> {
  try {
    const docRef = doc(db, 'poetry', poetryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const poetry = docSnap.data() as Poetry;
        const commentToDelete = poetry.comments.find(c => c.id === commentId);

        if(commentToDelete){
            await updateDoc(docRef, {
                comments: arrayRemove(commentToDelete),
                likes: poetry.likes || [],
            });
        }
    }
  } catch (error) {
    console.error('Error deleting comment from Firestore:', error);
  }
}
