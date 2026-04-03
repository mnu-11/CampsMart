import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CATEGORIES, CONDITIONS, CATEGORY_ICONS, compressImage } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Upload, X, Plus, Tag, AlertCircle, CheckCircle2, ImageIcon, Rocket } from 'lucide-react';

export default function AddItemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: '', condition: 'Good',
    location: '', isNegotiable: false, tags: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  if (!user) return <Navigate to="/login" state={{ from: { pathname: '/add-item' } }} />;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) { toast.error('Max 5 images allowed'); return; }
    const compressed = await Promise.all(files.map(f => compressImage(f)));
    setImages(prev => [...prev, ...compressed.map((url, i) => ({ url, file: files[i] }))]);
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const validate = () => {
    const e = {};
    if (!form.title.trim() || form.title.length < 3) e.title = 'Title must be at least 3 characters';
    if (!form.description.trim() || form.description.length < 10) e.description = 'Description must be at least 10 characters';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid price required';
    if (!form.category) e.category = 'Please select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { setStep(1); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      images.forEach((img) => formData.append('imageBase64', img.url));
      const res = await api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Item listed successfully! 🎉');
      navigate(`/items/${res.data.item._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [{ n: 1, label: 'Details' }, { n: 2, label: 'Photos' }, { n: 3, label: 'Review' }];

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="page-container max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Plus size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">List an Item</h1>
              <div className="flex items-center gap-2 mt-1">
                {user.subscription?.plan === 'premium' ? (
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">Premium Plan: Unlimited Listings</span>
                ) : (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    (user.subscription?.listingsThisMonth || 0) >= 5 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {5 - (user.subscription?.listingsThisMonth || 0)} Listings Left This Month
                  </span>
                )}
              </div>
            </div>
          </div>

          {(user.subscription?.plan === 'free' && (user.subscription?.listingsThisMonth || 0) >= 5) && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800 dark:text-red-300">Monthly Limit Reached</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">You've used all 5 free listings for this month. Upgrade to Premium for unlimted listings or wait until next month.</p>
                <button onClick={() => navigate('/profile')} className="mt-2 text-xs bg-red-600 text-white px-4 py-1.5 rounded-lg font-bold">Upgrade to Premium</button>
              </div>
            </div>
          )}

          {/* Steps */}
          <div className="flex items-center gap-2">
            {steps.map(({ n, label }, i) => (
              <div key={n} className="flex items-center gap-2">
                <button onClick={() => n < step || validate() ? setStep(n) : null} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    step > n ? 'bg-emerald-500 text-white' :
                    step === n ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' :
                    'bg-[#f0f4ff] dark:bg-[#0f1628] text-slate-400'
                  }`}>
                    {step > n ? <CheckCircle2 size={13} /> : n}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block ${step === n ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>{label}</span>
                </button>
                {i < 2 && <div className={`flex-1 h-px w-8 transition-colors duration-300 ${step > n ? 'bg-emerald-400' : 'bg-[#e8edf5] dark:bg-[#141929]'}`} />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card p-7 mb-4">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="font-display font-bold text-lg mb-5">Item Details</h2>

                <div>
                  <label className="label">Title <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. Engineering Mathematics Textbook" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className={`input ${errors.title ? 'ring-2 ring-red-400/40' : ''}`} />
                  {errors.title && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.title}</p>}
                </div>

                <div>
                  <label className="label">Description <span className="text-red-500">*</span></label>
                  <textarea placeholder="Describe condition, edition, usage, and any relevant details..."
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={4} className={`input resize-none leading-relaxed ${errors.description ? 'ring-2 ring-red-400/40' : ''}`} />
                  <div className="flex justify-between mt-1">
                    {errors.description ? <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={11} />{errors.description}</p> : <span />}
                    <span className="text-xs text-slate-400">{form.description.length}/1000</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Price (₹) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">₹</span>
                      <input type="number" placeholder="0" min="0" value={form.price}
                        onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                        className={`input pl-8 ${errors.price ? 'ring-2 ring-red-400/40' : ''}`} />
                    </div>
                    {form.price > 0 && (
                      <div className="mt-2 bg-slate-50 dark:bg-[#0f1628] rounded-lg p-2.5 border border-[#e8edf5] dark:border-[#141929] space-y-1">
                        <div className="flex justify-between text-[10px] font-medium">
                          <span className="text-slate-500 uppercase tracking-wider">Your Payout:</span>
                          <span className="text-slate-700 dark:text-slate-300">₹{form.price}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-medium border-t border-[#e8edf5] dark:border-[#141929] pt-1">
                          <span className="text-blue-500 uppercase tracking-wider">Buyer Sees (incl. 10% Platform Fee):</span>
                          <span className="text-blue-600 font-bold">₹{Math.ceil(Number(form.price) * 1.1)}</span>
                        </div>
                      </div>
                    )}
                    {errors.price && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={11} />{errors.price}</p>}
                  </div>
                  <div>
                    <label className="label">Condition</label>
                    <select value={form.condition} onChange={e => setForm(p => ({ ...p, condition: e.target.value }))} className="input">
                      {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Category <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat} type="button" onClick={() => setForm(p => ({ ...p, category: cat }))}
                        className={`px-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 border text-center flex flex-col items-center gap-1 ${
                          form.category === cat
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                            : 'bg-[#f8faff] dark:bg-[#0f1628] border-[#e8edf5] dark:border-[#141929] text-slate-600 dark:text-slate-400 hover:border-blue-300'
                        }`}>
                        <span>{CATEGORY_ICONS[cat]}</span>
                        <span className="leading-tight">{cat.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                  {errors.category && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={11} />{errors.category}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Location <span className="text-xs text-slate-400 font-normal">(optional)</span></label>
                    <input type="text" placeholder="e.g. Hostel Block A" value={form.location}
                      onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="input" />
                  </div>
                  <div>
                    <label className="label">Tags <span className="text-xs text-slate-400 font-normal">(optional)</span></label>
                    <div className="relative">
                      <Tag size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="book, 3rd year" value={form.tags}
                        onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="input pl-10 text-sm" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setForm(p => ({ ...p, isNegotiable: !p.isNegotiable }))}
                    className={`relative w-11 h-6 rounded-full transition-all duration-200 ${form.isNegotiable ? 'bg-blue-600' : 'bg-slate-200 dark:bg-[#141929]'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${form.isNegotiable ? 'translate-x-5' : ''}`} />
                  </button>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer" onClick={() => setForm(p => ({ ...p, isNegotiable: !p.isNegotiable }))}>
                    Price is negotiable
                  </span>
                </div>

                {user.subscription?.plan === 'premium' && (
                  <div className="pt-4 border-t border-[#e8edf5] dark:border-[#141929] space-y-4">
                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                       Rental Options
                      <span className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded text-[8px]">Premium Only</span>
                    </h3>
                    
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setForm(p => ({ ...p, isForRent: !p.isForRent }))}
                        className={`relative w-11 h-6 rounded-full transition-all duration-200 ${form.isForRent ? 'bg-amber-500' : 'bg-slate-200 dark:bg-[#141929]'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${form.isForRent ? 'translate-x-5' : ''}`} />
                      </button>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer" onClick={() => setForm(p => ({ ...p, isForRent: !p.isForRent }))}>
                        Offer this item for Rent
                      </span>
                    </div>

                    {form.isForRent && (
                      <div className="animate-fade-in pl-4 border-l-2 border-amber-200 ml-5">
                        <label className="label">Rent Per Day (₹)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">₹</span>
                          <input type="number" placeholder="15" value={form.rentPerDay}
                            onChange={e => setForm(p => ({ ...p, rentPerDay: e.target.value }))}
                            className="input pl-8" />
                        </div>
                        <p className="text-[10px] text-amber-600 mt-2">Recommended: ₹10 - ₹25 per day for textbooks and small gear.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="font-display font-bold text-lg mb-1">Add Photos</h2>
                <p className="text-slate-500 dark:text-slate-500 text-sm mb-6">Up to 5 photos. Clear images get 3× more views.</p>
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden bg-[#f0f4ff] dark:bg-[#0f1628] group">
                      <img src={img.url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removeImage(i)} className="w-9 h-9 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg">
                          <X size={14} />
                        </button>
                      </div>
                      {i === 0 && <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Main</div>}
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-[#e8edf5] dark:border-[#141929] hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all duration-200 group bg-[#f8faff] dark:bg-[#0f1628] hover:bg-[#f0f4ff]">
                      <div className="w-10 h-10 rounded-2xl bg-[#f0f4ff] dark:bg-[#141929] group-hover:bg-blue-100 dark:group-hover:bg-blue-500/15 flex items-center justify-center transition-colors">
                        <Upload size={17} className="text-slate-400 group-hover:text-blue-500" />
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{images.length === 0 ? 'Add Photos' : 'Add More'}</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
                {images.length === 0 && (
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-200 dark:border-amber-500/20 flex items-start gap-3">
                    <ImageIcon size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">Photos are optional but items with images sell much faster.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="font-display font-bold text-lg mb-6">Review Listing</h2>
                <div className="flex gap-5 mb-6 p-4 bg-[#f8faff] dark:bg-[#0f1628] rounded-2xl">
                  {images[0] ? (
                    <img src={images[0].url} alt="Preview" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-[#f0f4ff] dark:bg-[#141929] flex items-center justify-center flex-shrink-0">
                      <ImageIcon size={22} className="text-slate-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-base">{form.title || 'Untitled'}</h3>
                    <p className="price-tag text-xl mt-1">{form.price === '0' || !form.price ? 'Free' : `₹${form.price}`}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="badge bg-[#f0f4ff] dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs">{form.category}</span>
                      <span className="badge bg-slate-100 dark:bg-[#141929] text-slate-600 dark:text-slate-400 text-xs">{form.condition}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-0 divide-y divide-[#e8edf5] dark:divide-[#141929] text-sm">
                  {[
                    ['Description', form.description],
                    form.location && ['Location', form.location],
                    ['Negotiable', form.isNegotiable ? 'Yes' : 'No'],
                    ['Photos', `${images.length} photo${images.length !== 1 ? 's' : ''}`],
                  ].filter(Boolean).map(([label, value]) => (
                    <div key={label} className="flex gap-4 py-3">
                      <span className="text-slate-500 w-28 flex-shrink-0 text-xs font-medium uppercase tracking-wide">{label}</span>
                      <span className="text-slate-700 dark:text-slate-300 line-clamp-2 text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary">← Back</button>
            ) : <span />}
            {step < 3 ? (
              <button type="button" onClick={() => { if (step === 1 && !validate()) return; setStep(step + 1); }} className="btn-primary">
                Next Step →
              </button>
            ) : (
              <button type="submit" disabled={loading || (user.subscription?.plan === 'free' && (user.subscription?.listingsThisMonth || 0) >= 5)} className="btn-primary px-8">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publishing...
                  </span>
                ) : (user.subscription?.plan === 'free' && (user.subscription?.listingsThisMonth || 0) >= 5) ? (
                  <span className="flex items-center gap-2 text-red-200">Limit Reached</span>
                ) : (
                  <span className="flex items-center gap-2"><Rocket size={15} /> Publish Listing</span>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
