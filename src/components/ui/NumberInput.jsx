import { useState, useEffect } from 'react';
import { parseRp } from '../../lib/formatters';

// IDR-formatted number input supporting decimals: "1.500.000,55"
export default function NumberInput({ value, onChange, placeholder = '0', className = '', prefix = 'Rp ', decimals = 0, ...props }) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    if (value === '' || value === null || value === undefined || value === 0) {
      setDisplay('');
    } else {
      const num = Number(value);
      if (!isNaN(num) && num !== 0) {
        setDisplay(num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: decimals }));
      }
    }
  }, [value, decimals]);

  function handleChange(e) {
    const raw = e.target.value;
    setDisplay(raw);
    const num = parseRp(raw);
    onChange(num);
  }

  function handleBlur() {
    const num = parseRp(display);
    if (num !== 0) {
      setDisplay(num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: decimals }));
      onChange(num);
    } else {
      setDisplay('');
      onChange(0);
    }
  }

  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute left-3 text-sm text-slate-500 dark:text-slate-400 pointer-events-none select-none">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-slate-300 dark:border-slate-600
          bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
          px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent
          ${prefix ? 'pl-10' : ''} ${className}`}
        {...props}
      />
    </div>
  );
}
