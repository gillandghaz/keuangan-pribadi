import { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

const ReferensiContext = createContext(null);

export function ReferensiProvider({ children }) {
  const { user } = useAuth();
  const [referensi, setReferensi] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setReferensi([]); setLoading(false); return; }
    const q = query(
      collection(db, 'users', user.uid, 'referensi'),
      orderBy('kategori'),
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReferensi(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const kategoriList = [...new Set(referensi.map(r => r.kategori))].sort();
  const pemasukan = referensi.filter(r => r.kategori === 'Pemasukan');
  const pengeluaran = referensi.filter(r => r.kategori !== 'Pemasukan');

  function subkategoriFor(kategori) {
    return referensi.filter(r => r.kategori === kategori).map(r => r.subkategori);
  }

  return (
    <ReferensiContext.Provider value={{ referensi, loading, kategoriList, pemasukan, pengeluaran, subkategoriFor }}>
      {children}
    </ReferensiContext.Provider>
  );
}

export function useReferensi() {
  return useContext(ReferensiContext);
}
