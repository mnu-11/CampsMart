import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const styles = {
  success: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle },
  error:   { bg: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20', text: 'text-red-700 dark:text-red-400', icon: XCircle },
  warning: { bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-400', icon: AlertCircle },
  info:    { bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20', text: 'text-blue-700 dark:text-blue-400', icon: Info },
};

export default function Alert({ type = 'info', title, message, onDismiss }) {
  const { bg, text, icon: Icon } = styles[type] || styles.info;
  return (
    <div className={`flex gap-3 p-4 rounded-2xl border ${bg}`}>
      <Icon size={16} className={`${text} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-semibold ${text}`}>{title}</p>}
        {message && <p className={`text-xs mt-0.5 ${text} opacity-80`}>{message}</p>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className={`${text} opacity-60 hover:opacity-100 transition-opacity flex-shrink-0`}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}
