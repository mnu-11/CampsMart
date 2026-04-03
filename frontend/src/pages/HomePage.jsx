import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ArrowUpDown, TrendingUp, Shield, Users, Sparkles, Zap, ChevronRight, ShoppingBag, Globe } from 'lucide-react';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';
import SkeletonCard from '../components/SkeletonCard';
import FilterPanel from '../components/FilterPanel';
import { CATEGORIES, CATEGORY_ICONS, formatPrice } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'views-desc', label: 'Most Viewed' },
];

const CATEGORY_META = {
  'All': { img: '/images/homepage_hero_student_stationery_1775149180599.png', color: 'blue' },
  'Books & Notes': { img: '/images/category_books_aesthetic_1775149335960.png', color: 'amber' },
  'Electronics': { img: '/images/category_electronics_minimalist_1775149378728.png', color: 'indigo' },
  'Stationery': { img: '/images/category_stationery_pens_1775149744869.png', color: 'rose' },
  'Lab Equipment': { img: '/images/category_lab_equipment_1775149309087.png', color: 'emerald' },
  'Bicycles & Transport': { img: '/images/homepage_hero_student_stationery_1775149180599.png', color: 'cyan' },
  'Furniture': { img: '/images/category_books_aesthetic_1775149335960.png', color: 'orange' },
  'Clothing': { img: '/images/category_stationery_pens_1775149744869.png', color: 'pink' },
  'Sports & Fitness': { img: '/images/category_lab_equipment_1775149309087.png', color: 'lime' },
  'Instruments': { img: '/images/category_books_aesthetic_1775149335960.png', color: 'violet' },
  'Other': { img: '/images/homepage_hero_student_stationery_1775149180599.png', color: 'slate' },
};

export default function HomePage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    minPrice: '', maxPrice: '', condition: '',
    sortBy: 'createdAt', order: 'desc', page: 1,
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category && filters.category !== 'All') params.set('category', filters.category);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.condition) params.set('condition', filters.condition);
      params.set('sortBy', filters.sortBy);
      params.set('order', filters.order);
      params.set('page', filters.page);
      params.set('limit', '12');
      const res = await api.get(`/items?${params}`);
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleFilterChange = (key, value) => {
    if (key === 'category') {
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll back for visual effect
    }
    setFilters(p => ({ ...p, [key]: value, page: 1 }));
  };
  const handleSearch = (e) => { e.preventDefault(); setFilters(p => ({ ...p, search: searchInput, page: 1 })); };
  const resetFilters = () => { setFilters({ search: '', category: 'All', minPrice: '', maxPrice: '', condition: '', sortBy: 'createdAt', order: 'desc', page: 1 }); setSearchInput(''); setSearchParams({}); };

  const currentMeta = CATEGORY_META[filters.category] || CATEGORY_META['All'];
  const activeFilterCount = [filters.category !== 'All', filters.minPrice, filters.maxPrice, filters.condition].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f8faff] dark:bg-[#03050a] transition-colors duration-500 overflow-x-hidden">

      {/* ── Realistic Lighting ── */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* ── Seamless Layered Hero ── */}
      <section className="relative pt-32 pb-24 z-10 overflow-hidden min-h-[70vh] flex items-center">

        {/* Layer 1: The Image (Dynamic Shift) */}
        <div
          className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out scale-110"
          style={{
            backgroundImage: `url(${currentMeta.img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px) saturate(1.1) brightness(0.8)',
            transition: 'background-image 0.8s ease'
          }}
        />

        {/* Layer 2: Theme Glow Overlay */}
        <div
          className="absolute inset-0 z-[1] transition-colors duration-[1.5s]"
          style={{
            background: `radial-gradient(circle at 70% 30%, ${currentMeta.color === 'blue' ? 'rgba(37, 99, 235, 0.35)' :
                currentMeta.color === 'amber' ? 'rgba(217, 119, 6, 0.35)' :
                  currentMeta.color === 'rose' ? 'rgba(225, 29, 72, 0.35)' :
                    'rgba(37, 99, 235, 0.35)'
              }, transparent 60%)`
          }}
        />

        {/* Layer 3: Contrast Vingette (Stronger Behind Text) */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-br from-black/40 via-black/30 to-transparent dark:from-black/60 dark:via-black/40 dark:to-transparent" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-[#f8faff] via-transparent to-transparent dark:from-[#03050a]" />

        <div className="page-container relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16">

            {/* Left Content */}
            <div className={`flex-1 text-center lg:text-left space-y-8 text-white`}>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 animate-enter">
                <Sparkles size={14} className="text-white" />
                <span className="text-xs font-bold text-white uppercase tracking-widest">{filters.category === 'All' ? 'Every Student Resource' : `Exploring ${filters.category}`}</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] animate-enter drop-shadow-2xl" style={{ animationDelay: '100ms' }}>
                Campus Deals<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Unlocked.</span>
              </h1>

              <p className="text-lg text-white/80 max-w-xl mx-auto lg:mx-0 animate-enter font-medium drop-shadow-lg" style={{ animationDelay: '200ms' }}>
                Join our trusted community of students. List in seconds, find exactly what you need for this semester.
              </p>

              {/* Bento Search */}
              <form onSubmit={handleSearch} className="relative group max-w-2xl animate-enter" style={{ animationDelay: '300ms' }}>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white dark:bg-[#0a0f1e] rounded-2xl p-1.5 shadow-xl border border-white dark:border-slate-800">
                  <div className="flex-1 flex items-center px-4">
                    <Search className="text-slate-400 mr-3" size={20} />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      placeholder="Search books, cycles, furniture..."
                      className="w-full bg-transparent border-none outline-none py-4 text-base font-medium dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className={`bg-${currentMeta.color === 'amber' ? 'amber' : 'blue'}-600 hover:brightness-110 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl`}
                  >
                    Explore
                  </button>
                </div>
              </form>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-4 animate-enter" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Verified</p>
                    <p className="text-xs font-bold text-white">ID-Checked Students</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-white/60 tracking-wider">Rapid</p>
                    <p className="text-xs font-bold text-white">Meetup in 24h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Bento Assets (Interactive) */}
            <div className="flex-1 relative hidden lg:block animate-enter" style={{ animationDelay: '200ms' }}>
              <div className="grid grid-cols-2 gap-4">

                {/* Study Sync -> Filters Books */}
                <div
                  onClick={() => handleFilterChange('category', 'Books & Notes')}
                  className="p-6 aspect-square flex flex-col justify-between rounded-3xl group bg-white/10 backdrop-blur-md border border-white/20 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/5 hover:bg-white/15"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform border border-white/20">📚</div>
                  <div>
                    <p className="text-xl font-black text-white leading-none mb-1 drop-shadow-sm">Study Sync</p>
                    <p className="text-[10px] uppercase font-bold text-white/60 tracking-widest whitespace-nowrap drop-shadow-sm">Filter Academic</p>
                  </div>
                </div>

                {/* Market Link -> Resets Everything */}
                <div
                  onClick={resetFilters}
                  className={`p-6 aspect-square rounded-3xl text-white flex flex-col justify-between cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-2xl duration-700 ${currentMeta.color === 'amber' ? 'bg-gradient-to-br from-amber-500/90 to-orange-600/90' :
                      currentMeta.color === 'rose' ? 'bg-gradient-to-br from-rose-500/90 to-pink-600/90' :
                        'bg-gradient-to-br from-blue-600/90 to-indigo-700/90'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/20 shadow-inner"><Globe size={20} /></div>
                    <span className="bg-white/20 px-2 py-1 rounded text-[8px] font-black tracking-[0.2em] uppercase border border-white/10">RESET HUB</span>
                  </div>
                  <div>
                    <p className="font-black text-xl leading-none uppercase tracking-tighter mb-1 drop-shadow-sm">Explore All</p>
                    <p className="text-[10px] text-white/70 font-bold tracking-widest uppercase drop-shadow-sm">Campus Link</p>
                  </div>
                </div>

                {/* Peer To Peer -> Scrolls to Drops */}
                <div
                  onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })}
                  className="p-6 col-span-2 rounded-3xl flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 cursor-pointer hover:border-blue-400 group transition-all hover:bg-white/15"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl flex items-center justify-center text-white border border-white/20 backdrop-blur-xl group-hover:bg-blue-600 transition-colors shadow-lg"><Zap size={28} fill="currentColor" /></div>
                    <div>
                      <p className="font-black text-xl text-white leading-none mb-1 drop-shadow-sm">Peer To Peer</p>
                      <p className="text-xs text-white/60 font-bold uppercase tracking-widest leading-none drop-shadow-sm">Scroll to active drops</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/10 group-hover:bg-blue-600 text-white flex items-center justify-center transition-all border border-white/10"><ChevronRight size={24} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category Strip ── */}
      <section className="relative z-20 -mt-10 overflow-hidden">
        <div className="page-container">
          <div className="glass shadow-2xl shadow-blue-500/5 p-3 rounded-[2rem] flex items-center gap-3 overflow-x-auto scrollbar-none border-white/50">
            {['All', ...CATEGORIES].map(cat => {
              const active = filters.category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleFilterChange('category', cat)}
                  className={`flex-shrink-0 flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${active
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105'
                      : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-400'
                    }`}
                >
                  <span className="text-xl grayscale-[0.8] group-hover:grayscale-0">{cat === 'All' ? '🏪' : CATEGORY_ICONS[cat]}</span>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Marketplace Content ── */}
      <section className="pt-20 pb-40">
        <div className="page-container">

          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-1">
              <h2 className="text-4xl font-extrabold dark:text-white flex items-center gap-3">
                Latest Drops
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              </h2>
              <p className="text-slate-500 text-sm">Discover what's trending across your campus.</p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs border-2 transition-all ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
              >
                <SlidersHorizontal size={14} />
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>

              <div className="relative">
                <select
                  value={`${filters.sortBy}-${filters.order}`}
                  onChange={e => { const [s, o] = e.target.value.split('-'); setFilters(p => ({ ...p, sortBy: s, order: o })) }}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs px-5 py-2.5 rounded-xl outline-none appearance-none pr-10"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ArrowUpDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" size={12} />
              </div>
            </div>
          </div>

          <div className="flex gap-10">
            {showFilters && (
              <aside className="w-64 hidden lg:block shrink-0 animate-enter">
                <FilterPanel filters={filters} onChange={handleFilterChange} onReset={resetFilters} />
              </aside>
            )}

            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800/60">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 text-3xl">🔍</div>
                  <h3 className="text-2xl font-bold dark:text-white">No items found</h3>
                  <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Try clearing your filters or search for something else like "Cycle".</p>
                  <button onClick={resetFilters} className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold">See All Items</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item, i) => (
                      <div key={item._id} className="animate-enter" style={{ animationDelay: `${i * 50}ms` }}>
                        <ItemCard item={item} />
                      </div>
                    ))}
                  </div>

                  {pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-16 font-bold">
                      <button onClick={() => handleFilterChange('page', filters.page - 1)} disabled={filters.page === 1} className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 disabled:opacity-30">←</button>
                      <div className="bg-white dark:bg-slate-900 px-6 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-sm">
                        Page {filters.page} of {pagination.pages}
                      </div>
                      <button onClick={() => handleFilterChange('page', filters.page + 1)} disabled={filters.page === pagination.pages} className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 disabled:opacity-30">→</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
