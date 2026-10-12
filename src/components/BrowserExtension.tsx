import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Puzzle, 
  Chrome, 
  Globe, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  Zap, 
  Layers, 
  Bookmark, 
  Copy, 
  Check, 
  FolderDown, 
  MousePointer, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Laptop
} from 'lucide-react';
import { ToastType } from './Toast';
import { Language, translations } from '../translations';

interface BrowserExtensionProps {
  onTestExtract: (url: string) => void;
  quickDownloadMode: boolean;
  onToggleQuickDownload: () => void;
  addToast: (title: string, message: string, type?: ToastType, duration?: number) => void;
  onCloseSettings?: () => void;
  lang?: Language;
}

export const BrowserExtension: React.FC<BrowserExtensionProps> = ({
  onTestExtract,
  quickDownloadMode,
  onToggleQuickDownload,
  addToast,
  onCloseSettings,
  lang = 'ar'
}) => {
  const currentLang = lang || 'ar';
  const t = translations[currentLang].extension;
  const isRtl = currentLang === 'ar';

  // Local state for extension installation
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    return localStorage.getItem('vb_extension_installed') === 'true';
  });

  const [installing, setInstalling] = useState(false);
  const [installStep, setInstallStep] = useState<number>(0);
  const [selectedBrowser, setSelectedBrowser] = useState<'chrome' | 'edge' | 'firefox' | 'brave'>('chrome');
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);

  // Extension feature toggles
  const [floatingButtonActive, setFloatingButtonActive] = useState<boolean>(() => {
    return localStorage.getItem('vb_ext_floating_btn') !== 'false';
  });
  const [autoSendToFastMode, setAutoSendToFastMode] = useState<boolean>(() => {
    return localStorage.getItem('vb_ext_fast_mode') !== 'false';
  });
  const [autoDetectHighestQuality, setAutoDetectHighestQuality] = useState<boolean>(true);

  // Sync toggles with localStorage
  useEffect(() => {
    localStorage.setItem('vb_ext_floating_btn', String(floatingButtonActive));
  }, [floatingButtonActive]);

  useEffect(() => {
    localStorage.setItem('vb_ext_fast_mode', String(autoSendToFastMode));
  }, [autoSendToFastMode]);

  // Handle 1-Click Install Flow
  const handleInstall = () => {
    setInstalling(true);
    setInstallStep(1);

    // Step 1: Compatibility check
    setTimeout(() => {
      setInstallStep(2);
      
      // Step 2: Injecting scripts & manifest
      setTimeout(() => {
        setInstallStep(3);

        // Step 3: Activation
        setTimeout(() => {
          setIsInstalled(true);
          setInstalling(false);
          setInstallStep(0);
          localStorage.setItem('vb_extension_installed', 'true');
          
          addToast(
            currentLang === 'ar' ? '🎉 تم تثبيت إضافة المتصفح بنجاح!' : '🎉 Extension Installed Successfully!',
            currentLang === 'ar'
              ? `تم تفعيل إضافة VideoBot لمتصفح ${getBrowserName(selectedBrowser)}. يظهر الآن زر الاستخراج الذكي على جميع مواقع الفيديو.`
              : `VideoBot extension activated for ${getBrowserName(selectedBrowser)}. Smart extract button is now active on video pages.`,
            'success',
            5000
          );
        }, 800);
      }, 900);
    }, 700);
  };

  const handleUninstall = () => {
    setIsInstalled(false);
    localStorage.removeItem('vb_extension_installed');
    addToast(
      currentLang === 'ar' ? 'تم إلغاء تفعيل الإضافة' : 'Extension Deactivated',
      currentLang === 'ar' ? 'يمكنك إعادة تثبيتها في أي وقت بضغطة زر واحدة.' : 'You can re-install it anytime in 1 click.',
      'info',
      3000
    );
  };

  const getBrowserName = (b: string) => {
    switch (b) {
      case 'chrome': return 'Google Chrome';
      case 'edge': return 'Microsoft Edge';
      case 'firefox': return 'Mozilla Firefox';
      case 'brave': return 'Brave & Opera';
      default: return 'Chrome';
    }
  };

  // Test simulation: Extracts a real sample video link
  const handleTriggerTest = () => {
    const sampleUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.tiktok.com/@creator/video/7391234567890123456',
      'https://www.instagram.com/reel/C8qXyz12345/'
    ];
    const pickedUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
    
    addToast(
      currentLang === 'ar' ? '🚀 تم التقاط الرابط عبر إضافة المتصفح' : '🚀 Video Captured by Extension',
      currentLang === 'ar' 
        ? 'جاري استخراج وتحميل الفيديو مباشرة بنقرة واحدة...' 
        : 'Extracting and downloading video directly in 1 click...',
      'download',
      3500
    );

    if (onCloseSettings) {
      onCloseSettings();
    }

    // Call callback to trigger link extraction in main App
    setTimeout(() => {
      onTestExtract(pickedUrl);
    }, 300);
  };

  // Download Manifest & Source package (.json)
  const handleDownloadPackage = () => {
    const manifest = {
      manifest_version: 3,
      name: "VideoBot Pro - Smart Video Downloader",
      version: "2.4.0",
      description: "Extract and download videos directly on web pages with 1 click across 1000+ platforms.",
      icons: {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
      },
      action: {
        default_popup: "popup.html",
        default_title: "VideoBot Video Extractor"
      },
      permissions: ["activeTab", "scripting", "storage"],
      content_scripts: [
        {
          matches: ["*://*.youtube.com/*", "*://*.tiktok.com/*", "*://*.instagram.com/*", "*://*/*"],
          js: ["content.js"],
          run_at: "document_idle"
        }
      ]
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'videobot-extension-manifest-v2.4.0.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast(
      currentLang === 'ar' ? 'تم تنزيل ملف الإضافة' : 'Extension Manifest Downloaded',
      currentLang === 'ar'
        ? 'تم حفظ ملف manifest.json الخاص بالإضافة لتثبيتها كإضافة محلية للمطورين.'
        : 'Saved manifest.json file to inspect or load as unpacked extension.',
      'info',
      4000
    );
  };

  // Copy bookmarklet code
  const bookmarkletCode = `javascript:(function(){var u=window.location.href;window.open('${window.location.origin}/?url='+encodeURIComponent(u)+'&autostart=1','_blank');})();`;

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode).then(() => {
      setCopiedBookmarklet(true);
      addToast(
        currentLang === 'ar' ? 'تم نسخ كود الاختصار السريع (Bookmarklet)' : 'Bookmarklet Code Copied',
        currentLang === 'ar' 
          ? 'يمكنك حفظه في شريط إشارات متصفحك لاستخراج أي صفحة بنقرة واحدة.' 
          : 'Save to bookmarks bar to extract videos instantly from any page.',
        'info',
        3500
      );
      setTimeout(() => setCopiedBookmarklet(false), 2500);
    });
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/30 via-[#131722] to-purple-900/20 border border-indigo-500/30 p-5 sm:p-6 shadow-xl">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <Puzzle className="w-7 h-7" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {t.bannerTitle}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-sm">
                  {t.bannerBadge}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed max-w-xl">
                {t.bannerDesc}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0 self-end sm:self-center">
            {isInstalled ? (
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t.statusActive}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-gray-800/80 border border-gray-700 text-gray-400 px-3 py-1.5 rounded-xl text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-gray-500" />
                <span>{t.statusInactive}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Browser Selector & One-Click Install Action */}
      {!isInstalled ? (
        <div className="bg-[#11141b] border border-gray-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">{t.chooseBrowser}</h4>
            </div>
            <span className="text-[11px] text-gray-400">{t.oneClick}</span>
          </div>

          {/* Supported Browsers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'chrome', name: 'Google Chrome', icon: Chrome, popular: true, color: 'text-amber-400' },
              { id: 'edge', name: 'Microsoft Edge', icon: Globe, popular: false, color: 'text-sky-400' },
              { id: 'firefox', name: 'Mozilla Firefox', icon: Globe, popular: false, color: 'text-orange-400' },
              { id: 'brave', name: 'Brave & Opera', icon: ShieldCheck, popular: false, color: 'text-purple-400' },
            ].map((b) => {
              const Icon = b.icon;
              const isSelected = selectedBrowser === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBrowser(b.id as any)}
                  className={`relative p-3.5 rounded-xl border ${isRtl ? 'text-right' : 'text-left'} transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                      : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/40 hover:border-gray-700'
                  }`}
                >
                  {b.popular && (
                    <span className={`absolute top-2 ${isRtl ? 'left-2' : 'right-2'} text-[9px] font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30`}>
                      {t.popularBadge}
                    </span>
                  )}
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-indigo-400' : b.color}`} />
                  <div>
                    <p className="text-xs font-bold">{b.name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{t.readyToInstall}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Installation Progress / Trigger Button */}
          {installing ? (
            <div className="p-4 rounded-xl bg-gray-900/80 border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                  {t.installingHeader} {getBrowserName(selectedBrowser)}...
                </span>
                <span className="text-indigo-400 font-mono">
                  {installStep === 1 ? '35%' : installStep === 2 ? '75%' : '100%'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  initial={{ width: '10%' }}
                  animate={{ 
                    width: installStep === 1 ? '35%' : installStep === 2 ? '75%' : '100%' 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Sub-steps */}
              <div className="space-y-1.5 text-[11px] text-gray-400">
                <div className={`flex items-center gap-2 ${installStep >= 1 ? 'text-emerald-400 font-semibold' : ''}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.step1}</span>
                </div>
                <div className={`flex items-center gap-2 ${installStep >= 2 ? 'text-emerald-400 font-semibold' : ''}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.step2}</span>
                </div>
                <div className={`flex items-center gap-2 ${installStep >= 3 ? 'text-emerald-400 font-semibold' : ''}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.step3}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleInstall}
                className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <Download className="w-4 h-4" />
                <span>{t.installBtn} {getBrowserName(selectedBrowser)}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPackage}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-gray-900/60 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/80 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                title={t.devPackageBtn}
              >
                <FolderDown className="w-4 h-4 text-indigo-400" />
                <span>{t.devPackageBtn}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Installed Control Center */
        <div className="bg-[#11141b] border border-emerald-500/30 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <h4 className="text-base font-bold text-white">{t.activeHeader}</h4>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {t.activeDesc}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUninstall}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-gray-800 hover:border-rose-500/30 transition-colors cursor-pointer"
              >
                {t.uninstallBtn}
              </button>
            </div>
          </div>

          {/* Instant 1-Click Test Demo */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h5 className="text-sm font-bold text-white">{t.liveDemoTitle}</h5>
              </div>
              <p className="text-xs text-gray-300 mt-1">
                {t.liveDemoDesc}
              </p>
            </div>

            <button
              type="button"
              onClick={handleTriggerTest}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>{t.liveDemoBtn}</span>
            </button>
          </div>

          {/* Extension Options & Preferences */}
          <div className="space-y-3 pt-1">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              {t.behaviorTitle}
            </h5>

            {/* Option 1: Floating Button */}
            <div className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-200">{t.floatingBtnTitle}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {t.floatingBtnDesc}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={floatingButtonActive}
                onClick={() => {
                  const next = !floatingButtonActive;
                  setFloatingButtonActive(next);
                  addToast(
                    currentLang === 'ar' ? (next ? 'تم تفعيل الزر العائم' : 'تم تعطيل الزر العائم') : (next ? 'Floating Button Enabled' : 'Floating Button Disabled'),
                    currentLang === 'ar' ? (next ? 'سيظهر زر التحميل فوق مشغلات الفيديو.' : 'تم إخفاء الزر العائم من المواقع.') : (next ? 'Download button will appear over videos.' : 'Floating button hidden from pages.'),
                    'info',
                    2500
                  );
                }}
                className={`relative w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shrink-0 ${
                  floatingButtonActive ? 'bg-indigo-600 justify-start' : 'bg-gray-700 justify-end'
                }`}
              >
                <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Option 2: Direct to Quick Download */}
            <div className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-200">{t.fastIntegrationTitle}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {t.fastIntegrationDesc}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoSendToFastMode}
                onClick={() => {
                  const next = !autoSendToFastMode;
                  setAutoSendToFastMode(next);
                  addToast(
                    currentLang === 'ar' ? (next ? 'تم تفعيل التحميل الفوري' : 'تم إيقاف التحميل الفوري') : (next ? 'Instant Download Enabled' : 'Instant Download Disabled'),
                    currentLang === 'ar' ? (next ? 'سيتم التحميل المباشر بأعلى دقة تلقائياً.' : 'سيعرض خيارات الجودة والصيغة.') : (next ? 'Directly starts download at max quality.' : 'Will show format options.'),
                    'info',
                    2500
                  );
                }}
                className={`relative w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shrink-0 ${
                  autoSendToFastMode ? 'bg-indigo-600 justify-start' : 'bg-gray-700 justify-end'
                }`}
              >
                <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>

            {/* Option 3: Auto Detect 4K */}
            <div className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-gray-200">{t.auto4kTitle}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {t.auto4kDesc}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoDetectHighestQuality}
                onClick={() => setAutoDetectHighestQuality(!autoDetectHighestQuality)}
                className={`relative w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shrink-0 ${
                  autoDetectHighestQuality ? 'bg-indigo-600 justify-start' : 'bg-gray-700 justify-end'
                }`}
              >
                <motion.div layout className="w-5 h-5 rounded-full bg-white shadow-md" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Interactive Preview of the Extension on a Webpage */}
      <div className="bg-[#11141b] border border-gray-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <MousePointer className="w-4 h-4 text-indigo-400" />
            {t.previewTitle}
          </h4>
          <span className="text-[10px] text-gray-500">{t.previewBadge}</span>
        </div>

        {/* Browser Mockup Window */}
        <div className="rounded-xl border border-gray-700/80 bg-[#0d0f14] overflow-hidden shadow-2xl">
          {/* Browser Address Bar */}
          <div className="bg-[#161a23] px-3 py-2 border-b border-gray-800 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex-1 bg-black/40 border border-gray-700/50 rounded-md px-3 py-1 text-[11px] text-gray-400 font-mono truncate text-left dir-ltr flex items-center gap-1.5">
              <span className="text-emerald-400">🔒</span>
              <span>https://youtube.com/watch?v=tech-keynote-2024</span>
            </div>
            <div className="w-6 h-6 rounded bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-xs font-bold">
              🧩
            </div>
          </div>

          {/* Webpage Content with Floating Download Button */}
          <div className="p-4 sm:p-5 relative bg-gradient-to-b from-[#11141d] to-[#0d0f14]">
            <div className="relative rounded-lg overflow-hidden border border-gray-800 bg-neutral-900 aspect-video max-h-52 w-full flex items-center justify-center group">
              {/* Fake Video Thumbnail / Play Icon */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-black/40" />
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white z-10 group-hover:scale-110 transition-transform">
                <span className="text-lg">▶</span>
              </div>
              <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-gray-300 font-mono z-10">
                12:45
              </span>

              {/* The Floating VideoBot Extension Button */}
              <motion.div 
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} z-20 flex items-center gap-2 bg-[#0d0f14]/95 border border-indigo-500/80 px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-md cursor-pointer hover:border-indigo-400 hover:bg-indigo-950/80 transition-all`}
                onClick={handleTriggerTest}
                title="Click to test button"
              >
                <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
                </div>
                <div className={`flex flex-col ${isRtl ? 'text-right' : 'text-left'}`}>
                  <span className="text-[11px] font-bold text-white flex items-center gap-1">
                    {t.previewFloatingBtn}
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  </span>
                  <span className="text-[9px] text-indigo-300 font-mono">1080p HD • 1-Click</span>
                </div>
              </motion.div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-3">
              {t.previewCaption}
            </p>
          </div>
        </div>
      </div>

      {/* Alternative: Bookmarklet (زر الاختصار السريع بدون تثبيت) */}
      <div className="bg-gray-900/30 border border-gray-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-white">{t.bookmarkletTitle}</h4>
          </div>
          <span className="text-[10px] text-gray-500">{t.bookmarkletBadge}</span>
        </div>

        <p className="text-xs text-gray-300/80 leading-relaxed">
          {t.bookmarkletDesc}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Draggable bookmarklet link */}
          <a
            href={bookmarkletCode}
            onClick={(e) => {
              e.preventDefault();
              addToast(
                currentLang === 'ar' ? 'زر الإشارات المرجعية' : 'Bookmarks Bar Item',
                currentLang === 'ar' 
                  ? 'اسحب هذا الزر بالماوس وأفلته في شريط إشارات متصفحك أعلى الشاشة!'
                  : 'Drag this button to your browser bookmarks bar at the top of your screen!',
                'info',
                4000
              );
            }}
            draggable="true"
            className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-2 transition-all cursor-grab active:cursor-grabbing shadow-sm"
            title="Drag to bookmarks bar"
          >
            <Bookmark className="w-3.5 h-3.5 fill-amber-400" />
            <span>{t.bookmarkletDragText}</span>
          </a>

          <button
            type="button"
            onClick={handleCopyBookmarklet}
            className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedBookmarklet ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{t.copiedCodeBtn}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t.copyCodeBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
