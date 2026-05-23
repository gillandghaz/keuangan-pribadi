import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp, getDocs, setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useCollection(uid, colName, orderField = 'createdAt', orderDir = 'desc') {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setDocs([]); setLoading(false); return; }
    let q;
    try {
      q = query(
        collection(db, 'users', uid, colName),
        orderBy(orderField, orderDir)
      );
    } catch {
      q = collection(db, 'users', uid, colName);
    }
    const unsub = onSnapshot(q, snap => {
      setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [uid, colName, orderField, orderDir]);

  return { docs, loading };
}

export async function addDocument(uid, colName, data) {
  return addDoc(collection(db, 'users', uid, colName), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateDocument(uid, colName, docId, data) {
  return updateDoc(doc(db, 'users', uid, colName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(uid, colName, docId) {
  return deleteDoc(doc(db, 'users', uid, colName, docId));
}

export async function setDocument(uid, colName, docId, data) {
  return setDoc(doc(db, 'users', uid, colName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getDocuments(uid, colName) {
  const snap = await getDocs(collection(db, 'users', uid, colName));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
