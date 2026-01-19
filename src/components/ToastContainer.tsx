import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast, type Toast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const icons = {
    success: <CheckCircle size={20} className="text-emerald-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-cyan-500" />,
};

function ToastItem({ toast }: { toast: Toast }) {
    const { removeToast } = useToast();
    const { theme } = useTheme();

    return (
        <div className={`
            pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 
            ${theme === 'dark' ? 'glass bg-black/80 text-white border-white/10' : 'bg-white text-slate-900 border border-slate-200'}
            transition-all duration-300 transform translate-x-0 opacity-100 flex items-start p-4 mb-3
        `}>
            <div className="flex-shrink-0">
                {icons[toast.type]}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <div className="ml-4 flex flex-shrink-0">
                <button
                    type="button"
                    className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => removeToast(toast.id)}
                >
                    <span className="sr-only">Close</span>
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

export function ToastContainer() {
    const { toasts } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div
            aria-live="assertive"
            className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50 flex-col-reverse sm:flex-col justify-end sm:justify-end gap-2"
        >
            <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </div>
        </div>
    );
}
