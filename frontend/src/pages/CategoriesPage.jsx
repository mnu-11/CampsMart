import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { CATEGORIES, CATEGORY_ICONS } from '../utils/helpers';
import { TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

const CATEGORY_GRADIENTS = {
  'Books & Notes': 'from-amber-400/20 to-orange-300/10',
  'Electronics': 'from-blue-400/20 to-cyan-300/10',
  'Bicycles & Transport': 'from-emerald-400/20 to-green-300/10',
  'Furniture': 'from-orange-400/20 to-amber-300/10',
  'Clothing': 'from-pink-400/20 to-rose-300/10',
  'Sports & Fitness': 'from-red-400/20 to-orange-300/10',
  'Stationery': 'from-yellow-400/20 to-lime-300/10',
  'Instruments': 'from-purple-400/20 to-violet-300/10',
  'Other': 'from-slate-300/20 to-slate-200/10',
};

export default function CategoriesPage() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      CATEGORIES.map(cat =>
        api.get(`/items?category=${encodeURIComponent(cat)}&limit=1`)
          .then(res => ({ cat, count: res.data.pagination.total }))
          .catch(() => ({ cat, count: 0 }))
      )
    ).then(results => {
      const map = {};
      results.forEach(({ cat, count }) => { map[cat] = count; });
      setCounts(map);
    }).finally(() => setLoading(false));
  }, []);

  const totalItems = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen pt-32 pb-16">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#dbeafe] to-[#f0f4ff] dark:from-[#050810] dark:to-[#070c18] pb-14 pt-4 mb-12">
        <div className="absolute -top-20 right-0 w-72 h-72 bg-blue-400/15 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="page-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-white/8 backdrop-blur-md rounded-full px-4 py-1.5 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-5 border border-blue-200/50 dark:border-blue-500/20">
            <TrendingUp size={11} />
            {loading ? '...' : `${totalItems} items available`}
          </div>
          <h1 className="font-display text-5xl font-bold mb-3">
            Browse <span className="text-blue-600 dark:text-blue-400">Categories</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-md mx-auto">
            Find exactly what you need from fellow students — textbooks to bicycles and more.
          </p>
        </div>
      </div>

      <div className="page-container max-w-5xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat}
              to={`/?category=${encodeURIComponent(cat)}`}
              className="card card-hover group relative overflow-hidden p-7 flex flex-col items-center gap-4 text-center animate-fade-in"
              style={{ animationDelay: `${i * 55}ms` }}
            >
              {/* Gradient bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_GRADIENTS[cat] || 'from-slate-100/30 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />

              <div className="text-5xl group-hover:scale-110 transition-transform duration-300 select-none relative z-10">
                {CATEGORY_ICONS[cat]}
              </div>

              <div className="relative z-10">
                <h3 className="font-display font-bold text-base mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {cat}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-500 bg-[#f0f4ff] dark:bg-[#0f1628] px-3 py-1 rounded-full font-medium">
                  {loading ? '·' : `${counts[cat] || 0} items`}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 relative z-10">
                Browse <ArrowRight size={11} />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="btn-primary">
            <Sparkles size={15} />
            View all {totalItems} listings
          </Link>
        </div>
      </div>
    </div>
  );
}
