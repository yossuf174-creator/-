/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  CheckCircle, 
  Video, 
  AlertCircle, 
  Copy, 
  Check, 
  Sparkles, 
  Film, 
  Music, 
  FileDown, 
  ExternalLink,
  History,
  CheckCircle2,
  Zap,
  Settings,
  Sliders,
  X,
  Clock,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  PieChart as PieChartIcon,
  Puzzle,
  Chrome,
  Globe,
  Bookmark,
  MousePointer,
  RefreshCw,
  ShieldCheck,
  FolderDown,
  Layers,
  Filter,
  Bell,
  BellRing,
  Timer,
  HardDrive,
  Share2,
  CheckSquare,
  Square,
  Trash2,
  Gauge,
  ListChecks,
  Globe2,
  MapPin,
  Server,
  Maximize2,
  Cloud,
  MessageSquare,
  Clapperboard,
  Keyboard,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { BrowserExtension } from './components/BrowserExtension';
import { 
  ScheduledReminders, 
  ScheduledReminder, 
  playNotificationChime, 
  triggerBrowserNotification 
} from './components/ScheduledReminders';
import { ShareModal } from './components/ShareModal';
import { Language, translations } from './translations';
import { SearchHistoryDropdown, UrlHistoryItem } from './components/SearchHistoryDropdown';
import { estimateDownloadTime, DownloadTimeEstimate } from './utils/downloadTime';
import { GlobalCdnMap, CdnServerNode, CDN_SERVERS } from './components/GlobalCdnMap';
import { useFirestoreSync } from './lib/useFirestoreSync';
import { CloudSyncBadge } from './components/CloudSyncBadge';
import { GoogleChatModal } from './components/GoogleChatModal';
import { VideoPreview } from './components/VideoPreview';
import { VideoPresentation } from './components/VideoPresentation';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { exportDownloadsToCsv } from './utils/exportCsv';

interface DownloadItem {
  id: string;
  name: string;
  platform: string;
  platformColor: string;
  format: string;
  size: string;
  status: 'completed' | 'processing';
  progress?: number;
  url: string;
  downloadUrl?: string;
  createdAt: number;
  exactTime: string;
  exactDate: string;
}

// Custom tooltip for Recharts Pie Chart
const CustomChartTooltip = ({ active, payload, lang = 'ar' }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const isRtl = lang === 'ar';
    return (
      <div className={`bg-[#0f1219]/95 backdrop-blur-md border border-gray-700/80 px-3 py-2 rounded-xl shadow-2xl text-xs ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
          <span className="font-bold text-white">{data.name}</span>
        </div>
        <div className="text-gray-300">
          {isRtl ? 'العدد: ' : 'Count: '}<span className="font-bold text-indigo-400 font-mono">{data.value}</span> {isRtl ? 'فيديو' : 'videos'}
        </div>
      </div>
    );
  }
  return null;
};

// Precise time formatter (hour/minute and date)
const formatClockTime = (timestamp: number, lang: Language = 'ar'): { time: string; date: string } => {
  const d = new Date(timestamp);
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const period = lang === 'ar' ? (hours >= 12 ? 'م' : 'ص') : (hours >= 12 ? 'PM' : 'AM');
  const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
  const time = `${displayHours}:${minutes} ${period}`;
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const date = `${day}/${month}/${year}`;
  
  return { time, date };
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('vb_language');
      if (saved === 'en' || saved === 'ar') return saved;
    } catch (e) {}
    return 'ar';
  });

  const t = translations[lang];
  const isRtl = lang === 'ar';

  React.useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    localStorage.setItem('vb_language', lang);
  }, [lang, isRtl]);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('vb_language', newLang);
    const nextT = translations[newLang];
    addToast(
      nextT.toasts.langChangedTitle,
      nextT.toasts.langChangedDesc,
      'info',
      3000
    );
  };

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; title: string; format: string; platform: string; thumbnail?: string } | null>(null);
  const [format, setFormat] = useState('1080p (HD)');
  const [autoDownload, setAutoDownload] = useState(false);
  const [quickDownloadMode, setQuickDownloadMode] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'reminders' | 'extension'>('general');
  const [mergeSubtitles, setMergeSubtitles] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPresentationModal, setShowPresentationModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Google Chat Workspace Integration state
  const [showGoogleChatModal, setShowGoogleChatModal] = useState(false);
  const [chatVideoToShare, setChatVideoToShare] = useState<{ title: string; url: string; platform: string; format: string } | null>(null);

  const handleOpenGoogleChat = (video?: { title: string; url: string; platform: string; format: string }) => {
    setChatVideoToShare(video || null);
    setShowGoogleChatModal(true);
  };

  // Google Maps & CDN Server Network state
  const [showServerMapModal, setShowServerMapModal] = useState(false);
  const [showEmbeddedMap, setShowEmbeddedMap] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [activeCdnServer, setActiveCdnServer] = useState<CdnServerNode>(() => {
    try {
      const saved = localStorage.getItem('vb_active_cdn_server');
      if (saved) {
        const found = CDN_SERVERS.find((s) => s.id === saved);
        if (found) return found;
      }
    } catch (e) {}
    return CDN_SERVERS[0];
  });
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  // Sync active CDN node to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('vb_active_cdn_server', activeCdnServer.id);
    } catch (e) {}
  }, [activeCdnServer]);

  // Listen for Google Maps quota events (Mandatory compliance requirement)
  React.useEffect(() => {
    const handleQuota = () => {
      setMapsQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuota);
    };
  }, []);

  const handleSelectServerNode = (server: CdnServerNode) => {
    setActiveCdnServer(server);
    addToast(
      lang === 'ar' ? 'تم الاتصال بالسيرفر' : 'Server Node Connected',
      lang === 'ar' 
        ? `تم الاتصال بنجاح بسيرفر ${server.city} (${server.country}) - زمن الاستجابة ${server.pingMs}ms` 
        : `Connected to ${server.city} (${server.country}) node - Latency ${server.pingMs}ms`,
      'success',
      3500
    );
  };

  // Firebase Firestore Real-Time Cloud Sync
  const {
    syncState,
    syncDownloadItem,
    removeDownloadItem,
    syncReminder,
    removeReminder,
    syncPreferences,
    loadCloudData,
    handleGoogleSignIn,
    handleSignOut,
  } = useFirestoreSync();

  // Sync preferences to Firebase Firestore
  React.useEffect(() => {
    if (syncState.user) {
      syncPreferences({
        selectedServerId: activeCdnServer.id,
        fastDownloadMode: quickDownloadMode,
        language: lang,
        defaultFormat: format,
        mergeSubtitles,
      });
    }
  }, [activeCdnServer.id, quickDownloadMode, lang, format, mergeSubtitles, syncState.user, syncPreferences]);

  // Load cloud data on auth ready
  React.useEffect(() => {
    if (syncState.user) {
      loadCloudData().then((data) => {
        if (data && data.downloads && data.downloads.length > 0) {
          setRecentDownloads((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newEntries: DownloadItem[] = [];
            data.downloads.forEach((d: any) => {
              if (!existingIds.has(d.id)) {
                newEntries.push({
                  id: d.id,
                  name: d.name,
                  platform: d.platform,
                  platformColor: 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/20',
                  format: d.format,
                  size: d.size,
                  status: 'completed',
                  url: d.url,
                  createdAt: Date.now(),
                  exactTime: d.date || 'Cloud',
                  exactDate: 'Firebase',
                });
              }
            });
            return [...newEntries, ...prev];
          });
        }
      });
    }
  }, [syncState.user, loadCloudData]);

  // Search History state in URL input area
  const [history, setHistory] = useState<UrlHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('vb_search_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'hist-1',
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Top 10 AI Tools 2024',
        platform: 'YOUTUBE',
        platformColor: 'bg-red-900/30 text-red-400 border border-red-500/20',
        format: '1080p (HD)',
        timestamp: Date.now() - 5 * 60 * 1000
      },
      {
        id: 'hist-2',
        url: 'https://instagram.com/reel/C123456789',
        title: 'Nature Cinematic 4K',
        platform: 'INSTAGRAM',
        platformColor: 'bg-pink-900/30 text-pink-400 border border-pink-500/20',
        format: '1080p',
        timestamp: Date.now() - 25 * 60 * 1000
      },
      {
        id: 'hist-3',
        url: 'https://tiktok.com/@creator/video/987654321',
        title: 'Funny Cat Moments',
        platform: 'TIKTOK',
        platformColor: 'bg-neutral-800 text-gray-200 border border-gray-700',
        format: '720p',
        timestamp: Date.now() - 70 * 60 * 1000
      },
      {
        id: 'hist-4',
        url: 'https://linkedin.com/posts/tech-future-keynote',
        title: 'Tech Future Keynote 2024',
        platform: 'LINKEDIN',
        platformColor: 'bg-[#0a66c2]/20 text-[#70b5f9] border border-[#0a66c2]/40',
        format: '1080p (HD)',
        timestamp: Date.now() - 140 * 60 * 1000
      }
    ];
  });
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  // Sync search history with localStorage
  React.useEffect(() => {
    localStorage.setItem('vb_search_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (
    urlToSave: string,
    title: string,
    platform: string,
    platformColor: string,
    itemFormat: string
  ) => {
    setHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.url.trim().toLowerCase() !== urlToSave.trim().toLowerCase()
      );
      const newItem: UrlHistoryItem = {
        id: Date.now().toString(),
        url: urlToSave,
        title,
        platform,
        platformColor,
        format: itemFormat,
        timestamp: Date.now(),
      };
      return [newItem, ...filtered].slice(0, 25);
    });
  };

  // Mock download speed state (e.g. 5 MB/s default as requested)
  const [mockSpeed, setMockSpeed] = useState<number>(5);

  // Bulk row selection state for Recent Activity
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const selectAllRef = React.useRef<HTMLInputElement>(null);

  // Scheduled Reminders state
  const [reminders, setReminders] = useState<ScheduledReminder[]>(() => {
    try {
      const saved = localStorage.getItem('vb_scheduled_reminders');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter((r: ScheduledReminder) => r.targetTime > Date.now());
      }
    } catch (e) {}
    return [];
  });
  const [autoLargeDownloadAlert, setAutoLargeDownloadAlert] = useState<boolean>(() => {
    return localStorage.getItem('vb_auto_large_alert') !== 'false';
  });
  const [largeSizeThreshold, setLargeSizeThreshold] = useState<number>(() => {
    const s = localStorage.getItem('vb_large_threshold');
    return s ? parseInt(s, 10) : 40;
  });
  const [targetReminderFile, setTargetReminderFile] = useState<{ name: string; size: string } | null>(null);

  // Sync reminders and preferences with localStorage
  React.useEffect(() => {
    localStorage.setItem('vb_scheduled_reminders', JSON.stringify(reminders));
  }, [reminders]);

  React.useEffect(() => {
    localStorage.setItem('vb_auto_large_alert', String(autoLargeDownloadAlert));
  }, [autoLargeDownloadAlert]);

  React.useEffect(() => {
    localStorage.setItem('vb_large_threshold', String(largeSizeThreshold));
  }, [largeSizeThreshold]);

  // Countdown timer ticker for scheduled reminders
  React.useEffect(() => {
    if (reminders.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const expired: ScheduledReminder[] = [];
      const remaining: ScheduledReminder[] = [];

      reminders.forEach((r) => {
        if (r.targetTime <= now) {
          expired.push(r);
        } else {
          remaining.push(r);
        }
      });

      if (expired.length > 0) {
        expired.forEach((r) => {
          if (r.enableSound) {
            playNotificationChime();
          }
          if (r.enableBrowserNotif) {
            triggerBrowserNotification(
              lang === 'ar' ? '🔔 حان وقت التنبيه المجدول!' : '🔔 Scheduled Reminder Due!',
              `${r.title} ${r.fileSize ? `(${lang === 'ar' ? 'حجم:' : 'Size:'} ${r.fileSize})` : ''}`
            );
          }
          addToast(
            lang === 'ar' ? '🔔 حان وقت التنبيه المجدول!' : '🔔 Scheduled Reminder Due!',
            `${r.title} ${r.fileSize ? `[${r.fileSize}]` : ''} - ${lang === 'ar' ? 'يرجى التحقق من الملف المكتمل.' : 'Please check your completed file.'}`,
            'download',
            8000
          );
        });

        setReminders(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders]);

  const handleAddReminder = (newRem: Omit<ScheduledReminder, 'id' | 'createdAt'>) => {
    const item: ScheduledReminder = {
      ...newRem,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      createdAt: Date.now(),
    };
    setReminders((prev) => [...prev, item]);
    syncReminder(item);
  };

  const handleRemoveReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    removeReminder(id);
  };

  // Sorting state for Recent Activity
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Recent downloads activity state with precise timestamps
  const [recentDownloads, setRecentDownloads] = useState<DownloadItem[]>(() => {
    const now = Date.now();
    const t1 = now - 3 * 60 * 1000;
    const t2 = now - 18 * 60 * 1000;
    const t3 = now - 65 * 60 * 1000;
    const t4 = now - 130 * 60 * 1000;
    const t5 = now - 210 * 60 * 1000;

    return [
      {
        id: '1',
        name: 'Top 10 AI Tools 2024.mp4',
        platform: 'YOUTUBE',
        platformColor: 'bg-red-900/30 text-red-400 border border-red-500/20',
        format: '1080p (HD)',
        size: '45.2 MB',
        status: 'processing',
        progress: 75,
        url: 'https://youtube.com',
        createdAt: t1,
        exactTime: formatClockTime(t1).time,
        exactDate: formatClockTime(t1).date
      },
      {
        id: '2',
        name: 'Nature Cinematic 4K.mp4',
        platform: 'INSTAGRAM',
        platformColor: 'bg-pink-900/30 text-pink-400 border border-pink-500/20',
        format: '1080p',
        size: '128.0 MB',
        status: 'processing',
        progress: 40,
        url: 'https://instagram.com',
        downloadUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        createdAt: t2,
        exactTime: formatClockTime(t2).time,
        exactDate: formatClockTime(t2).date
      },
      {
        id: '3',
        name: 'Funny Cat Moments.mp4',
        platform: 'TIKTOK',
        platformColor: 'bg-neutral-800 text-gray-200 border border-gray-700',
        format: '720p',
        size: '12.5 MB',
        status: 'completed',
        url: 'https://tiktok.com',
        downloadUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        createdAt: t3,
        exactTime: formatClockTime(t3).time,
        exactDate: formatClockTime(t3).date
      },
      {
        id: '4',
        name: 'Tech Future Keynote 2024.mp4',
        platform: 'LINKEDIN',
        platformColor: 'bg-[#0a66c2]/20 text-[#70b5f9] border border-[#0a66c2]/40',
        format: '1080p (HD)',
        size: '64.2 MB',
        status: 'completed',
        url: 'https://linkedin.com',
        downloadUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        createdAt: t4,
        exactTime: formatClockTime(t4).time,
        exactDate: formatClockTime(t4).date
      },
      {
        id: '5',
        name: 'Championship Finals Stream Clip.mp4',
        platform: 'TWITCH',
        platformColor: 'bg-purple-900/30 text-purple-300 border border-purple-500/30',
        format: '1080p (HD)',
        size: '88.0 MB',
        status: 'completed',
        url: 'https://twitch.tv',
        downloadUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        createdAt: t5,
        exactTime: formatClockTime(t5).time,
        exactDate: formatClockTime(t5).date
      }
    ];
  });

  // Helper to add toast
  const addToast = (title: string, message: string, type: ToastType = 'info', duration: number = 4500) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle sort order between newest and oldest
  const toggleSortOrder = () => {
    const nextOrder = sortOrder === 'newest' ? 'oldest' : 'newest';
    setSortOrder(nextOrder);
    addToast(
      t.toasts.sortChangedTitle,
      nextOrder === 'newest' ? t.toasts.sortNewestDesc : t.toasts.sortOldestDesc,
      'info',
      2500
    );
  };

  // Status filter state ('all' | 'completed' | 'processing')
  type StatusFilter = 'all' | 'completed' | 'processing';
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Counts for status categories
  const completedCount = useMemo(() => {
    return recentDownloads.filter((item) => item.status === 'completed').length;
  }, [recentDownloads]);

  const processingCount = useMemo(() => {
    return recentDownloads.filter((item) => item.status === 'processing').length;
  }, [recentDownloads]);

  // Sorted & filtered list of recent downloads based on selected filter and order
  const sortedDownloads = useMemo(() => {
    let list = recentDownloads;
    if (statusFilter === 'completed') {
      list = list.filter((item) => item.status === 'completed');
    } else if (statusFilter === 'processing') {
      list = list.filter((item) => item.status === 'processing');
    }
    return [...list].sort((a, b) => {
      return sortOrder === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
    });
  }, [recentDownloads, statusFilter, sortOrder]);

  // Derived queued/pending items
  const queuedItems = useMemo(() => {
    return recentDownloads.filter((item) => item.status === 'processing');
  }, [recentDownloads]);

  // Keep selectAll ref indeterminate state in sync
  React.useEffect(() => {
    if (selectAllRef.current) {
      const isAll = selectedIds.size === sortedDownloads.length && sortedDownloads.length > 0;
      const isIndeterminate = selectedIds.size > 0 && selectedIds.size < sortedDownloads.length;
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [selectedIds, sortedDownloads]);

  // Toggle single row selection
  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle select all rows
  const toggleSelectAll = () => {
    if (selectedIds.size === sortedDownloads.length && sortedDownloads.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedDownloads.map((item) => item.id)));
    }
  };

  // Bulk Download handler
  const handleBulkDownload = async (itemsToDownload: DownloadItem[]) => {
    if (itemsToDownload.length === 0 || bulkDownloading) return;
    setBulkDownloading(true);

    addToast(
      t.toasts.bulkDownloadStartTitle,
      t.toasts.bulkDownloadStartDesc.replace('{count}', itemsToDownload.length.toString()),
      'download',
      3500
    );

    for (let i = 0; i < itemsToDownload.length; i++) {
      const item = itemsToDownload[i];
      const targetUrl = item.downloadUrl || 'https://www.w3schools.com/html/mov_bbb.mp4';
      const cleanTitle = item.name.replace(/\.[^/.]+$/, '');

      // Trigger download for this item
      handleDownloadFile(targetUrl, cleanTitle, item.format);

      // Update status to completed in the table
      setRecentDownloads((prev) =>
        prev.map((d) => (d.id === item.id ? { ...d, status: 'completed' as const, progress: 100 } : d))
      );

      // Small delay between sequential downloads to allow browser handlers
      if (i < itemsToDownload.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    setBulkDownloading(false);
    setSelectedIds(new Set());

    addToast(
      t.toasts.bulkDownloadCompleteTitle,
      t.toasts.bulkDownloadCompleteDesc.replace('{count}', itemsToDownload.length.toString()),
      'success',
      4500
    );
  };

  // Bulk Delete handler
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    selectedIds.forEach((id) => removeDownloadItem(id));
    setRecentDownloads((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
    addToast(
      t.toasts.itemsDeletedTitle,
      t.toasts.itemsDeletedDesc.replace('{count}', count.toString()),
      'info',
      3000
    );
  };

  // Bulk Mark Completed handler
  const handleBulkMarkCompleted = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    setRecentDownloads((prev) =>
      prev.map((item) => (selectedIds.has(item.id) ? { ...item, status: 'completed' as const, progress: 100 } : item))
    );
    setSelectedIds(new Set());
    addToast(
      t.toasts.itemsCompletedTitle,
      t.toasts.itemsCompletedDesc.replace('{count}', count.toString()),
      'success',
      3000
    );
  };

  // Export download history to CSV file with UTF-8 BOM
  const handleExportHistoryToCsv = (itemsToExport?: DownloadItem[]) => {
    const list = itemsToExport || recentDownloads;
    if (list.length === 0) {
      addToast(
        lang === 'ar' ? 'تنبيه' : 'Notice',
        t.recent.exportCsvEmpty,
        'info',
        3000
      );
      return;
    }

    const success = exportDownloadsToCsv(list, lang);
    if (success) {
      addToast(
        t.recent.exportCsvSuccessTitle,
        t.recent.exportCsvSuccessDesc,
        'download',
        4000
      );
    }
  };

  // Distribution data for Recharts Pie Chart based on platforms
  const platformStats = useMemo(() => {
    // Dynamic counts based on recentDownloads and base community records
    const counts: Record<string, number> = {
      'YOUTUBE': 54,
      'TIKTOK': 38,
      'INSTAGRAM': 31,
      'TWITTER / X': 18,
      'LINKEDIN': 14,
      'TWITCH': 11,
      'FACEBOOK': 8,
    };

    // Integrate real counts from user downloads
    recentDownloads.forEach((item) => {
      const p = item.platform.toUpperCase();
      counts[p] = (counts[p] || 0) + 1;
    });

    const colors: Record<string, string> = {
      'YOUTUBE': '#ef4444',
      'TIKTOK': '#38bdf8',
      'INSTAGRAM': '#ec4899',
      'TWITTER / X': '#94a3b8',
      'LINKEDIN': '#0a66c2',
      'TWITCH': '#a855f7',
      'FACEBOOK': '#3b82f6',
      'WEB VIDEO': '#6366f1',
    };

    const arabicNames: Record<string, string> = {
      'YOUTUBE': 'يوتيوب',
      'TIKTOK': 'تيك توك',
      'INSTAGRAM': 'انستغرام',
      'TWITTER / X': 'تويتر / X',
      'LINKEDIN': 'لينكد إن',
      'TWITCH': 'تويتش',
      'FACEBOOK': 'فيسبوك',
      'WEB VIDEO': 'أخرى',
    };

    const englishNames: Record<string, string> = {
      'YOUTUBE': 'YouTube',
      'TIKTOK': 'TikTok',
      'INSTAGRAM': 'Instagram',
      'TWITTER / X': 'Twitter / X',
      'LINKEDIN': 'LinkedIn',
      'TWITCH': 'Twitch',
      'FACEBOOK': 'Facebook',
      'WEB VIDEO': 'Other',
    };

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([key, value]) => ({
        name: lang === 'ar' ? (arabicNames[key] || key) : (englishNames[key] || key),
        rawKey: key,
        value,
        color: colors[key] || '#6366f1',
      }))
      .sort((a, b) => b.value - a.value);
  }, [recentDownloads, lang]);

  // Toggle Quick Download Mode (skips format selection & auto-downloads highest resolution)
  const toggleQuickDownloadMode = () => {
    const next = !quickDownloadMode;
    setQuickDownloadMode(next);
    if (next) {
      setFormat('1080p (HD)');
      addToast(
        t.toasts.fastModeOnTitle,
        t.toasts.fastModeOnDesc,
        'info',
        4000
      );
    } else {
      addToast(
        t.toasts.fastModeOffTitle,
        t.toasts.fastModeOffDesc,
        'info',
        3000
      );
    }
  };

  // Helper to identify platform
  const detectPlatform = (videoUrl: string): { name: string; color: string } => {
    const lower = videoUrl.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      return { name: 'YOUTUBE', color: 'bg-red-900/30 text-red-400 border border-red-500/20' };
    }
    if (lower.includes('tiktok.com')) {
      return { name: 'TIKTOK', color: 'bg-neutral-800 text-gray-200 border border-gray-700' };
    }
    if (lower.includes('instagram.com')) {
      return { name: 'INSTAGRAM', color: 'bg-pink-900/30 text-pink-400 border border-pink-500/20' };
    }
    if (lower.includes('twitter.com') || lower.includes('x.com')) {
      return { name: 'TWITTER / X', color: 'bg-gray-800 text-gray-300 border border-gray-600' };
    }
    if (lower.includes('facebook.com') || lower.includes('fb.watch')) {
      return { name: 'FACEBOOK', color: 'bg-blue-900/30 text-blue-400 border border-blue-500/20' };
    }
    if (lower.includes('linkedin.com') || lower.includes('lnkd.in')) {
      return { name: 'LINKEDIN', color: 'bg-[#0a66c2]/20 text-[#70b5f9] border border-[#0a66c2]/40' };
    }
    if (lower.includes('dailymotion.com') || lower.includes('dai.ly')) {
      return { name: 'DAILYMOTION', color: 'bg-teal-900/30 text-teal-300 border border-teal-500/30' };
    }
    if (lower.includes('twitch.tv')) {
      return { name: 'TWITCH', color: 'bg-purple-900/30 text-purple-300 border border-purple-500/30' };
    }
    if (lower.includes('reddit.com') || lower.includes('redd.it')) {
      return { name: 'REDDIT', color: 'bg-orange-900/30 text-orange-400 border border-orange-500/20' };
    }
    if (lower.includes('pinterest.com') || lower.includes('pin.it')) {
      return { name: 'PINTEREST', color: 'bg-rose-900/30 text-rose-400 border border-rose-500/20' };
    }
    if (lower.includes('vimeo.com')) {
      return { name: 'VIMEO', color: 'bg-sky-900/30 text-sky-400 border border-sky-500/20' };
    }
    if (lower.includes('soundcloud.com')) {
      return { name: 'SOUNDCLOUD', color: 'bg-amber-900/30 text-amber-400 border border-amber-500/20' };
    }
    return { name: 'WEB VIDEO', color: 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/20' };
  };

  // Trigger actual file download
  const handleDownloadFile = (targetUrl: string, title: string, itemFormat: string) => {
    setDownloadingFile(true);

    // Show initial download starting toast
    addToast(
      t.toasts.downloadStartTitle,
      `${t.toasts.downloadStartDesc} "${title}" (${itemFormat})`,
      'download',
      3500
    );

    try {
      const ext = itemFormat.toLowerCase().includes('mp3') 
        ? 'mp3' 
        : itemFormat.toLowerCase().includes('wav') 
          ? 'wav' 
          : 'mp4';
      
      const filename = `${title.replace(/[/\\?%*:|"<>]/g, '_')}.${ext}`;

      // Create temporary download link
      const link = document.createElement('a');
      link.href = targetUrl;
      link.setAttribute('download', filename);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Simulate completion toast after small delay
      setTimeout(() => {
        setDownloadingFile(false);
        addToast(
          t.toasts.downloadDoneTitle,
          `"${filename}" - ${t.toasts.downloadDoneDesc}`,
          'success',
          5000
        );

        // Update recent downloads status
        setRecentDownloads((prev) =>
          prev.map((item) =>
            item.name.includes(title) || item.downloadUrl === targetUrl
              ? { ...item, status: 'completed' as const }
              : item
          )
        );

        // Auto-Notification for large downloads upon completion
        if (autoLargeDownloadAlert) {
          const matched = recentDownloads.find(
            (item) => item.name.includes(title) || item.downloadUrl === targetUrl
          );
          const sizeVal = matched ? parseFloat(matched.size) : 45;
          const isLarge = sizeVal >= largeSizeThreshold || itemFormat.includes('1080p') || itemFormat.includes('4K');
          if (isLarge) {
            playNotificationChime();
            triggerBrowserNotification(
              lang === 'ar' ? '🎉 اكتمل تنزيل الملف كبير الحجم!' : '🎉 Large File Download Completed!',
              lang === 'ar' 
                ? `تم حفظ "${filename}" (${matched?.size || itemFormat}) بنجاح على جهازك.`
                : `"${filename}" (${matched?.size || itemFormat}) has been saved to your device.`
            );
          }
        }
      }, 1600);

    } catch (err: any) {
      setDownloadingFile(false);
      addToast(
        lang === 'ar' ? 'خطأ أثناء تحميل الملف' : 'Download Error',
        err.message || (lang === 'ar' ? 'حدث خطأ غير متوقع أثناء محاولة التحميل' : 'An unexpected error occurred during download'),
        'error',
        5000
      );
    }
  };

  // Extract video link handler (supports manual submit & direct extension triggers)
  const handleExtractLink = async (e?: React.FormEvent, customUrl?: string) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const targetUrl = (customUrl || url).trim();
    if (!targetUrl) {
      addToast(
        lang === 'ar' ? 'تنبيه' : 'Notice',
        t.input.alertEmpty,
        'error',
        3000
      );
      return;
    }

    if (customUrl) {
      setUrl(customUrl);
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const detected = detectPlatform(targetUrl);
    const effectiveFormat = quickDownloadMode ? '1080p (HD)' : format;

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, format: effectiveFormat }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.input.errorPrefix);
      }

      if (data.status === 'error' || data.error) {
        throw new Error(data.text || data.error || (lang === 'ar' ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'));
      }

      if (data.url) {
        const videoTitle = data.title || `${lang === 'ar' ? 'فيديو' : 'Video'} ${detected.name}`;
        const displayFormat = quickDownloadMode ? (lang === 'ar' ? 'أعلى دقة (1080p / 4K)' : 'Max Quality (1080p / 4K)') : effectiveFormat;
        const newResult = {
          url: data.url,
          title: videoTitle,
          format: displayFormat,
          platform: detected.name,
          thumbnail: data.thumbnail,
        };

        setResult(newResult);

        // 1. Toast Notification for Link Extraction Completion
        if (quickDownloadMode) {
          addToast(
            t.toasts.extractFastSuccessTitle,
            t.toasts.extractFastSuccessDesc,
            'download',
            4500
          );
        } else {
          addToast(
            t.toasts.extractSuccessTitle,
            t.toasts.extractSuccessDesc,
            'success',
            4500
          );
        }

        // Add to recent activity table
        const shouldAutoStart = quickDownloadMode || autoDownload;
        const itemTimestamp = Date.now();
        const timeFormatted = formatClockTime(itemTimestamp, lang);
        const newEntry: DownloadItem = {
          id: itemTimestamp.toString(),
          name: `${videoTitle}.${effectiveFormat.toLowerCase().includes('mp3') ? 'mp3' : 'mp4'}`,
          platform: detected.name,
          platformColor: detected.color,
          format: quickDownloadMode ? (lang === 'ar' ? 'أعلى دقة ⚡' : 'Max Quality ⚡') : effectiveFormat,
          size: effectiveFormat.includes('MP3') ? '4.8 MB' : '42.0 MB',
          status: shouldAutoStart ? 'processing' : 'completed',
          progress: shouldAutoStart ? 60 : 100,
          url: targetUrl,
          downloadUrl: data.url,
          createdAt: itemTimestamp,
          exactTime: timeFormatted.time,
          exactDate: timeFormatted.date
        };

        setRecentDownloads((prev) => [newEntry, ...prev]);
        syncDownloadItem(newEntry);

        // Add to URL search history for quick re-access
        addToHistory(targetUrl, videoTitle, detected.name, detected.color, effectiveFormat);

        // If Quick Download Mode or Auto-download is active, trigger download immediately!
        if (shouldAutoStart) {
          setTimeout(() => {
            handleDownloadFile(data.url, videoTitle, effectiveFormat);
          }, 600);
        }

      } else {
        throw new Error(lang === 'ar' ? 'لم يتم العثور على رابط مباشر. قد يكون المحتوى محمي أو غير مدعوم.' : 'Direct link not found. Content may be protected or unsupported.');
      }
    } catch (err: any) {
      const errorMessage = err.message || (lang === 'ar' ? 'حدث خطأ غير متوقع أثناء استخراج الرابط' : 'An unexpected error occurred while extracting link');
      setError(errorMessage);

      // Toast Notification for Failure
      addToast(
        t.toasts.extractErrorTitle,
        errorMessage,
        'error',
        5000
      );
    } finally {
      setLoading(false);
    }
  };

  // Global Keyboard Shortcuts System (Ctrl+Enter, Ctrl+K, Ctrl+,, Ctrl+/, Ctrl+Shift+F, Ctrl+L, Ctrl+P, Escape)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // 1. Ctrl + Enter: Trigger Download / Extraction
      if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        if (url.trim()) {
          handleExtractLink();
        } else {
          urlInputRef.current?.focus();
          addToast(
            t.input.alertEmpty,
            isRtl ? 'يرجى إدخال أو لصق رابط أولاً (Ctrl+V)' : 'Please enter or paste a URL first',
            'info',
            3000
          );
        }
        return;
      }

      // 2. Ctrl + K: Toggle Search History Dropdown
      if (isCmdOrCtrl && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setShowHistoryDropdown((prev) => !prev);
        return;
      }

      // 3. Ctrl + ,: Open Settings Modal
      if (isCmdOrCtrl && e.key === ',') {
        e.preventDefault();
        setShowSettingsModal((prev) => !prev);
        return;
      }

      // 4. Ctrl + / or Shift + ?: Toggle Keyboard Shortcuts Modal
      if ((isCmdOrCtrl && e.key === '/') || (!isCmdOrCtrl && e.key === '?' && document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      // 5. Ctrl + Shift + F: Toggle Fast Download Mode
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setQuickDownloadMode((prev) => {
          const next = !prev;
          addToast(
            next ? t.quickToolbar.fastModeActive : t.quickToolbar.fastModeDisabled,
            next
              ? (isRtl ? 'تم تفعيل وضع التحميل السريع بأعلى دقة' : 'Fast mode active with max quality')
              : (isRtl ? 'تم تعطيل وضع التحميل السريع' : 'Fast mode disabled'),
            next ? 'download' : 'info',
            2500
          );
          return next;
        });
        return;
      }

      // 6. Ctrl + L: Toggle Language (Arabic / English)
      if (isCmdOrCtrl && (e.key === 'l' || e.key === 'L') && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        handleLanguageChange(lang === 'ar' ? 'en' : 'ar');
        return;
      }

      // 7. Ctrl + P: Open Video Presentation (Veo) if result exists
      if (isCmdOrCtrl && (e.key === 'p' || e.key === 'P') && result) {
        e.preventDefault();
        setShowPresentationModal(true);
        return;
      }

      // 8. Ctrl + Shift + E: Export Download History to CSV
      if (isCmdOrCtrl && e.shiftKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        handleExportHistoryToCsv();
        return;
      }

      // 9. Escape: Close open modals
      if (e.key === 'Escape') {
        if (showShortcutsModal) {
          setShowShortcutsModal(false);
          return;
        }
        if (showPresentationModal) {
          setShowPresentationModal(false);
          return;
        }
        if (showShareModal) {
          setShowShareModal(false);
          return;
        }
        if (showHistoryDropdown) {
          setShowHistoryDropdown(false);
          return;
        }
        if (showSettingsModal) {
          setShowSettingsModal(false);
          return;
        }
        if (showGoogleChatModal) {
          setShowGoogleChatModal(false);
          return;
        }
        if (showServerMapModal) {
          setShowServerMapModal(false);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    url,
    lang,
    isRtl,
    result,
    showShortcutsModal,
    showPresentationModal,
    showShareModal,
    showHistoryDropdown,
    showSettingsModal,
    showGoogleChatModal,
    showServerMapModal,
    quickDownloadMode
  ]);

  // One-click extraction test triggered from the Browser Extension component
  const handleTestExtractFromExtension = (testUrl: string) => {
    setUrl(testUrl);
    setShowSettingsModal(false);
    handleExtractLink(undefined, testUrl);
  };

  const copyDirectLink = (linkToCopy: string) => {
    if (!linkToCopy) return;
    navigator.clipboard.writeText(linkToCopy).then(() => {
      setCopied(true);
      addToast(
        t.toasts.linkCopiedTitle,
        t.toasts.linkCopiedDesc,
        'info',
        3000
      );
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="h-screen w-full bg-[#0d0f14] text-gray-100 flex flex-col font-sans overflow-hidden select-none" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Google Maps Quota Exceeded Sticky Banner (Case A Mandatory Compliance) */}
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-center gap-2">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
          <button
            onClick={() => setMapsQuotaExceeded(false)}
            className="text-amber-900 hover:text-black font-bold text-xs px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <nav className="h-16 px-6 sm:px-8 flex items-center justify-between border-b border-gray-800 bg-[#11141b] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold italic tracking-tighter text-white shadow-lg shadow-indigo-600/30">
            VB
          </div>
          <span className="text-xl font-bold tracking-tight">
            VideoBot <span className="text-indigo-400 font-medium">Pro</span>
          </span>
        </div>

        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="text-white border-b-2 border-indigo-500 pb-1 font-semibold">
            {t.nav.home}
          </a>
          <a href="#recent" className="hover:text-white transition-colors">
            {t.nav.recent}
          </a>
          <a href="#supported" className="hover:text-white transition-colors">
            {t.nav.supported}
          </a>
          {/* Google Maps Server Map Nav Link */}
          <button 
            type="button"
            onClick={() => setShowServerMapModal(true)} 
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group text-indigo-300 hover:text-white"
          >
            <MapPin className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>{t.nav.serverMap}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
          {/* Google Chat Spaces Nav Link */}
          <button 
            type="button"
            onClick={() => handleOpenGoogleChat()} 
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group text-emerald-400 hover:text-emerald-300"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>{t.nav.googleChat}</span>
          </button>
          <button 
            type="button"
            onClick={() => {
              setSettingsTab('reminders');
              setShowSettingsModal(true);
            }} 
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group text-gray-300 hover:text-amber-300"
          >
            <Bell className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>{t.nav.reminders}</span>
            {reminders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-black">
                {reminders.length}
              </span>
            )}
          </button>
          <button 
            type="button"
            onClick={() => {
              setSettingsTab('extension');
              setShowSettingsModal(true);
            }} 
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group text-amber-300/90"
          >
            <Puzzle className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>{t.nav.extension}</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {t.nav.newBadge}
            </span>
          </button>
          <button 
            type="button"
            onClick={() => {
              setSettingsTab('general');
              setShowSettingsModal(true);
            }} 
            className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>{t.nav.settings}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Server Map Button */}
          <button
            type="button"
            onClick={() => setShowServerMapModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white transition-colors border border-indigo-500/30 text-xs font-semibold cursor-pointer"
            title={t.nav.serverMap}
          >
            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{t.nav.serverMap}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </button>

          {/* Quick Google Chat Button */}
          <button
            type="button"
            onClick={() => handleOpenGoogleChat()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white transition-colors border border-emerald-500/30 text-xs font-semibold cursor-pointer"
            title={t.nav.googleChat}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">{t.nav.googleChat}</span>
          </button>

          {/* Cloud Sync Status Badge (Firebase) */}
          <CloudSyncBadge
            syncState={syncState}
            lang={lang}
            t={t}
            onGoogleSignIn={handleGoogleSignIn}
            onSignOut={handleSignOut}
          />

          {/* Quick Language Toggle Button */}
          <button
            type="button"
            onClick={() => handleLanguageChange(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700/60 text-xs font-semibold cursor-pointer"
            title={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono">{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Keyboard Shortcuts Help Button */}
          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800/80 hover:bg-indigo-600/20 text-gray-300 hover:text-indigo-300 transition-colors border border-gray-700/60 hover:border-indigo-500/40 text-xs font-semibold cursor-pointer group"
            title={`${t.shortcuts.modalTitle} (Ctrl+/)`}
          >
            <Keyboard className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="hidden xl:inline">{t.shortcuts.navButton}</span>
            <kbd className="hidden sm:inline-flex text-[9px] font-mono text-gray-400 bg-gray-900 px-1 py-0.5 rounded border border-gray-800">
              Ctrl+/
            </kbd>
          </button>

          {/* Bell Icon Button with dynamic counter badge */}
          <button
            type="button"
            onClick={() => {
              setSettingsTab('reminders');
              setShowSettingsModal(true);
            }}
            className="relative p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-amber-300 transition-colors border border-gray-700/60 cursor-pointer"
            title={t.nav.reminders}
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {reminders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black font-extrabold text-[10px] flex items-center justify-center animate-bounce">
                {reminders.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setSettingsTab('extension');
              setShowSettingsModal(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
            title={t.extension.bannerTitle}
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>{t.nav.extension}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSettingsTab('general');
              setShowSettingsModal(true);
            }}
            className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700/60 cursor-pointer"
            title={t.nav.settings}
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="hidden sm:inline-flex px-3.5 py-1.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-semibold tracking-wide">
            {t.nav.premiumPlan}
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-gray-700 flex items-center justify-center text-xs font-bold text-white shadow">
            {t.nav.vip}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex flex-col lg:flex-row p-4 sm:p-8 gap-8 overflow-y-auto">
        {/* Left Side: Main Downloader Interface */}
        <div className="flex-[2] flex flex-col gap-8 min-w-0">
          
          {/* Hero Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs sm:text-sm font-semibold tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              <span>{t.hero.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {t.hero.title}
            </h1>
            <p className="text-gray-400 text-base sm:text-lg">
              {t.hero.subtitle}
            </p>
          </div>

          {/* URL Input Area with Search History */}
          <div className="bg-[#11141b] p-6 sm:p-8 rounded-2xl border border-gray-800 shadow-2xl space-y-6 relative">
            <form onSubmit={handleExtractLink} className="relative">
              <input 
                ref={urlInputRef}
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.input.placeholder} 
                className={`w-full bg-[#0d0f14] border-2 border-gray-800 rounded-xl ${isRtl ? 'pl-52 sm:pl-64 pr-6 text-right' : 'pr-52 sm:pr-64 pl-6 text-left'} py-4 text-base sm:text-lg focus:outline-none focus:border-indigo-500 placeholder-gray-600 text-white transition-all shadow-inner`}
                dir={isRtl ? 'rtl' : 'ltr'}
                required
              />
              <div className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 flex items-center gap-2`}>
                {/* Search History Dropdown Toggle Button with Ctrl+K shortcut */}
                <button
                  type="button"
                  onClick={() => setShowHistoryDropdown((prev) => !prev)}
                  className={`p-2.5 sm:px-3 sm:py-2.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer text-xs font-semibold ${
                    showHistoryDropdown
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-gray-800/90 hover:bg-gray-700 text-gray-300 hover:text-white border-gray-700/60'
                  }`}
                  title={`${t.history.buttonTitle} (Ctrl+K)`}
                >
                  <History className="w-4 h-4 text-indigo-400" />
                  <span className="hidden md:inline">{t.history.buttonTitle}</span>
                  {history.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {history.length}
                    </span>
                  )}
                  <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-medium text-gray-400 bg-gray-900 rounded border border-gray-700/80">
                    Ctrl+K
                  </kbd>
                </button>

                {/* Instant Download Action Button with Ctrl+Enter shortcut */}
                <button 
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold px-3.5 sm:px-5 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 text-sm sm:text-base cursor-pointer"
                  title={`${t.input.downloadNow} (Ctrl+Enter)`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t.input.processing}</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span className="hidden sm:inline">{t.input.downloadNow}</span>
                      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-bold text-indigo-100 bg-indigo-700/80 rounded border border-indigo-400/40">
                        Ctrl+↵
                      </kbd>
                    </>
                  )}
                </button>
              </div>

              {/* Search History Dropdown Popover */}
              <SearchHistoryDropdown
                history={history}
                isOpen={showHistoryDropdown}
                onClose={() => setShowHistoryDropdown(false)}
                onSelectUrl={(selectedUrl, autoDownload) => {
                  setUrl(selectedUrl);
                  setShowHistoryDropdown(false);
                  if (autoDownload) {
                    handleExtractLink(undefined, selectedUrl);
                  }
                }}
                onRemoveItem={(id) => {
                  setHistory((prev) => prev.filter((item) => item.id !== id));
                }}
                onClearHistory={() => {
                  setHistory([]);
                }}
                lang={lang}
                t={t}
                onShowToast={addToast}
              />
            </form>

            {/* Error Message Box */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-3 overflow-hidden shadow-inner"
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  <AlertCircle className="shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{t.input.errorPrefix}</p>
                    <p className="text-xs text-red-300/80 mt-0.5 leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Success Result Box */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gradient-to-r from-indigo-950/40 via-[#131722] to-indigo-950/30 border border-indigo-500/40 p-4 sm:p-6 rounded-2xl shadow-xl overflow-hidden"
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                    {/* Left/Start: Video Thumbnail Preview & Details */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto flex-1">
                      {/* VideoPreview Component with Auto Thumbnail and Enlarge Button */}
                      <VideoPreview
                        title={result.title}
                        url={result.url}
                        platform={result.platform}
                        format={result.format}
                        thumbnailUrl={result.thumbnail}
                        lang={lang}
                        t={t}
                        onDownload={() => handleDownloadFile(result.url, result.title, result.format)}
                        onCopyLink={() => copyDirectLink(result.url)}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                            {result.platform}
                          </span>
                          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.result.ready}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono text-gray-400 bg-gray-900 border border-gray-800">
                            {t.result.resolutionBadge}
                          </span>
                        </div>
                        <h3 className="font-bold text-base sm:text-lg text-white mt-1.5 line-clamp-2" title={result.title}>
                          {result.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                          <span>{t.result.chosenFormat}: <strong className="text-indigo-300 font-semibold">{result.format}</strong></span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-start lg:justify-end">
                      <button
                        onClick={() => copyDirectLink(result.url)}
                        title={t.result.copyLink}
                        className="px-3.5 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700 text-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span className="hidden sm:inline">{copied ? t.result.copied : t.result.copyLink}</span>
                      </button>

                      {/* Video Presentation Promo Reel Button (Veo) */}
                      <button
                        type="button"
                        onClick={() => setShowPresentationModal(true)}
                        title={t.presentation.title}
                        className="px-3.5 py-3 rounded-lg bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-900/40 hover:from-purple-800/50 hover:to-indigo-800/50 text-purple-200 hover:text-white transition-all border border-purple-500/40 text-sm flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-950/30 group"
                      >
                        <Clapperboard className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">{isRtl ? 'عرض الفيديو (Veo)' : 'Promo Video (Veo)'}</span>
                      </button>

                      {/* Social Share Button */}
                      <button
                        type="button"
                        onClick={() => setShowShareModal(true)}
                        title={t.result.share}
                        className="px-3.5 py-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white transition-colors border border-indigo-500/30 text-sm flex items-center gap-1.5 cursor-pointer shadow-sm group"
                      >
                        <Share2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span>{t.result.share}</span>
                      </button>

                      {/* Direct Google Chat Share Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenGoogleChat({
                          title: result.title,
                          url: result.url,
                          platform: result.platform,
                          format: result.format,
                        })}
                        title={t.chat.shareVideoBtn}
                        className="px-3.5 py-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-white transition-colors border border-emerald-500/30 text-sm flex items-center gap-1.5 cursor-pointer shadow-sm group"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">Google Chat</span>
                      </button>

                      <button
                        onClick={() => {
                          setTargetReminderFile({ name: result.title, size: result.format });
                          setSettingsTab('reminders');
                          setShowSettingsModal(true);
                        }}
                        title={t.result.scheduleReminder}
                        className="px-3.5 py-3 rounded-lg bg-gray-800/80 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 transition-colors border border-amber-500/30 text-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Bell className="w-4 h-4 text-amber-400" />
                        <span className="hidden sm:inline">{t.result.scheduleReminder}</span>
                      </button>

                      <button
                        onClick={() => handleDownloadFile(result.url, result.title, result.format)}
                        disabled={downloadingFile}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-all font-bold shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                      >
                        {downloadingFile ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{t.result.downloading}</span>
                          </>
                        ) : (
                          <>
                            <FileDown size={19} />
                            <span>{t.result.downloadNow}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Settings */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-t border-gray-800 pt-6 gap-5" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-400 font-medium">{t.quickToolbar.qualityAndFormat}</span>
                {quickDownloadMode ? (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{t.quickToolbar.autoHighest}</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {['1080p (HD)', '720p', 'MP3', 'WAV'].map((fmt) => (
                      <button 
                        key={fmt}
                        type="button"
                        onClick={() => setFormat(fmt)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          format === fmt 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                            : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700/50'
                        }`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles & Settings */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                
                {/* Fast Download Mode Toggle Button */}
                <div className="flex items-center gap-2.5 bg-gray-900/80 border border-gray-800 hover:border-amber-500/30 px-3 py-1.5 rounded-xl transition-all">
                  <div className={`flex flex-col ${isRtl ? 'text-right' : 'text-left'}`}>
                    <span className="text-xs font-bold text-gray-200 flex items-center gap-1">
                      <Zap className={`w-3.5 h-3.5 ${quickDownloadMode ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}`} />
                      {t.quickToolbar.fastMode}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {quickDownloadMode ? t.quickToolbar.fastModeActive : t.quickToolbar.fastModeDisabled}
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={quickDownloadMode}
                    onClick={toggleQuickDownloadMode}
                    className={`relative w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer flex items-center ${
                      quickDownloadMode 
                        ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] justify-start' 
                        : 'bg-gray-700 justify-end'
                    }`}
                    title={t.quickToolbar.fastMode}
                  >
                    <motion.div
                      layout
                      className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
                    >
                      {quickDownloadMode && <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />}
                    </motion.div>
                  </button>
                </div>

                {/* Subtitles Toggle */}
                <label 
                  onClick={() => setMergeSubtitles(!mergeSubtitles)}
                  className="flex items-center gap-2 cursor-pointer group select-none"
                >
                  <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                    mergeSubtitles 
                      ? 'border-indigo-500 bg-indigo-600/30' 
                      : 'border-gray-600 bg-gray-900'
                  }`}>
                    {mergeSubtitles && <div className="w-2 h-2 bg-indigo-400 rounded-sm"></div>}
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">
                    {t.quickToolbar.subtitles}
                  </span>
                </label>

                {/* Quick Settings Dialog Launcher */}
                <button
                  type="button"
                  onClick={() => {
                    setSettingsTab('general');
                    setShowSettingsModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700/60 flex items-center gap-1.5 text-xs cursor-pointer"
                  title={t.settings.title}
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">{t.quickToolbar.preferences}</span>
                </button>

                {/* Scheduled Reminders Quick Launcher */}
                <button
                  type="button"
                  onClick={() => {
                    setSettingsTab('reminders');
                    setShowSettingsModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-amber-300 transition-colors border border-gray-700/60 flex items-center gap-1.5 text-xs cursor-pointer group"
                  title={t.quickToolbar.scheduleAlert}
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline">{t.quickToolbar.scheduleAlert}</span>
                  {reminders.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-black">
                      {reminders.length}
                    </span>
                  )}
                </button>

                {/* Browser Extension Quick Launcher */}
                <button
                  type="button"
                  onClick={() => {
                    setSettingsTab('extension');
                    setShowSettingsModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white transition-colors border border-indigo-500/30 flex items-center gap-1.5 text-xs cursor-pointer group"
                  title={t.quickToolbar.extension}
                >
                  <Puzzle className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline font-bold">{t.quickToolbar.extension}</span>
                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {t.nav.newBadge}
                  </span>
                </button>

                {/* Google Maps CDN Server Network Launcher */}
                <button
                  type="button"
                  onClick={() => setShowServerMapModal(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white transition-colors border border-indigo-500/30 flex items-center gap-1.5 text-xs cursor-pointer group"
                  title={t.map.title}
                >
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline font-bold">{t.map.badge}</span>
                  <span className="text-[10px] font-mono text-emerald-400">{activeCdnServer.pingMs}ms</span>
                </button>
              </div>
            </div>
          </div>

          {/* Google Maps CDN Server Network Section */}
          <div className="bg-[#11141b] rounded-2xl border border-gray-800 p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                    <span>{t.map.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {t.map.badge}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t.map.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-xs">
                  <span className="text-gray-400">{t.map.selectedServer}:</span>
                  <strong className="text-emerald-400 flex items-center gap-1 font-mono">
                    <span>{activeCdnServer.flag}</span>
                    <span>{activeCdnServer.city}</span>
                    <span>({activeCdnServer.pingMs}ms)</span>
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEmbeddedMap(!showEmbeddedMap)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{showEmbeddedMap ? t.map.closeMap : t.map.openMap}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowServerMapModal(true)}
                  className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer border border-gray-700/60"
                  title={t.map.openMap}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {showEmbeddedMap && (
              <div className="mt-2">
                <GlobalCdnMap
                  lang={lang}
                  t={t}
                  activeServerId={activeCdnServer.id}
                  onSelectServer={handleSelectServerNode}
                  isExpanded={isMapExpanded}
                  onToggleExpand={() => setIsMapExpanded((prev) => !prev)}
                  showCloseButton={false}
                />
              </div>
            )}
          </div>

          {/* Recent Activity Table */}
          <div id="recent" className="flex-1 flex flex-col min-h-0">
            {/* Header & Bulk Actions Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-2.5 flex-wrap">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">{t.recent.title}</h3>
                <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {recentDownloads.length} {t.recent.fileCount}
                </span>

                {queuedItems.length > 0 && (
                  <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25 flex items-center gap-1.5 font-bold">
                    <Timer className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>{queuedItems.length} {t.recent.queuedBadge}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Download Speed Selector for Mock Time Estimation */}
                <div 
                  className="flex items-center gap-1.5 bg-gray-900/80 border border-gray-800 px-2.5 py-1.5 rounded-lg text-xs hover:border-gray-700 transition-colors"
                  title={t.recent.speedEstimate}
                >
                  <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-gray-400 text-[11px] hidden sm:inline">{t.recent.speedEstimate}</span>
                  <select
                    value={mockSpeed}
                    onChange={(e) => {
                      const spd = Number(e.target.value);
                      setMockSpeed(spd);
                      addToast(
                        t.recent.speedEstimate,
                        lang === 'ar' ? `تم ضبط سرعة التحميل التقديرية على ${spd} MB/s` : `Mock download speed set to ${spd} MB/s`,
                        'info',
                        2000
                      );
                    }}
                    className="bg-transparent text-indigo-300 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="2" className="bg-[#11141b] text-white">2 MB/s</option>
                    <option value="5" className="bg-[#11141b] text-white">5 MB/s (Default)</option>
                    <option value="10" className="bg-[#11141b] text-white">10 MB/s</option>
                    <option value="25" className="bg-[#11141b] text-white">25 MB/s</option>
                  </select>
                </div>

                {/* "Download All" Button at the top if multiple items are queued (or all if multiple) */}
                {queuedItems.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => handleBulkDownload(queuedItems)}
                    disabled={bulkDownloading}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                    title={t.recent.downloadQueue.replace('{count}', queuedItems.length.toString())}
                  >
                    {bulkDownloading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <FolderDown className="w-3.5 h-3.5" />
                    )}
                    <span>{t.recent.downloadQueue.replace('{count}', queuedItems.length.toString())}</span>
                  </button>
                ) : recentDownloads.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => handleBulkDownload(recentDownloads)}
                    disabled={bulkDownloading}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    title={t.recent.downloadAll}
                  >
                    {bulkDownloading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <FolderDown className="w-3.5 h-3.5" />
                    )}
                    <span>{t.recent.downloadAll}</span>
                  </button>
                ) : null}

                {/* Sort Toggle Button */}
                <button
                  type="button"
                  onClick={toggleSortOrder}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                    sortOrder === 'newest'
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30 shadow-sm'
                      : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                  }`}
                  title={sortOrder === 'newest' ? t.recent.sortNewest : t.recent.sortOldest}
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">{sortOrder === 'newest' ? t.recent.sortNewest : t.recent.sortOldest}</span>
                </button>

                {/* Export Entire Download History to CSV Button */}
                <button
                  type="button"
                  onClick={() => handleExportHistoryToCsv()}
                  disabled={recentDownloads.length === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-gray-800/90 hover:bg-emerald-600/20 text-gray-300 hover:text-emerald-300 border border-gray-700/80 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed group"
                  title={`${t.recent.exportCsvTooltip} (Ctrl+Shift+E)`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>{t.recent.exportCsv}</span>
                </button>

                {sortOrder !== 'newest' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSortOrder('newest');
                      addToast(t.toasts.sortChangedTitle, t.toasts.sortNewestDesc, 'info', 2000);
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs text-indigo-400 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 transition-colors border border-indigo-800/40 cursor-pointer"
                  >
                    {t.recent.restoreNewest}
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter Buttons (All, Completed, Processing) */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="inline-flex p-1 bg-gray-900/90 border border-gray-800 rounded-xl gap-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{t.recent.filterAll}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    statusFilter === 'all' ? 'bg-indigo-900/80 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {recentDownloads.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    statusFilter === 'completed'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-gray-400 hover:text-emerald-300 hover:bg-gray-800/60'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${statusFilter === 'completed' ? 'text-white' : 'text-emerald-400'}`} />
                  <span>{t.recent.filterCompleted}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    statusFilter === 'completed' ? 'bg-emerald-900/80 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {completedCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('processing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    statusFilter === 'processing'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                      : 'text-gray-400 hover:text-amber-300 hover:bg-gray-800/60'
                  }`}
                >
                  <Timer className={`w-3.5 h-3.5 ${statusFilter === 'processing' ? 'text-white animate-spin' : 'text-amber-400'}`} style={{ animationDuration: '4s' }} />
                  <span>{t.recent.filterProcessing}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    statusFilter === 'processing' ? 'bg-amber-900/80 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {processingCount}
                  </span>
                </button>
              </div>

              {/* Status Filter summary indicator */}
              {statusFilter !== 'all' && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="text-[11px]">
                    {isRtl ? 'التصفية الحالية:' : 'Filtered by:'}{' '}
                    <strong className="text-white">
                      {statusFilter === 'completed' ? t.recent.filterCompleted : t.recent.filterProcessing}
                    </strong>{' '}
                    ({sortedDownloads.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                  >
                    {t.recent.clearFilter}
                  </button>
                </div>
              )}
            </div>

            {/* Bulk Selection Bar when rows are checked */}
            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -6 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -6 }}
                  className="mb-3 p-2.5 px-4 bg-indigo-950/50 border border-indigo-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl"
                  dir={isRtl ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-white">
                      {t.recent.selectedCount.replace('{count}', selectedIds.size.toString())}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedIds(new Set())}
                      className="text-gray-400 hover:text-white underline text-[11px] cursor-pointer ml-1"
                    >
                      {t.recent.deselectAll}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Bulk Download Selected */}
                    <button
                      type="button"
                      onClick={() => {
                        const items = sortedDownloads.filter((i) => selectedIds.has(i.id));
                        handleBulkDownload(items);
                      }}
                      disabled={bulkDownloading}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {bulkDownloading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>{t.recent.downloadSelected.replace('{count}', selectedIds.size.toString())}</span>
                    </button>

                    {/* Mark Completed */}
                    <button
                      type="button"
                      onClick={handleBulkMarkCompleted}
                      className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.recent.markCompleted}</span>
                    </button>

                    {/* Bulk Export Selected to CSV */}
                    <button
                      type="button"
                      onClick={() => {
                        const items = sortedDownloads.filter((i) => selectedIds.has(i.id));
                        handleExportHistoryToCsv(items);
                      }}
                      className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title={t.recent.exportCsvTooltip}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>{t.recent.exportSelectedCsv}</span>
                    </button>

                    {/* Bulk Delete */}
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.recent.deleteSelected}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-[#11141b] rounded-2xl border border-gray-800 overflow-hidden overflow-x-auto shadow-xl">
              <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} whitespace-nowrap`} dir={isRtl ? 'rtl' : 'ltr'}>
                <thead className="bg-gray-900/60 text-gray-400 text-xs font-semibold uppercase border-b border-gray-800">
                  <tr>
                    {/* Header Checkbox Selector */}
                    <th className="w-10 px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        ref={selectAllRef}
                        checked={sortedDownloads.length > 0 && selectedIds.size === sortedDownloads.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded text-indigo-600 border-gray-700 bg-gray-900 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer accent-indigo-600"
                        title={selectedIds.size === sortedDownloads.length ? t.recent.deselectAll : t.recent.selectAll}
                      />
                    </th>
                    <th className={`px-5 py-3.5 ${isRtl ? 'text-right' : 'text-left'}`}>{t.recent.thName}</th>
                    <th className={`px-4 py-3.5 ${isRtl ? 'text-right' : 'text-left'}`}>{t.recent.thSource}</th>
                    <th className={`px-4 py-3.5 ${isRtl ? 'text-right' : 'text-left'}`}>{t.recent.thFormat}</th>
                    <th className={`px-6 py-3.5 ${isRtl ? 'text-right' : 'text-left'}`}>{t.recent.thStatus}</th>
                    <th className={`px-5 py-3.5 ${isRtl ? 'text-right' : 'text-left'}`}>{t.recent.thSize}</th>
                    <th 
                      className={`px-5 py-3.5 ${isRtl ? 'text-right' : 'text-left'} cursor-pointer hover:text-white transition-colors group select-none`}
                      onClick={toggleSortOrder}
                      title={sortOrder === 'newest' ? t.recent.sortNewest : t.recent.sortOldest}
                    >
                      <div className="flex items-center gap-1.5 justify-start">
                        <Clock className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                        <span>{t.recent.thTime}</span>
                        {sortOrder === 'newest' ? (
                          <ArrowDown className="w-3 h-3 text-indigo-400" />
                        ) : (
                          <ArrowUp className="w-3 h-3 text-indigo-400" />
                        )}
                      </div>
                    </th>
                    <th className="px-5 py-3.5 text-center">{t.recent.thAction}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm">
                  {sortedDownloads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Filter className="w-8 h-8 text-gray-600 opacity-60 mb-1" />
                          <p className="text-sm font-semibold text-gray-300">
                            {t.recent.noFilteredItems}
                          </p>
                          {statusFilter !== 'all' && (
                            <button
                              type="button"
                              onClick={() => setStatusFilter('all')}
                              className="mt-2 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              {t.recent.clearFilter}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedDownloads.map((item) => {
                    const itemTime = formatClockTime(item.createdAt, lang);
                    const isSelected = selectedIds.has(item.id);
                    const estimate = item.status === 'processing'
                      ? estimateDownloadTime(item.size, mockSpeed, item.progress ?? 60, lang)
                      : null;

                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors group ${
                          isSelected ? 'bg-indigo-950/30 border-l-2 border-indigo-500' : 'hover:bg-gray-800/30'
                        }`}
                      >
                        {/* Row Checkbox Selector */}
                        <td className="w-10 px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectItem(item.id)}
                            className="w-4 h-4 rounded text-indigo-600 border-gray-700 bg-gray-900 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer accent-indigo-600"
                          />
                        </td>

                        <td className="px-5 py-4 text-gray-200 font-medium">
                          <div className="flex items-center gap-2">
                            {item.format.includes('MP3') || item.format.includes('WAV') ? (
                              <Music className="w-4 h-4 text-gray-400 shrink-0" />
                            ) : (
                              <Video className="w-4 h-4 text-gray-400 shrink-0" />
                            )}
                            <span className="truncate max-w-[200px]" title={item.name}>
                              {item.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${item.platformColor}`}>
                            {item.platform}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-gray-400 text-xs font-mono">
                          {item.format}
                        </td>

                        {/* Status Column with Download Time Estimation for pending items */}
                        <td className="px-6 py-4">
                          {item.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {t.recent.completed}
                            </span>
                          ) : (
                            <div className="flex flex-col gap-2 min-w-[160px]">
                              {/* Distinctive Pulsing Processing Status Badge */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-semibold bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.25)] animate-pulse select-none">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                  </span>
                                  <Timer className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                                  <span>{t.recent.filterProcessing}</span>
                                </span>

                                <span className="font-mono text-xs font-bold text-amber-400">
                                  {item.progress ?? 60}%
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-500"
                                  style={{ width: `${item.progress ?? 60}%` }}
                                />
                              </div>

                              {/* ETA & Speed details if estimate available */}
                              {estimate ? (
                                <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                                  <span title={`${t.recent.estRemaining} ${estimate.formattedRemaining}`} className="text-amber-300/90 font-medium">
                                    ~{estimate.formattedRemaining}
                                  </span>
                                  <span className="text-indigo-400">@{estimate.speedLabel}</span>
                                </div>
                              ) : (
                                <div className="text-[10px] text-gray-500 font-mono text-right">
                                  <span>{t.input.processing}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Size Column with total estimate subtitle */}
                        <td className="px-5 py-4">
                          <div className={`flex flex-col ${isRtl ? 'text-right' : 'text-left'}`}>
                            <span className="text-gray-300 text-xs font-mono font-medium">{item.size}</span>
                            {item.status === 'processing' && estimate && (
                              <span className="text-[10px] text-amber-400/80 font-mono mt-0.5">
                                ~{estimate.formattedTotal} (@{mockSpeed}MB/s)
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className={`flex flex-col ${isRtl ? 'text-right' : 'text-left'}`}>
                            <div className="flex items-center gap-1.5 text-gray-200 text-xs font-semibold font-mono">
                              <Clock className="w-3 h-3 text-indigo-400/80 shrink-0" />
                              <span>{itemTime.time}</span>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                              {itemTime.date}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Share to Google Chat */}
                            <button
                              onClick={() => {
                                handleOpenGoogleChat({
                                  title: item.name,
                                  url: item.url || item.downloadUrl || 'https://videobot.pro',
                                  platform: item.platform,
                                  format: item.format,
                                });
                              }}
                              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-300 border border-gray-700/60 hover:border-emerald-500/40 transition-colors cursor-pointer inline-flex items-center justify-center"
                              title={t.chat.shareVideoBtn}
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setTargetReminderFile({ name: item.name, size: item.size });
                                setSettingsTab('reminders');
                                setShowSettingsModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-amber-500/20 text-gray-300 hover:text-amber-300 border border-gray-700/60 hover:border-amber-500/40 transition-colors cursor-pointer inline-flex items-center justify-center"
                              title={t.recent.scheduleTooltip}
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                const downloadTarget = item.downloadUrl || 'https://www.w3schools.com/html/mov_bbb.mp4';
                                handleDownloadFile(downloadTarget, item.name.replace(/\.[^/.]+$/, ''), item.format);
                              }}
                              className="p-1.5 rounded-lg bg-gray-800/80 hover:bg-indigo-600 text-gray-300 hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center"
                              title={item.status === 'processing' ? t.input.downloadNow : t.recent.reDownloadTooltip}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Stats & Support */}
        <div className="flex-1 flex flex-col gap-6 lg:min-w-[310px] lg:max-w-[360px]">
          {/* Statistics Card with Recharts Pie Chart */}
          <div className="bg-[#11141b] rounded-2xl p-5 text-white shrink-0 shadow-xl border border-gray-800 flex flex-col gap-4">
            <div className="flex items-center justify-between" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                  {t.stats.title}
                </h4>
              </div>
              <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold rounded">
                {t.stats.live}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800/80">
                <p className="text-xl font-black tracking-tight text-white font-mono">1.2 GB</p>
                <p className="text-[11px] text-gray-400 mt-0.5" dir={isRtl ? 'rtl' : 'ltr'}>{t.stats.storage}</p>
              </div>
              <div className="bg-gray-900/60 p-3 rounded-xl border border-gray-800/80">
                <p className="text-xl font-black tracking-tight text-indigo-400 font-mono">
                  {platformStats.reduce((acc, curr) => acc + curr.value, 0)}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5" dir={isRtl ? 'rtl' : 'ltr'}>{t.stats.totalVideos}</p>
              </div>
            </div>

            {/* Recharts Pie Chart */}
            <div className="pt-2 border-t border-gray-800/80">
              <div className="flex items-center justify-between mb-2" dir={isRtl ? 'rtl' : 'ltr'}>
                <span className="text-xs font-semibold text-gray-300">{t.stats.distribution}</span>
                <span className="text-[10px] text-indigo-400 font-mono">
                  {platformStats.length} {t.stats.activePlatforms}
                </span>
              </div>

              {/* Chart Container */}
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <RechartsTooltip content={<CustomChartTooltip lang={lang} />} />
                    <Pie
                      data={platformStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={800}
                    >
                      {platformStats.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke="#11141b" 
                          strokeWidth={2}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Badge inside Donut Pie */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-gray-400 font-medium">{t.stats.platformsCenter}</span>
                  <span className="text-xs font-bold text-white font-mono">{platformStats.length}</span>
                </div>
              </div>

              {/* Chart Legend Badges */}
              <div className="grid grid-cols-2 gap-1.5 mt-2" dir={isRtl ? 'rtl' : 'ltr'}>
                {platformStats.slice(0, 6).map((item) => {
                  const total = platformStats.reduce((acc, curr) => acc + curr.value, 0);
                  const percent = Math.round((item.value / total) * 100);
                  return (
                    <div 
                      key={item.name} 
                      className="flex items-center justify-between bg-gray-900/40 hover:bg-gray-900/80 px-2 py-1 rounded-md border border-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] text-gray-300 truncate">{item.name}</span>
                      </div>
                      <span className={`text-[10px] text-gray-400 font-mono font-semibold ${isRtl ? 'mr-1' : 'ml-1'}`}>{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Supported Sites List */}
          <div id="supported" className="bg-[#11141b] rounded-2xl border border-gray-800 p-6 flex-1 flex flex-col shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-5" dir={isRtl ? 'rtl' : 'ltr'}>
              <h4 className="text-white font-bold text-base">{t.stats.supportedSites}</h4>
              <span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                {t.stats.thousandSites}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-gray-300 text-sm flex-1">
              {[
                { name: 'YouTube', color: 'bg-red-500' },
                { name: 'Instagram', color: 'bg-pink-500' },
                { name: 'Facebook', color: 'bg-blue-600' },
                { name: 'TikTok', color: 'bg-neutral-100' },
                { name: 'LinkedIn', color: 'bg-[#0a66c2]' },
                { name: 'Twitch', color: 'bg-purple-500' },
                { name: 'Dailymotion', color: 'bg-teal-400' },
                { name: 'Twitter (X)', color: 'bg-gray-400' },
                { name: 'Vimeo', color: 'bg-blue-400' },
                { name: 'Pinterest', color: 'bg-red-600' },
                { name: 'SoundCloud', color: 'bg-orange-500' },
                { name: 'Reddit', color: 'bg-orange-600' },
              ].map((site) => (
                <div key={site.name} className={`flex items-center ${isRtl ? 'justify-end' : 'justify-start'} gap-2.5 p-2 rounded-lg bg-gray-900/40 hover:bg-gray-800/50 transition-colors border border-gray-800/40`}>
                  <div className={`w-2 h-2 rounded-full ${site.color} shadow-sm shrink-0 ${isRtl ? 'order-2' : 'order-1'}`}></div>
                  <span className={`text-xs font-medium ${isRtl ? 'order-1' : 'order-2'}`}>{site.name}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-yellow-950/20 border border-yellow-700/30 rounded-xl shrink-0">
              <p className={`text-xs text-yellow-400/90 leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <strong>{isRtl ? 'تنبيه الاستخدام العادل:' : 'Fair Use Notice:'}</strong> {t.stats.fairUse.replace(/^.*?:\s*/, '')}
              </p>
            </div>
          </div>

          {/* Global Server Network (Google Maps) Card in Sidebar */}
          <div className="bg-[#11141b] rounded-2xl p-5 text-white shrink-0 shadow-xl border border-gray-800 flex flex-col gap-4">
            <div className="flex items-center justify-between" dir={isRtl ? 'rtl' : 'ltr'}>
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-200">
                  {t.map.badge}
                </h4>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {t.map.connected}
              </span>
            </div>

            <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block">{t.map.selectedServer}</span>
                <span className="font-bold text-sm text-white flex items-center gap-1.5 mt-0.5">
                  <span>{activeCdnServer.flag}</span>
                  <span>{activeCdnServer.city}</span>
                </span>
              </div>
              <div className={isRtl ? 'text-left' : 'text-right'}>
                <span className="text-[10px] text-gray-400 block">{t.map.ping}</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{activeCdnServer.pingMs} ms</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowServerMapModal(true)}
              className="w-full py-2.5 px-4 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-indigo-500/30 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.map.openMap}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="h-10 bg-[#0d0f14] border-t border-gray-800 flex items-center justify-between px-4 sm:px-8 text-[10px] text-gray-500 uppercase tracking-widest shrink-0" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="hidden sm:block">{t.footer.engine}</div>
        <div>{t.footer.copyright}</div>
        <div className="flex gap-4">
          <span className="cursor-pointer hover:text-gray-400">{t.footer.privacy}</span>
          <span className="cursor-pointer hover:text-gray-400">{t.footer.terms}</span>
        </div>
      </footer>

      {/* Settings & Browser Extension Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md" dir={isRtl ? 'rtl' : 'ltr'}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-[#11141b] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    {settingsTab === 'reminders' ? (
                      <BellRing className="w-5 h-5 text-amber-400 animate-pulse" />
                    ) : settingsTab === 'extension' ? (
                      <Puzzle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Settings className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {settingsTab === 'reminders'
                        ? t.reminders.bannerTitle
                        : settingsTab === 'extension'
                        ? t.extension.bannerTitle
                        : t.settings.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {settingsTab === 'reminders'
                        ? t.reminders.bannerDesc
                        : settingsTab === 'extension'
                        ? t.extension.bannerDesc
                        : t.settings.subtitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label={t.settings.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-gray-800 bg-[#0e1117] px-4 sm:px-6 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSettingsTab('general')}
                  className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    settingsTab === 'general'
                      ? 'border-indigo-500 text-white bg-indigo-500/10'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>{t.settings.tabGeneral}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsTab('reminders')}
                  className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap relative ${
                    settingsTab === 'reminders'
                      ? 'border-indigo-500 text-white bg-indigo-500/10'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>{t.settings.tabReminders}</span>
                  {reminders.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-black mx-1">
                      {reminders.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsTab('extension')}
                  className={`py-3 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap relative ${
                    settingsTab === 'extension'
                      ? 'border-indigo-500 text-white bg-indigo-500/10'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Puzzle className="w-4 h-4 text-amber-400" />
                  <span>{t.settings.tabExtension}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-sm mx-1">
                    {t.nav.newBadge} ⚡
                  </span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {settingsTab === 'reminders' ? (
                  /* Scheduled Reminders Component */
                  <ScheduledReminders
                    reminders={reminders}
                    onAddReminder={handleAddReminder}
                    onRemoveReminder={handleRemoveReminder}
                    addToast={addToast}
                    autoLargeDownloadAlert={autoLargeDownloadAlert}
                    onToggleAutoLargeAlert={setAutoLargeDownloadAlert}
                    largeSizeThreshold={largeSizeThreshold}
                    onChangeLargeThreshold={setLargeSizeThreshold}
                    recentFileOptions={recentDownloads.map((d) => ({ name: d.name, size: d.size }))}
                    initialFileName={targetReminderFile?.name}
                    initialFileSize={targetReminderFile?.size}
                    onClose={() => setShowSettingsModal(false)}
                    lang={lang}
                  />
                ) : settingsTab === 'extension' ? (
                  /* Browser Extension Component */
                  <BrowserExtension
                    onTestExtract={handleTestExtractFromExtension}
                    quickDownloadMode={quickDownloadMode}
                    onToggleQuickDownload={toggleQuickDownloadMode}
                    addToast={addToast}
                    onCloseSettings={() => setShowSettingsModal(false)}
                    lang={lang}
                  />
                ) : (
                  /* General Settings Tab */
                  <div className="space-y-5">
                    {/* 1. Language Selection Card */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-[#151924] to-[#12151e] border border-indigo-500/40 shadow-sm">
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{t.settings.languageSectionTitle}</h4>
                            <p className="text-xs text-gray-400 mt-0.5">{t.settings.languageSectionDesc}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {lang.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => handleLanguageChange('ar')}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            lang === 'ar'
                              ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                              : 'bg-gray-900/60 border-gray-700/60 text-gray-400 hover:text-gray-200 hover:bg-gray-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">🇸🇦</span>
                            <div className={isRtl ? 'text-right' : 'text-left'}>
                              <p className="text-xs font-bold text-white">العربية</p>
                              <p className="text-[10px] text-gray-400">Arabic (RTL)</p>
                            </div>
                          </div>
                          {lang === 'ar' && (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleLanguageChange('en')}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            lang === 'en'
                              ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                              : 'bg-gray-900/60 border-gray-700/60 text-gray-400 hover:text-gray-200 hover:bg-gray-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">🇬🇧</span>
                            <div className={isRtl ? 'text-right' : 'text-left'}>
                              <p className="text-xs font-bold text-white">English</p>
                              <p className="text-[10px] text-gray-400">الإنجليزية (LTR)</p>
                            </div>
                          </div>
                          {lang === 'en' && (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Firebase Cloud Sync Card */}
                    <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3" dir={isRtl ? 'rtl' : 'ltr'}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                            <Cloud className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white flex items-center gap-1.5 flex-wrap">
                              <span>{t.firebase.cloudSync}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {syncState.isConnected ? 'Connected' : 'Offline'}
                              </span>
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">{t.firebase.autoBackup}</p>
                          </div>
                        </div>

                        {syncState.user?.isAnonymous ? (
                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/20 self-start sm:self-auto"
                          >
                            <span>{t.firebase.signInGoogle}</span>
                          </button>
                        ) : syncState.user ? (
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="text-xs font-mono text-gray-300 truncate max-w-[120px]">
                              {syncState.user.displayName || 'Google User'}
                            </span>
                            <button
                              type="button"
                              onClick={handleSignOut}
                              className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-300 text-xs font-bold transition-colors cursor-pointer border border-gray-700"
                            >
                              {t.firebase.signOut}
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <div className="p-2.5 bg-gray-950/60 rounded-lg border border-gray-800/80 flex items-center justify-between text-xs text-gray-400" dir={isRtl ? 'rtl' : 'ltr'}>
                        <span>{t.firebase.cloudSaved}:</span>
                        <span className="font-mono text-emerald-400 text-[11px]">
                          {syncState.user?.uid ? `uid:${syncState.user.uid.slice(0, 12)}...` : 'Connecting...'}
                        </span>
                      </div>
                    </div>

                    {/* Callout to Scheduled Reminders */}
                    <div 
                      onClick={() => setSettingsTab('reminders')}
                      className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-[#151924] to-indigo-950/30 border border-amber-500/30 flex items-center justify-between gap-4 cursor-pointer hover:border-amber-500/60 transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                          <BellRing className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{t.settings.calloutRemindersTitle}</span>
                            {reminders.length > 0 && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500 text-black">
                                {reminders.length}
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {t.settings.calloutRemindersDesc}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 group-hover:bg-amber-500/30 text-amber-300 text-xs font-bold shrink-0 transition-colors border border-amber-500/30">
                        {t.settings.openReminders}
                      </div>
                    </div>

                    {/* Callout to Browser Extension */}
                    <div 
                      onClick={() => setSettingsTab('extension')}
                      className="p-4 rounded-xl bg-gradient-to-r from-indigo-900/30 via-[#151924] to-purple-900/30 border border-indigo-500/30 flex items-center justify-between gap-4 cursor-pointer hover:border-indigo-500/60 transition-all group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                          <Puzzle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{t.settings.calloutExtensionTitle}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {t.nav.newBadge}
                            </span>
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {t.settings.calloutExtensionDesc}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition-colors shadow">
                        {t.settings.openExtension}
                      </div>
                    </div>

                    {/* Fast Download Mode Setting */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#151924] to-[#12151e] border border-amber-500/30 relative overflow-hidden">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <h4 className="text-sm font-bold text-white">{t.settings.fastModeTitle}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {t.settings.fastModeBadge}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300/80 mt-1.5 leading-relaxed">
                            {t.settings.fastModeDesc}
                          </p>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={quickDownloadMode}
                          onClick={toggleQuickDownloadMode}
                          className={`relative w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer flex items-center shrink-0 ${
                            quickDownloadMode 
                              ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] justify-start' 
                              : 'bg-gray-700 justify-end'
                          }`}
                        >
                          <motion.div
                            layout
                            className="w-5.5 h-5.5 rounded-full bg-white shadow-md flex items-center justify-center"
                          >
                            {quickDownloadMode && <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />}
                          </motion.div>
                        </button>
                      </div>
                    </div>

                    {/* Auto-Download Setting */}
                    <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">{t.settings.autoDownloadTitle}</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {t.settings.autoDownloadDesc}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={autoDownload}
                        onClick={() => {
                          const next = !autoDownload;
                          setAutoDownload(next);
                          addToast(
                            next ? t.toasts.autoDownloadOnTitle : t.toasts.autoDownloadOffTitle,
                            next ? t.toasts.autoDownloadOnDesc : t.toasts.autoDownloadOffDesc,
                            'info',
                            3000
                          );
                        }}
                        className={`relative w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer flex items-center shrink-0 ${
                          autoDownload 
                            ? 'bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.4)] justify-start' 
                            : 'bg-gray-700 justify-end'
                        }`}
                      >
                        <motion.div
                          layout
                          className="w-5.5 h-5.5 rounded-full bg-white shadow-md"
                        />
                      </button>
                    </div>

                    {/* Subtitles Integration */}
                    <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white">{t.settings.subtitlesTitle}</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {t.settings.subtitlesDesc}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={mergeSubtitles}
                        onClick={() => setMergeSubtitles(!mergeSubtitles)}
                        className={`relative w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer flex items-center shrink-0 ${
                          mergeSubtitles 
                            ? 'bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.4)] justify-start' 
                            : 'bg-gray-700 justify-end'
                        }`}
                      >
                        <motion.div
                          layout
                          className="w-5.5 h-5.5 rounded-full bg-white shadow-md"
                        />
                      </button>
                    </div>

                    {/* Preferred Default Quality */}
                    <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800">
                      <h4 className="text-sm font-semibold text-white mb-2">{t.settings.defaultQualityTitle}</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {['1080p (HD)', '720p', 'MP3', 'WAV'].map((fmt) => (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => {
                              setFormat(fmt);
                              addToast(t.toasts.defaultQualityUpdated, `${t.toasts.defaultQualityDesc} (${fmt})`, 'info', 2500);
                            }}
                            className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              format === fmt
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-gray-800 bg-[#0d0f14]/80 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {settingsTab === 'extension' 
                    ? (lang === 'ar' ? 'إضافة المتصفح مجانية بالكامل ومتوافقة مع جميع أنظمة التشغيل' : 'Browser extension is completely free and cross-platform') 
                    : t.settings.instantSaved}
                </span>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  {t.settings.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Social Share & Video Promotion Modal */}
      {result && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          videoData={{
            title: result.title,
            url: result.url,
            platform: result.platform,
            format: result.format,
          }}
          lang={lang}
          addToast={addToast}
          onOpenGoogleChat={() => handleOpenGoogleChat({
            title: result.title,
            url: result.url,
            platform: result.platform,
            format: result.format,
          })}
        />
      )}

      {/* Video Presentation Promo Reel Modal (Veo) */}
      {result && (
        <VideoPresentation
          isOpen={showPresentationModal}
          onClose={() => setShowPresentationModal(false)}
          videoData={{
            title: result.title,
            url: result.url,
            platform: result.platform,
            format: result.format,
            thumbnailUrl: result.thumbnail,
          }}
          lang={lang}
          t={t}
          addToast={addToast}
          onOpenGoogleChat={() => handleOpenGoogleChat({
            title: result.title,
            url: result.url,
            platform: result.platform,
            format: result.format,
          })}
        />
      )}

      {/* Google Chat Spaces & Sharing Modal */}
      <GoogleChatModal
        isOpen={showGoogleChatModal}
        onClose={() => {
          setShowGoogleChatModal(false);
          setChatVideoToShare(null);
        }}
        videoToShare={chatVideoToShare}
        lang={lang}
        t={t}
        addToast={addToast}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        lang={lang}
        t={t}
        onTriggerDownload={() => {
          if (url.trim()) {
            handleExtractLink();
          } else {
            urlInputRef.current?.focus();
            addToast(t.input.alertEmpty, isRtl ? 'يرجى إدخال رابط أولاً' : 'Please enter a URL first', 'info');
          }
        }}
        onToggleHistory={() => setShowHistoryDropdown((prev) => !prev)}
        onToggleSettings={() => {
          setSettingsTab('general');
          setShowSettingsModal(true);
        }}
        onToggleLanguage={() => handleLanguageChange(lang === 'ar' ? 'en' : 'ar')}
        onToggleFastMode={() => {
          setQuickDownloadMode((prev) => !prev);
        }}
        onTogglePresentation={() => {
          if (result) {
            setShowPresentationModal(true);
          } else {
            addToast(
              isRtl ? 'تنبيه' : 'Notice',
              isRtl ? 'يرجى استخراج رابط فيديو أولاً لإنشاء العرض الترويجي' : 'Please extract a video first to create presentation',
              'info'
            );
          }
        }}
        onExportCsv={() => handleExportHistoryToCsv()}
      />

      {/* Google Maps CDN Server Network Full Modal */}
      <AnimatePresence>
        {showServerMapModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md" dir={isRtl ? 'rtl' : 'ltr'}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              <GlobalCdnMap
                lang={lang}
                t={t}
                activeServerId={activeCdnServer.id}
                onSelectServer={(srv) => {
                  handleSelectServerNode(srv);
                }}
                isExpanded={true}
                showCloseButton={true}
                onClose={() => setShowServerMapModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
