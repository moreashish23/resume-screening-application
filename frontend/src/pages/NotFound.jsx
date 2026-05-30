import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-8xl font-extrabold text-slate-800">404</p>
      <p className="font-display text-2xl font-bold text-white mt-4 mb-2">Page not found</p>
      <p className="text-slate-400 mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="px-6 py-3 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-xl text-sm font-medium hover:bg-cyan-500/25 transition-all">
        Go Home
      </Link>
    </div>
  );
}