import { createContext, useContext, useState, useEffect } from 'react';
import { getT } from '../lib/i18n';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'id');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = getT(lang);
  const toggle = () => setLang(l => l === 'id' ? 'en' : 'id');
  const setLanguage = (l) => setLang(l);

  return (
    <LangContext.Provider value={{ lang, t, toggle, setLanguage }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
