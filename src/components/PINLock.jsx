import { useState, useEffect } from 'react';
import { verifyPIN, recordPINAuth, clearPIN } from '../lib/security';
import { useLang } from '../context/LangContext';

export default function PINLock({ onUnlock }) {
  const { t } = useLang();
  const [digits, setDigits] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  async function handleDigit(d) {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    setError('');
    if (next.length === 4) {
      const storedHash = localStorage.getItem('pin_hash');
      const ok = await verifyPIN(next, storedHash);
      if (ok) {
        recordPINAuth();
        onUnlock();
      } else {
        setShake(true);
        setError(t('pin.wrong'));
        setTimeout(() => { setDigits(''); setShake(false); }, 600);
      }
    }
  }

  function handleBackspace() {
    setDigits(d => d.slice(0, -1));
    setError('');
  }

  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div className="fixed inset-0 z-[200] bg-[#1e3a5f] flex flex-col items-center justify-center">
      <div className="text-6xl mb-6">🔒</div>
      <h2 className="text-white text-xl font-bold mb-2">{t('pin.title')}</h2>
      <p className="text-blue-200 text-sm mb-8">Keuangan Pribadi</p>

      {/* Dots */}
      <div className={`flex gap-4 mb-6 transition-all ${shake ? 'animate-bounce' : ''}`}>
        {[0,1,2,3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 border-blue-300 transition-all
            ${digits.length > i ? 'bg-blue-300 scale-110' : 'bg-transparent'}`} />
        ))}
      </div>

      {error && (
        <p className="text-red-300 text-sm mb-4">{error}</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {keys.map((k, i) => (
          <button
            key={i}
            onClick={() => k === '⌫' ? handleBackspace() : k ? handleDigit(k) : null}
            disabled={!k}
            className={`w-16 h-16 rounded-full text-xl font-bold transition-all
              ${k === '' ? 'invisible' : ''}
              ${k === '⌫'
                ? 'bg-blue-800/50 text-blue-200 hover:bg-blue-700/50'
                : 'bg-white/10 text-white hover:bg-white/20 active:scale-95'
              }`}
          >
            {k}
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          clearPIN();
          window.location.reload();
        }}
        className="text-blue-300/60 text-xs hover:text-blue-200 transition-colors mt-2"
      >
        {t('pin.forgot')}
      </button>
    </div>
  );
}
