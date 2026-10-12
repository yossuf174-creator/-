import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Download, X, Sparkles, Copy, FileCheck } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'error' | 'download';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      className="fixed top-5 left-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none sm:max-w-md"
      dir="rtl"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const duration = toast.duration ?? 4500;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-emerald-500/40',
          bg: 'bg-[#111822]/95',
          glow: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.3)]',
          iconBg: 'bg-emerald-500/15 text-emerald-400',
          progressBar: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
        };
      case 'download':
        return {
          border: 'border-indigo-500/40',
          bg: 'bg-[#111422]/95',
          glow: 'shadow-[0_10px_30px_-10px_rgba(99,102,241,0.35)]',
          iconBg: 'bg-indigo-500/20 text-indigo-400',
          progressBar: 'bg-indigo-500',
          icon: <Download className="w-5 h-5 text-indigo-400 shrink-0 animate-bounce" />,
        };
      case 'info':
        return {
          border: 'border-sky-500/40',
          bg: 'bg-[#0f172a]/95',
          glow: 'shadow-[0_10px_30px_-10px_rgba(14,165,233,0.3)]',
          iconBg: 'bg-sky-500/15 text-sky-400',
          progressBar: 'bg-sky-400',
          icon: <Sparkles className="w-5 h-5 text-sky-400 shrink-0" />,
        };
      case 'error':
        return {
          border: 'border-rose-500/40',
          bg: 'bg-[#1a1215]/95',
          glow: 'shadow-[0_10px_30px_-10px_rgba(244,63,94,0.3)]',
          iconBg: 'bg-rose-500/15 text-rose-400',
          progressBar: 'bg-rose-500',
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
        };
    }
  };

  const style = getStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: -30 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`relative pointer-events-auto rounded-xl border ${style.border} ${style.bg} ${style.glow} backdrop-blur-md p-4 text-white overflow-hidden shadow-2xl transition-all`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`p-2 rounded-lg ${style.iconBg} flex items-center justify-center`}>
          {style.icon}
        </div>

        <div className="flex-1 min-w-0 pr-0.5">
          <h4 className="text-sm font-semibold tracking-tight text-gray-100 flex items-center gap-2">
            {toast.title}
          </h4>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed break-words">
            {toast.message}
          </p>
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors shrink-0"
          aria-label="إغلاق الإشعار"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress countdown bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 right-0 h-0.5 ${style.progressBar} opacity-70`}
      />
    </motion.div>
  );
};
