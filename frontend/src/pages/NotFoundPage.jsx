import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8faff] dark:bg-[#050810]">
      <div className="text-center max-w-md animate-fade-in">
        <div className="font-display text-[120px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-br from-blue-500 to-blue-300 mb-4">
          404
        </div>
        <h1 className="font-display text-2xl font-bold mb-3">Page not found</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist. Maybe the item was already sold?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button onClick={() => navigate(-1)} className="btn-secondary"><ArrowLeft size={15} /> Go back</button>
          <Link to="/" className="btn-primary"><Home size={15} /> Go home</Link>
        </div>
        <div className="pt-6 border-t border-[#e8edf5] dark:border-[#141929]">
          <p className="text-xs text-slate-400 mb-3">Looking for something?</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            const q = e.target.q.value.trim();
            if (q) navigate(`/?search=${encodeURIComponent(q)}`);
          }} className="flex gap-2 max-w-xs mx-auto">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="q" type="text" placeholder="Search items..." className="input pl-10 text-sm py-2.5" />
            </div>
            <button type="submit" className="btn-primary py-2 px-4 text-sm">Search</button>
          </form>
        </div>
      </div>
    </div>
  );
}
