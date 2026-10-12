/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Trash2, 
  X, 
  ExternalLink, 
  Copy, 
  Zap, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  Video, 
  Check, 
  Film,
  Sparkles
} from 'lucide-react';
import { Language, Translations } from '../translations';

export interface UrlHistoryItem {
  id: string;
  url: string;
  title: string;
  platform: string;
  platformColor: string;
  format: string;
  timestamp: number;
}

interface SearchHistoryDropdownProps {
  history: UrlHistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectUrl: (url: string, autoDownload?: boolean) => void;
  onRemoveItem: (id: string) => void;
  onClearHistory: () => void;
  lang: Language;
  t: Translations;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'error' | 'download') => void;
}

export const SearchHistoryDropdown: React.FC<SearchHistoryDropdownProps> = ({
  history,
  isOpen,
  onClose,
  onSelectUrl,
  onRemoveItem,
  onClearHistory,
  lang,
  t,
  onShowToast,
}) => {
  const [filterText, setFilterText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isRtl = lang === 'ar';

  // Auto focus search input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setFilterText('');
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const filteredHistory = history.filter((item) => {
    if (!filterText.trim()) return true;
    const term = filterText.toLowerCase();
    return (
      item.url.toLowerCase().includes(term) ||
      item.title.toLowerCase().includes(term) ||
      item.platform.toLowerCase().includes(term)
    );
  });

  const handleCopy = (e: React.MouseEvent, item: UrlHistoryItem) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    onShowToast(t.history.urlCopied, item.url, 'info');
    setTimeout(() => setCopiedId(null), 1800);
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) {
      return isRtl ? 'الآن' : 'Just now';
    }
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return isRtl ? `منذ ${diffMin} د` : `${diffMin}m ago`;
    }
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      return isRtl ? `منذ ${diffHours} س` : `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return isRtl ? `منذ ${diffDays} ي` : `${diffDays}d ago`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="absolute left-0 right-0 top-full mt-2.5 z-50 bg-[#11141b]/98 backdrop-blur-xl border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[460px] text-gray-200"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-3.5 px-4 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                {t.history.title}
              </span>
              <span className="text-[11px] text-gray-400">
                {history.length} {t.history.countLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {history.length > 0 && !confirmClearOpen && (
              <button
                type="button"
                onClick={() => setConfirmClearOpen(true)}
                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title={t.history.clearAll}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.history.clearAll}</span>
              </button>
            )}

            {confirmClearOpen && (
              <div className="flex items-center gap-1.5 bg-red-950/60 border border-red-500/30 px-2 py-1 rounded-lg">
                <span className="text-[11px] text-red-300 font-semibold">{t.history.confirmClear}</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClearOpen(false);
                    onShowToast(t.history.clearedToast, '', 'info');
                  }}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold cursor-pointer"
                >
                  {isRtl ? 'نعم' : 'Yes'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(false)}
                  className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs cursor-pointer"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              title={isRtl ? 'إغلاق' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter input if history has items */}
        {history.length > 0 && (
          <div className="p-2.5 px-3 border-b border-gray-800/80 bg-gray-900/40 shrink-0">
            <div className="relative">
              <Search className={`w-3.5 h-3.5 text-gray-400 absolute ${isRtl ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2`} />
              <input
                ref={searchInputRef}
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder={t.history.searchPlaceholder}
                className={`w-full bg-[#0a0d13] border border-gray-700/60 rounded-lg ${isRtl ? 'pr-8 pl-14' : 'pl-8 pr-14'} py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors`}
              />
              <div className={`absolute ${isRtl ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 flex items-center gap-1`}>
                {filterText ? (
                  <button
                    type="button"
                    onClick={() => setFilterText('')}
                    className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-gray-400 bg-gray-900 border border-gray-800 rounded">
                    Ctrl+K
                  </kbd>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-800/70 p-1">
          {filteredHistory.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <History className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-gray-300">
                {filterText ? (isRtl ? 'لا توجد نتائج مطابقة' : 'No matching results') : t.history.empty}
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                {filterText ? (isRtl ? 'جرب البحث بكلمة أخرى' : 'Try another search keyword') : t.history.emptyDesc}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group p-2.5 sm:p-3 rounded-xl hover:bg-gray-800/60 transition-all flex items-center justify-between gap-3 cursor-pointer"
                onClick={() => {
                  onSelectUrl(item.url, false);
                  onClose();
                }}
              >
                {/* Left side: Platform & Title & URL */}
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <div className="mt-0.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.platformColor}`}>
                      {item.platform}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-gray-200 truncate group-hover:text-indigo-300 transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-gray-500 font-mono shrink-0">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 truncate mt-0.5 font-mono select-all">
                      {item.url}
                    </p>
                  </div>
                </div>

                {/* Right side: Quick Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Copy URL */}
                  <button
                    type="button"
                    onClick={(e) => handleCopy(e, item)}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title={t.history.copyUrl}
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* One-click Quick Download */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectUrl(item.url, true);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                    title={t.history.quickDownload}
                  >
                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="hidden sm:inline">{t.history.quickDownload}</span>
                  </button>

                  {/* Use in URL input */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectUrl(item.url, false);
                      onClose();
                    }}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-indigo-400 transition-colors cursor-pointer"
                    title={t.history.useUrl}
                  >
                    {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>

                  {/* Delete from history */}
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                    title={t.history.remove}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 px-4 bg-gray-900/60 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>
              {isRtl 
                ? 'اضغط على الرابط للصقه فوراً، أو ⚡ للتحميل المباشر' 
                : 'Click link to paste, or ⚡ for instant one-click download'}
            </span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono hidden sm:inline">
            Esc {isRtl ? 'للإغلاق' : 'to close'}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
