// Reusable form field wrapper
export function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-300 dark:border-slate-600
        bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
        px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent
        placeholder:text-slate-400 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full rounded-lg border border-slate-300 dark:border-slate-600
        bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
        px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      rows={3}
      className={`w-full rounded-lg border border-slate-300 dark:border-slate-600
        bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100
        px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent
        placeholder:text-slate-400 resize-none ${className}`}
      {...props}
    />
  );
}

export function Btn({ variant = 'primary', className = '', children, ...props }) {
  const variants = {
    primary: 'bg-[#1e3a5f] hover:bg-[#2d5f8a] text-white',
    accent: 'bg-[#4a90d9] hover:bg-blue-600 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  };
  return (
    <button
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
