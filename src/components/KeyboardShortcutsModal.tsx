/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Keyboard,
  X,
  Search,
  Download,
  History,
  Settings,
  Globe,
  Zap,
  HelpCircle,
  Command,
  Sparkles,
  Clapperboard,
  CornerDownLeft,
  Sliders,
  Check
} from 'lucide-react';
import { Language, Translations } from '../translations';

export interface ShortcutItem {
  id: string;
  keys: string[];
  title: string;
  description: string;
  category: 'actions' | 'search' | 'settings' | 'general';
  action?: () => void;
}

export interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  t: Translations;
  onTriggerDownload?: () => void;
  onToggleHistory?: () => void;
  onToggleSettings?: () => void;
  onToggleLanguage?: () => void;
  onToggleFastMode?: () => void;
  onTogglePresentation?: () => void;
  onExportCsv?: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  lang,
  t,
  onTriggerDownload,
  onToggleHistory,
  onToggleSettings,
  onToggleLanguage,
  onToggleFastMode,
  onTogglePresentation,
  onExportCsv,
}) => {
  const isRtl = lang === 'ar';
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const metaKey = isMac ? '⌘' : 'Ctrl';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'actions' | 'search' | 'settings' | 'general'>('all');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const shortcuts: ShortcutItem[] = [
    {
      id: 'download',
      keys: [metaKey, 'Enter'],
      title: t.shortcuts.downloadAction,
      description: t.shortcuts.downloadActionDesc,
      category: 'actions',
      action: onTriggerDownload,
    },
    {
      id: 'history',
      keys: [metaKey, 'K'],
      title: t.shortcuts.historyAction,
      description: t.shortcuts.historyActionDesc,
      category: 'search',
      action: onToggleHistory,
    },
    {
      id: 'settings',
      keys: [metaKey, ','],
      title: t.shortcuts.settingsAction,
      description: t.shortcuts.settingsActionDesc,
      category: 'settings',
      action: onToggleSettings,
    },
    {
      id: 'fast-mode',
      keys: [metaKey, 'Shift', 'F'],
      title: t.shortcuts.fastModeAction,
      description: t.shortcuts.fastModeActionDesc,
      category: 'actions',
      action: onToggleFastMode,
    },
    {
      id: 'presentation',
      keys: [metaKey, 'P'],
      title: isRtl ? 'فتح عرض الفيديو الترويجي (Veo)' : 'Open Video Presentation (Veo)',
      description: isRtl ? 'توليد ومشاركة عرض الفيديو الترويجي للمحتوى المستخرج' : 'Generate and share promotional presentation reel',
      category: 'actions',
      action: onTogglePresentation,
    },
    {
      id: 'export-csv',
      keys: [metaKey, 'Shift', 'E'],
      title: isRtl ? 'تصدير سجل التحميلات (CSV)' : 'Export Download History (CSV)',
      description: isRtl ? 'حفظ وتصدير جدول التحميلات بالكامل كملف CSV' : 'Export full download history as CSV spreadsheet',
      category: 'actions',
      action: onExportCsv,
    },
    {
      id: 'language',
      keys: [metaKey, 'L'],
      title: t.shortcuts.languageAction,
      description: t.shortcuts.languageActionDesc,
      category: 'settings',
      action: onToggleLanguage,
    },
    {
      id: 'help',
      keys: [metaKey, '/'],
      title: t.shortcuts.helpAction,
      description: t.shortcuts.helpActionDesc,
      category: 'general',
    },
    {
      id: 'close',
      keys: ['Esc'],
      title: t.shortcuts.closeAction,
      description: t.shortcuts.closeActionDesc,
      category: 'general',
      action: onClose,
    },
  ];

  const categories = [
    { id: 'all', label: isRtl ? 'جميع الاختصارات' : 'All Shortcuts' },
    { id: 'actions', label: t.shortcuts.categoryActions },
    { id: 'search', label: t.shortcuts.categorySearch },
    { id: 'settings', label: t.shortcuts.categorySettings },
    { id: 'general', label: t.shortcuts.categoryGeneral },
  ];

  const filteredShortcuts = shortcuts.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.keys.some((k) => k.toLowerCase().includes(term))
    );
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
        dir={isRtl ? 'rtl' : 'ltr'}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-[#0f131c] border border-indigo-500/30 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-800 bg-[#121622] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {t.shortcuts.modalTitle}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {t.shortcuts.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t.shortcuts.modalSubtitle}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar & Category filters */}
          <div className="p-3.5 sm:p-4 border-b border-gray-800 bg-[#0d1017] space-y-3 shrink-0">
            <div className="relative">
              <Search className={`w-4 h-4 text-gray-400 absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.shortcuts.searchPlaceholder}
                autoFocus
                className={`w-full bg-[#141824] border border-gray-700/60 rounded-xl ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-white`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700/40'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Shortcuts list */}
          <div className="p-3 sm:p-5 overflow-y-auto space-y-2.5 flex-1">
            {filteredShortcuts.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Keyboard className="w-10 h-10 text-gray-600 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-gray-300">
                  {isRtl ? 'لم يتم العثور على اختصارات مطابقة' : 'No matching shortcuts found'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {isRtl ? 'جرب البحث عن مصطلح آخر' : 'Try searching for something else'}
                </p>
              </div>
            ) : (
              filteredShortcuts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.action && item.id !== 'close') {
                      onClose();
                      item.action();
                    }
                  }}
                  className={`p-3 rounded-xl border border-gray-800/80 bg-gray-900/40 hover:bg-gray-800/60 hover:border-indigo-500/40 flex items-center justify-between gap-4 transition-all ${
                    item.action ? 'cursor-pointer group' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {item.title}
                      </h4>
                      {item.action && (
                        <span className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isRtl ? '← اضغط للتنفيذ' : 'Click to run →'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* KBD Badges */}
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k, idx) => (
                      <React.Fragment key={idx}>
                        <kbd className="px-2.5 py-1 text-xs font-mono font-bold text-gray-200 bg-[#161b26] border border-gray-700/80 rounded-md shadow-sm min-w-[28px] text-center inline-block">
                          {k}
                        </kbd>
                        {idx < item.keys.length - 1 && (
                          <span className="text-gray-500 text-xs font-bold">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 sm:p-4 border-t border-gray-800/80 bg-[#121622] flex items-center justify-between text-xs text-gray-400 shrink-0">
            <span>
              {isRtl ? 'اضغط على مفتاح ' : 'Press '}
              <kbd className="px-1.5 py-0.5 font-mono text-[11px] bg-gray-800 text-gray-300 rounded border border-gray-700">
                {metaKey}
              </kbd>
              {isRtl ? ' مع المفتاح لتنفيذ الأمر فوراً' : ' with the key to execute instantly'}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
