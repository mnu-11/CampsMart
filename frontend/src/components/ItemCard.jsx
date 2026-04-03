import { Link } from 'react-router-dom';
import { MapPin, Clock, Sparkles, Zap, Package, Calendar } from 'lucide-react';
import { formatPrice, timeAgo, getInitials, CATEGORY_ICONS, PLACEHOLDER_IMAGE } from '../utils/helpers';

const CONDITION_STYLES = {
  'Like New': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  'Good': 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  'Fair': 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'For Parts': 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

export default function ItemCard({ item }) {
  const image = item.images?.[0]?.url || PLACEHOLDER_IMAGE;
  const seller = item.sellerId;

  return (
    <Link to={`/items/${item._id}`} className="group block">
      <div className="card h-full flex flex-col overflow-hidden bg-white dark:bg-[#0a0f1e] border-slate-100 dark:border-slate-800/60 shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-blue-500/10 group-hover:border-blue-500/30">
        
        {/* Product Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-900">
          <img
            src={image} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          
          {/* Top Overlays */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <div className="glass px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
               <span className="text-lg">{CATEGORY_ICONS[item.category] || '📦'}</span>
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">{item.category}</span>
            </div>
            
            {item.isForRent && (
              <div className="bg-amber-500 text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 border border-amber-400/50">
                 <Calendar size={12} fill="currentColor" className="opacity-80" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">Rent Available</span>
              </div>
            )}
          </div>

          {/* Premium Promotion */}
          {item.isPremiumPromotion && (
            <div className="absolute top-3 right-3">
              <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-2 rounded-xl shadow-xl animate-float">
                <Sparkles size={16} className="text-white" fill="white" />
              </div>
            </div>
          )}

          {/* Price Overlay (Realistic Glass) */}
          <div className="absolute bottom-4 left-4 right-4">
             <div className="glass p-3 rounded-2xl flex items-center justify-between border-white/40 shadow-xl">
                <div>
                   <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">Buy Now</p>
                   <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400 leading-none">{formatPrice(item.price)}</p>
                </div>
                {item.isNegotiable && (
                  <div className="bg-blue-600 text-white rounded-lg p-1.5" title="Price Negotiable">
                     <Zap size={14} fill="currentColor" />
                  </div>
                )}
             </div>
          </div>

          {/* Sold Overlay */}
          {item.isSold && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
              <div className="border-4 border-red-500 text-red-500 px-6 py-2 rounded-xl font-black text-2xl uppercase tracking-tighter rotate-[-12deg] shadow-2xl opacity-90 scale-125">
                 Sold Out
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-bold text-base leading-tight text-slate-900 dark:text-white line-clamp-1 flex-1">{item.title}</h3>
            <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${CONDITION_STYLES[item.condition] || 'bg-slate-50'}`}>
              {item.condition}
            </span>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
            {item.description}
          </p>

          {/* Footer Card */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-[10px] font-bold text-blue-700 overflow-hidden border border-white dark:border-slate-800">
                {seller?.avatar ? <img src={seller.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(seller?.name || 'U')}
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{seller?.name?.split(' ')[0] || 'Student'}</span>
            </div>
            
            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-600">
              <div className="flex items-center gap-1">
                <MapPin size={11} strokeWidth={2.5} />
                <span className="text-[11px] font-medium">{item.location || 'Campus'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={11} strokeWidth={2.5} />
                <span className="text-[11px] font-medium">{timeAgo(item.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
