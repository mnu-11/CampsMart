import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ShoppingCart, Tag, MapPin, Eye, Calendar, CheckCircle, Star, Shield, AlertCircle, Loader, Zap, X } from 'lucide-react';
import RentItemModal from '../components/RentItemModal';
import QRCode from 'react-qr-code';

export default function ItemDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyLoading, setBuyLoading] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [showRentModal, setShowRentModal] = useState(false);
  const [showUPIModal, setShowUPIModal] = useState(false);

  useEffect(() => {
    api.get(`/items/${id}`)
      .then(r => setItem(r.data.item))
      .catch(() => toast.error('Item not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (!user) { toast.error('Please login to purchase'); navigate('/login'); return; }
    if (item.adminStatus !== 'approved') { toast.error('This item is not yet approved for sale'); return; }
    if (!item.sellerId?.upiId) {
      toast.error('The seller has not set up their UPI ID yet to receive direct payments.');
      return;
    }

    setShowUPIModal(true);
  };

  const handleConfirmDirectPayment = async () => {
    setBuyLoading(true);
    try {
      await api.post(`/items/${item._id}/direct-buy`);
      toast.success('🎉 Purchase successful! Item marked as sold.');
      setShowUPIModal(false);
      setItem(prev => ({...prev, isSold: true}));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm purchase');
    } finally {
      setBuyLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
  if (!item) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <AlertCircle className="w-16 h-16 text-gray-300" />
      <p className="text-gray-500">Item not found</p>
      <Link to="/" className="text-blue-600 hover:underline">Back to home</Link>
    </div>
  );

  const isOwner = user && item.sellerId?._id && item.sellerId._id === user._id;
  const isAdmin = user?.role === 'admin';
  const canBuy = !isOwner && !isAdmin && !item.isSold && item.adminStatus === 'approved';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 aspect-square">
              {item.images?.length > 0 ? (
                <img src={item.images[activeImg].url} alt={item.title} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Tag className="w-20 h-20" />
                </div>
              )}
            </div>
            {item.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {item.images.map((img, i) => (
                  <img key={i} src={img.url} alt="" onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 object-cover rounded-xl flex-shrink-0 cursor-pointer border-2 transition-all ${activeImg === i ? 'border-blue-600 scale-105' : 'border-transparent'}`} />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              {item.isSold && <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">SOLD</span>}
              {item.adminStatus === 'approved' && !item.isSold && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Admin Verified</span>}
              {item.adminStatus === 'pending' && <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">Pending Review</span>}
              {item.adminRating && <span className="bg-yellow-50 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Admin: {item.adminRating}/5</span>}
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold px-3 py-1 rounded-full">{item.condition}</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{item.title}</h1>
            <p className="text-3xl font-bold text-blue-600">₹{item.price.toLocaleString()}</p>
            {item.isForRent && (
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2 inline-flex items-center gap-2">
                <span className="text-amber-700 dark:text-amber-400 font-bold">₹{item.rentPerDay}/day</span>
                <span className="bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Rental Available</span>
              </div>
            )}
            {item.isNegotiable && <p className="text-sm text-green-600 font-medium">Price is negotiable</p>}

            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.description}</p>

            {/* Meta */}
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2"><Tag className="w-4 h-4" />{item.category}</div>
              {item.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{item.location}</div>}
              <div className="flex items-center gap-2"><Eye className="w-4 h-4" />{item.views} views</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(item.createdAt).toLocaleDateString()}</div>
            </div>

            {/* Seller (anonymized for buyers) */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Seller</p>
              {isAdmin ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{item.sellerId?.name} <span className="text-xs text-blue-500 font-normal ml-2">(Admin View)</span></p>
                  <p className="text-xs text-gray-500">{item.sellerId?.email}</p>
                </div>
              ) : isOwner ? (
                <p className="text-sm text-gray-900 dark:text-white font-medium">You listed this item</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-bold tracking-tight">Identity Protected</p>
                  </div>
                  <div className="bg-blue-600/10 border border-blue-600/20 rounded-2xl p-4">
                    <p className="text-[11px] text-blue-700 dark:text-blue-400 font-bold mb-1 uppercase tracking-widest">Safe Exchange Policy</p>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/60 leading-relaxed">To ensure your safety, all buyers and sellers remain anonymous. Our Campus Admin handles the verification and physical exchange of all items.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Admin info box */}
            {item.adminNotes && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Admin Notes</p>
                <p className="text-sm text-blue-800 dark:text-blue-300">{item.adminNotes}</p>
              </div>
            )}

            {/* Buy button */}
            {canBuy && (
              <button onClick={handleBuy} disabled={buyLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-lg transition-colors shadow-lg shadow-blue-200 dark:shadow-none">
                {buyLoading ? <Loader className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                {buyLoading ? 'Opening Payment...' : `Buy Now · ₹${item.price.toLocaleString()}`}
              </button>
            )}

            {/* Rent button */}
            {canBuy && item.isForRent && user?.subscription?.plan === 'premium' && item.rentalStatus === 'available' && (
              <button 
                onClick={() => setShowRentModal(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 text-lg transition-colors shadow-lg shadow-amber-200 dark:shadow-none">
                <Calendar className="w-5 h-5" />
                Rent for ₹{item.rentPerDay}/day
              </button>
            )}

            {canBuy && item.isForRent && user?.subscription?.plan !== 'premium' && (
              <p className="text-[10px] text-center text-amber-500 border border-amber-500/20 rounded-lg py-2 flex items-center justify-center gap-2">
                <Shield size={10} /> Premium Subscription required to rent items.
              </p>
            )}

            {item.rentalStatus === 'rented' && (
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 text-center text-amber-700 dark:text-amber-300 font-semibold border border-amber-100 dark:border-amber-800 flex flex-col items-center gap-2">
                <Calendar size={18} />
                Currently Out on Rent
              </div>
            )}

            {item.isSold && !isOwner && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 text-center text-red-700 dark:text-red-300 font-semibold">
                This item has been sold
              </div>
            )}

            {isOwner && (
              <Link to={`/edit-item/${item._id}`}
                className="block w-full text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-2xl transition-colors">
                Edit My Listing
              </Link>
            )}

            {/* How it works */}
            {canBuy && (
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-2">🛡️ How Secure Purchase Works</p>
                <div className="space-y-1 text-xs text-green-700 dark:text-green-400">
                  <p>1. You pay securely via Razorpay</p>
                  <p>2. Admin receives item from seller & verifies it</p>
                  <p>3. Admin delivers item to you after payment confirms</p>
                  <p>4. Your identity stays private throughout</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {item && user && (
        <RentItemModal 
          isOpen={showRentModal} 
          onClose={() => setShowRentModal(false)} 
          item={item} 
          user={user} 
          onRentSuccess={(newBalance) => {
            updateUser({ ...user, wallet: { ...user.wallet, balance: newBalance } });
            setItem({ ...item, rentalStatus: 'rented' });
          }} 
        />
      )}

      {showUPIModal && item?.sellerId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-8 relative shadow-2xl flex flex-col items-center">
            <button onClick={() => setShowUPIModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-full p-1 transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
              <Zap size={32} fill="currentColor" />
            </div>

            <h2 className="text-xl font-bold mb-1 dark:text-white text-center">Pay {item.sellerId.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">Scan QR code using Google Pay, PhonePe, or Paytm</p>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <QRCode value={`upi://pay?pa=${item.sellerId.upiId}&pn=${encodeURIComponent(item.sellerId.name)}&am=${item.price}`} size={180} />
            </div>
            
            <div className="w-full bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-700">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Amount</span>
                 <span className="font-black text-lg dark:text-white text-blue-600">₹{item.price.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">UPI ID</span>
                 <span className="text-xs font-bold dark:text-gray-200 break-all text-right ml-4">{item.sellerId.upiId}</span>
               </div>
            </div>

            <button 
              onClick={handleConfirmDirectPayment} 
              disabled={buyLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2">
              {buyLoading ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {buyLoading ? 'Confirming...' : 'I have made the payment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
