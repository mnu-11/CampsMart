import { formatDistanceToNow, format } from 'date-fns';

export const CATEGORIES = [
  'Books & Notes',
  'Electronics',
  'Bicycles & Transport',
  'Furniture',
  'Clothing',
  'Sports & Fitness',
  'Stationery',
  'Instruments',
  'Other',
];

export const CONDITIONS = ['Like New', 'Good', 'Fair', 'For Parts'];

export const CATEGORY_ICONS = {
  'Books & Notes': '📚',
  'Electronics': '💻',
  'Bicycles & Transport': '🚲',
  'Furniture': '🪑',
  'Clothing': '👕',
  'Sports & Fitness': '⚽',
  'Stationery': '✏️',
  'Instruments': '🎸',
  'Other': '📦',
};

export const CATEGORY_COLORS = {
  'Books & Notes': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'Electronics': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Bicycles & Transport': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Furniture': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  'Clothing': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  'Sports & Fitness': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Stationery': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Instruments': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'Other': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

export const CONDITION_COLORS = {
  'Like New': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Good': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Fair': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'For Parts': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const formatPrice = (price) => {
  if (price === 0) return 'Free';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(price);
};

export const timeAgo = (date) => {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return ''; }
};

export const formatDate = (date) => {
  try { return format(new Date(date), 'dd MMM yyyy'); }
  catch { return ''; }
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTRhM2I4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
