const variants = {
  cyan: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
  green: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  red: 'bg-red-500/15 text-red-300 border border-red-500/30',
  amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  slate: 'bg-slate-700/50 text-slate-300 border border-slate-600/50',
};

export default function Badge({ children, variant = 'slate', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}