import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

const NotifContext = createContext(null);

export function NotifProvider({ children }) {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    if (!user) { setNotifs([]); return; }
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setNotifs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [user]);

  const unreadCount = notifs.filter(n => !n.read).length;

  const addNotif = useCallback(async ({ type, message, link = '' }) => {
    if (!user) return;
    // Avoid duplicate: same type+message within last 24h
    const recent = notifs.find(n =>
      n.type === type && n.message === message &&
      n.createdAt?.seconds > Date.now() / 1000 - 86400
    );
    if (recent) return;
    await addDoc(collection(db, 'users', user.uid, 'notifications'), {
      type, message, link, read: false, createdAt: serverTimestamp(),
    });
  }, [user, notifs]);

  const markRead = useCallback(async (id) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { read: true });
  }, [user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const batch = writeBatch(db);
    notifs.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'users', user.uid, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  }, [user, notifs]);

  return (
    <NotifContext.Provider value={{ notifs, unreadCount, addNotif, markRead, markAllRead }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotif() {
  return useContext(NotifContext);
}
