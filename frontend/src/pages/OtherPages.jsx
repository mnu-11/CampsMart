import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';
import SkeletonCard from '../components/SkeletonCard';
import { getInitials, formatDate, CATEGORIES, CATEGORY_ICONS } from '../utils/helpers';
import { MapPin, Building, Calendar, Package } from 'lucide-react';

export function SellerProfilePage() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/users/${id}`),
      api.get(`/users/${id}/items`),
    ]).then(([userRes, itemsRes]) => {
      setSeller(userRes.data.user);
      setStats(userRes.data.stats);
      setItems(itemsRes.data.items);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen pt-32 pb-12 bg-slate-50 dark:bg-[#080d17]">
      <div className="page-container max-w-4xl">
        <div className="skeleton h-48 rounded-2xl mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    </div>
  );

  if (!seller) return <div className="pt-32 text-center text-slate-500">User not found</div>;

  return (
    <div className="min-h-screen pt-32 pb-12 bg-slate-50 dark:bg-[#080d17]">
      <div className="page-container max-w-4xl">
        {/* Seller Card */}
        <div className="card p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl flex-shrink-0">
              {seller.avatar
                ? <img src={seller.avatar} className="w-20 h-20 rounded-2xl object-cover" alt={seller.name} />
                : getInitials(seller.name)
              }
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">{seller.name}</h1>
              {seller.bio && <p className="text-slate-500 text-sm mt-1 leading-relaxed">{seller.bio}</p>}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                {seller.university && <span className="flex items-center gap-1.5"><Building size={13} />{seller.university}</span>}
                {seller.location && <span className="flex items-center gap-1.5"><MapPin size={13} />{seller.location}</span>}
                <span className="flex items-center gap-1.5"><Calendar size={13} />Joined {formatDate(seller.createdAt)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">{stats.itemCount || 0}</p>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">{stats.soldCount || 0}</p>
                  <p className="text-xs text-slate-500">Sold</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="section-title mb-5">
          <Package size={20} className="inline mr-2 text-blue-500" />
          Listings by {seller.name.split(' ')[0]}
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>No active listings from this seller.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
