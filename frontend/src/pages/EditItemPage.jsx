import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { CATEGORIES, CONDITIONS, compressImage } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Upload, X, Save, ArrowLeft, AlertCircle, Tag, ImageIcon } from 'lucide-react';

export default function EditItemPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', price: '', category: '', condition: 'Good',
    location: '', isNegotiable: false, tags: '',
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    api.get(`/items/${id}`)
      .then(res => {
        const item = res.data.item;
        if (!user || item.sellerId._id !== user._id) {
          setUnauthorized(true);
          return;
        }
        setForm({
          title: item.title,
          description: item.description,
          price: item.price.toString(),
          category: item.category,
          condition: item.condition || 'Good',
          location: item.location || '',
          isNegotiable: item.isNegotiable || false,
          tags: item.tags?.join(', ') || '',
        });
        setExistingImages(item.images || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (!user) return <Navigate to="/login" />;
  if (notFound) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">Item not found</h2>
        <Link to="/" className="btn-primary text-sm">Go Home</Link>
      </div>
    </div>
  );
  if (unauthorized) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">Not authorized</h2>
        <Link to="/" className="btn-primary text-sm">Go Home</Link>
      </div>
    </div>
  );

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > 5) { toast.error('Max 5 images allowed'); return; }
    const compressed = await Promise.all(files.map(f => compressImage(f)));
    setNewImages(prev => [...prev, ...compressed.map(url => ({ url, isNew: true }))]);
  };

  const removeExisting = (idx) => setExistingImages(prev => prev.filter((_, i) => i !== idx));
  const removeNew = (idx) => setNewImages(prev => prev.filter((_, i) => i !== idx));

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
    if (!validate()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      // Keep existing image URLs
      existingImages.forEach(img => formData.append('existingImages', img.url));
      // Add new base64 images
      newImages.forEach(img => formData.append('imageBase64', img.url));

      await api.put(`/items/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Listing updated! ✅');
      navigate(`/items/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-24 bg-slate-50 dark:bg-[#080d17]">
      <div className="page-container max-w-2xl">
        <div className="card p-6 space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-10 rounded-xl" />)}
        </div>
      </div>
    </div>
  );

  const totalImages = existingImages.length + newImages.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d17] pt-20 pb-12">
      <div className="page-container max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/items/${id}`} className="btn-ghost p-2">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">Edit Listing</h1>
            <p className="text-slate-500 text-sm mt-0.5">Update your item details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="card p-6 space-y-5">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Item Details</h2>

            {/* Title */}
            <div>
              <label className="label">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Engineering Mathematics Textbook"
                className={`input ${errors.title ? 'border-red-400 focus:ring-red-400/30' : ''}`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="label">Description <span className="text-red-500">*</span></label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe condition, edition, usage, and any relevant details..."
                rows={4}
                className={`input resize-none leading-relaxed ${errors.description ? 'border-red-400 focus:ring-red-400/30' : ''}`}
              />
              <div className="flex justify-between mt-1">
                {errors.description
                  ? <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{errors.description}</p>
                  : <span />}
                <span className="text-xs text-slate-400">{form.description.length}/1000</span>
              </div>
            </div>

            {/* Price & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    className={`input pl-8 ${errors.price ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.price}</p>}
              </div>
              <div>
                <label className="label">Condition</label>
                <select
                  value={form.condition}
                  onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}
                  className="input"
                >
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="label">Category <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, category: cat }))}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 border text-center ${
                      form.category === cat
                        ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-500/20'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.category && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} />{errors.category}</p>}
            </div>

            {/* Location & Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Location <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
                <input
                  type="text"
                  value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Hostel Block A"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Tags <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
                <div className="relative">
                  <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.tags}
                    onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                    placeholder="book, 3rd year..."
                    className="input pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Negotiable Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, isNegotiable: !p.isNegotiable }))}
                className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${form.isNegotiable ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${form.isNegotiable ? 'translate-x-5' : ''}`} />
              </button>
              <label
                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                onClick={() => setForm(p => ({ ...p, isNegotiable: !p.isNegotiable }))}
              >
                Price is negotiable
              </label>
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-1">Photos</h2>
            <p className="text-slate-500 text-sm mb-4">{totalImages}/5 photos · First image is the cover</p>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {/* Existing images */}
              {existingImages.map((img, i) => (
                <div key={`existing-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeExisting(i)}
                      className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white">
                      <X size={13} />
                    </button>
                  </div>
                  {i === 0 && existingImages.length > 0 && (
                    <div className="absolute bottom-1 left-1 bg-brand-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Cover</div>
                  )}
                </div>
              ))}

              {/* New images */}
              {newImages.map((img, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => removeNew(i)}
                      className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white">
                      <X size={13} />
                    </button>
                  </div>
                  <div className="absolute top-1 right-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">New</div>
                </div>
              ))}

              {/* Upload button */}
              {totalImages < 5 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-400 dark:hover:border-brand-500 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-colors group">
                  <Upload size={16} className="text-slate-400 group-hover:text-brand-500" />
                  <span className="text-xs text-slate-500 font-medium">Add</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link to={`/items/${id}`} className="btn-secondary flex-1 justify-center">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={15} /> Save Changes
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
