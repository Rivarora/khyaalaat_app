
'use server';

import type { PoemRequest } from './definitions';
import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

const requestsCollection = collection(db, 'requests');

function requestFromDoc(doc: any): PoemRequest {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
    };
}


export async function getRequests(): Promise<PoemRequest[]> {
    try {
        const q = query(requestsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(requestFromDoc);
    } catch (error) {
        console.error('Error getting requests from Firestore:', error);
        return [];
    }
}

export async function addRequest(request: Omit<PoemRequest, 'id' | 'createdAt' | 'completed'>) {
    try {
        await addDoc(requestsCollection, {
            ...request,
            completed: false,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error adding request to Firestore:', error);
    }
}

export async function updateRequestStatus(id: string, completed: boolean): Promise<void> {
    try {
        const docRef = doc(db, 'requests', id);
        await updateDoc(docRef, { completed });
    } catch (error) {
        console.error('Error updating request status in Firestore:', error);
    }
}

export async function deleteRequestById(id: string): Promise<void> {
    try {
        const docRef = doc(db, 'requests', id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting request from Firestore:', error);
    }
}
