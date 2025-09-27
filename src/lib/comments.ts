'use server';

import type { Comment, UserInfo } from './definitions';
import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

function commentFromDoc(doc: any): Comment {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
  };
}

export async function getCommentsForPoetry(poetryId: string): Promise<Comment[]> {
  try {
    const commentsCollection = collection(db, 'poetry', poetryId, 'comments');
    const q = query(commentsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(commentFromDoc);
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}

export async function addCommentToPoetry(
  poetryId: string, 
  commentText: string, 
  user: UserInfo
): Promise<string> {
  try {
    const commentsCollection = collection(db, 'poetry', poetryId, 'comments');
    const docRef = await addDoc(commentsCollection, {
      text: commentText,
      user: user,
      createdAt: serverTimestamp(),
    });
    
    // Update comments count in the main poetry document
    await updatePoetryCommentsCount(poetryId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

export async function updateComment(
  poetryId: string,
  commentId: string,
  newText: string
): Promise<void> {
  try {
    const commentDoc = doc(db, 'poetry', poetryId, 'comments', commentId);
    await updateDoc(commentDoc, {
      text: newText,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}

export async function deleteCommentFromPoetry(
  poetryId: string, 
  commentId: string
): Promise<void> {
  try {
    const commentDoc = doc(db, 'poetry', poetryId, 'comments', commentId);
    await deleteDoc(commentDoc);
    
    // Update comments count in the main poetry document
    await updatePoetryCommentsCount(poetryId);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

async function updatePoetryCommentsCount(poetryId: string): Promise<void> {
  try {
    const comments = await getCommentsForPoetry(poetryId);
    const poetryDoc = doc(db, 'poetry', poetryId);
    await updateDoc(poetryDoc, {
      commentsCount: comments.length,
    });
  } catch (error) {
    console.error('Error updating comments count:', error);
  }
}

export async function getUserComments(userId: string): Promise<(Comment & { poetryId: string; poetryTitle: string })[]> {
  try {
    // This is a more complex query that requires getting all poetry documents
    // and then checking their comments subcollections
    const poetryCollection = collection(db, 'poetry');
    const poetrySnapshot = await getDocs(poetryCollection);
    
    const userComments: (Comment & { poetryId: string; poetryTitle: string })[] = [];
    
    for (const poetryDoc of poetrySnapshot.docs) {
      const commentsCollection = collection(db, 'poetry', poetryDoc.id, 'comments');
      const commentsSnapshot = await getDocs(commentsCollection);
      
      commentsSnapshot.docs.forEach(commentDoc => {
        const comment = commentFromDoc(commentDoc);
        if (comment.user.id === userId) {
          userComments.push({
            ...comment,
            poetryId: poetryDoc.id,
            poetryTitle: poetryDoc.data().title,
          });
        }
      });
    }
    
    // Sort by creation date (newest first)
    return userComments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error getting user comments:', error);
    return [];
  }
}