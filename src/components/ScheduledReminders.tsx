import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  BellRing, 
  Timer, 
  Clock, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Sparkles, 
  Play, 
  X,
  FileDown,
  HardDrive,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { ToastType } from './Toast';
import { Language, translations } from '../translations';

export interface ScheduledReminder {
  id: string;
  title: string;
  targetTime: number; // timestamp in ms
  totalSeconds: number;
  fileName?: string;
  fileSize?: string;
  enableSound: boolean;
  enableBrowserNotif: boolean;
  createdAt: number;
}

// Synthesize pleasant sound chime using Web Audio API (no external asset needed)
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // Note 2: B5 (987.77 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.55);

    // Note 3: E6 (1318.51 Hz) - high chime
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.24);
    gain3.gain.setValueAtTime(0.35, ctx.currentTime + 0.24);
    gain3.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(ctx.currentTime + 0.24);
    osc3.stop(ctx.currentTime + 0.85);
  } catch (err) {
    // AudioContext blocked or not supported
  }
};

// Send standard HTML5 Browser Desktop Notification
export const triggerBrowserNotification = (title: string, body: string) => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {
        // May fail inside some sandboxed iframes
      }
    }
  }
};

interface ScheduledRemindersProps {
  reminders: ScheduledReminder[];
  onAddReminder: (reminder: Omit<ScheduledReminder, 'id' | 'createdAt'>) => void;
  onRemoveReminder: (id: string) => void;
  addToast: (title: string, message: string, type?: ToastType, duration?: number) => void;
  autoLargeDownloadAlert: boolean;
  onToggleAutoLargeAlert: (val: boolean) => void;
  largeSizeThreshold: number; // in MB
  onChangeLargeThreshold: (val: number) => void;
  recentFileOptions?: { name: string; size: string }[];
  initialFileName?: string;
  initialFileSize?: string;
  onClose?: () => void;
  lang?: Language;
}

export const ScheduledReminders: React.FC<ScheduledRemindersProps> = ({
  reminders,
  onAddReminder,
  onRemoveReminder,
  addToast,
  autoLargeDownloadAlert,
  onToggleAutoLargeAlert,
  largeSizeThreshold,
  onChangeLargeThreshold,
  recentFileOptions = [],
  initialFileName = '',
  initialFileSize = '',
  onClose,
  lang = 'ar'
}) => {
  const currentLang = lang || 'ar';
  const t = translations[currentLang].reminders;
  const isRtl = currentLang === 'ar';

  // Preset or custom duration state (in seconds)
  const [selectedDurationSeconds, setSelectedDurationSeconds] = useState<number>(300); // 5 minutes default
  const [customMinutes, setCustomMinutes] = useState<string>('5');
  const [customSeconds, setCustomSeconds] = useState<string>('0');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [reminderTitle, setReminderTitle] = useState<string>(() => {
    if (initialFileName) {
      return currentLang === 'ar' 
        ? `التحقق من اكتمال تحميل: ${initialFileName}`
        : `Check download completion: ${initialFileName}`;
    }
    return currentLang === 'ar'
      ? 'التحقق من اكتمال تحميل الفيديو كبير الحجم'
      : 'Check on large video download completion';
  });

  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string }>({
    name: initialFileName || '',
    size: initialFileSize || ''
  });

  const [enableSound, setEnableSound] = useState(true);
  const [enableBrowserNotif, setEnableBrowserNotif] = useState(true);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');

  // Check notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setBrowserPermission(res);
        if (res === 'granted') {
          addToast(
            currentLang === 'ar' ? 'تم تفعيل تنبيهات المتصفح' : 'Browser Notifications Enabled',
            currentLang === 'ar' 
              ? 'ستصلك الآن إشعارات سطح المكتب فور اكتمال التوقيت أو اكتمال التحميل.'
              : 'You will now receive desktop popup notifications upon timer expiry.',
            'success',
            3500
          );
          triggerBrowserNotification(
            'VideoBot Pro',
            currentLang === 'ar' 
              ? 'تم إعداد تنبيهات المتصفح بنجاح! سنقوم بإشعارك عند اكتمال التحميلات.'
              : 'Browser notifications are configured! We will alert you when downloads complete.'
          );
        } else {
          addToast(
            currentLang === 'ar' ? 'تم رفض إذن التنبيهات' : 'Notification Permission Denied',
            currentLang === 'ar' 
              ? 'يمكنك تفعيل الإذن من إعدادات المتصفح، أو الاعتماد على الصوت والواجهة.'
              : 'You can enable notifications in browser settings or rely on in-app audio chime.',
            'info',
            3500
          );
        }
      } catch (e) {
        addToast(
          currentLang === 'ar' ? 'تنبيه المتصفح' : 'Browser Alerts',
          currentLang === 'ar' 
            ? 'التنبيهات مدعومة عبر الواجهة والصوت المدمج.'
            : 'Alerts are supported via in-app banners and audio chime.',
          'info',
          3000
        );
      }
    }
  };

  const handleTestInstantNotification = () => {
    playNotificationChime();
    triggerBrowserNotification(
      currentLang === 'ar' ? '🔔 تجربة تنبيه VideoBot Pro' : '🔔 VideoBot Pro Test Notification',
      currentLang === 'ar' 
        ? 'هذا تنبيه تجريبي! هكذا ستصلك إشعارات اكتمال تحميل الملفات كبيرة الحجم.'
        : 'This is a test alert! This is how notifications appear when large downloads finish.'
    );
    addToast(
      currentLang === 'ar' ? '🔔 تنبيه تجريبي مكتمل' : '🔔 Test Alert Sent',
      currentLang === 'ar' 
        ? 'تم إرسال إشعار تجريبي وتشغيل نغمة التنبيه بنجاح!'
        : 'Test notification sent and audio chime played successfully!',
      'download',
      3500
    );
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let durationInSec = selectedDurationSeconds;
    if (isCustom) {
      const mins = parseInt(customMinutes, 10) || 0;
      const secs = parseInt(customSeconds, 10) || 0;
      durationInSec = mins * 60 + secs;
      if (durationInSec <= 0) {
        addToast(
          currentLang === 'ar' ? 'خطأ في المدة' : 'Invalid Duration',
          currentLang === 'ar' ? 'يرجى تحديد مدة زمنية صحيحة أكبر من صفر.' : 'Please enter a duration greater than zero.',
          'error',
          3000
        );
        return;
      }
    }

    const targetTimestamp = Date.now() + durationInSec * 1000;
    const title = reminderTitle.trim() || (currentLang === 'ar' ? 'اكتمال تحميل ملف كبير الحجم' : 'Large file download check');

    onAddReminder({
      title,
      targetTime: targetTimestamp,
      totalSeconds: durationInSec,
      fileName: attachedFile.name || undefined,
      fileSize: attachedFile.size || undefined,
      enableSound,
      enableBrowserNotif
    });

    const formattedDuration = durationInSec >= 60 
      ? (currentLang === 'ar' ? `${Math.round(durationInSec / 60)} دقيقة` : `${Math.round(durationInSec / 60)} min`)
      : (currentLang === 'ar' ? `${durationInSec} ثانية` : `${durationInSec} sec`);

    addToast(
      currentLang === 'ar' ? '⏰ تم جدولة التنبيه بنجاح' : '⏰ Reminder Scheduled',
      currentLang === 'ar' 
        ? `سيتم إرسال إشعار بعد ${formattedDuration} (${title})`
        : `Notification will fire in ${formattedDuration} (${title})`,
      'info',
      4000
    );

    // Ask for browser notif permission if not granted yet
    if (enableBrowserNotif && browserPermission === 'default') {
      requestNotificationPermission();
    }
  };

  const presets = [
    { label: t.preset1min, seconds: 60, icon: '⚡' },
    { label: t.preset5min, seconds: 300, icon: '⏱️' },
    { label: t.preset15min, seconds: 900, icon: '⌛' },
    { label: t.preset30min, seconds: 1800, icon: '🕒' },
    { label: t.preset60min, seconds: 3600, icon: '⏰' },
  ];

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/50 via-[#131722] to-amber-950/30 border border-indigo-500/30 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 shrink-0">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {t.bannerTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {t.bannerTag}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300/80 leading-relaxed max-w-xl">
                {t.bannerDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTestInstantNotification}
            className="px-3.5 py-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 self-end sm:self-center"
            title={t.testInstant}
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>{t.testInstant}</span>
          </button>
        </div>
      </div>

      {/* Browser Notification Permission Banner */}
      {browserPermission !== 'granted' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-200">
                {t.permTitle}
              </p>
              <p className="text-[11px] text-amber-300/70 mt-0.5">
                {t.permDesc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestNotificationPermission}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            {t.enablePermBtn}
          </button>
        </div>
      )}

      {/* Active Reminders List (if any) */}
      {reminders.length > 0 && (
        <div className="bg-[#11141b] border border-indigo-500/40 rounded-2xl p-5 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">{t.activeTitle}</h4>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              {reminders.length} {t.activeCount}
            </span>
          </div>

          <div className="space-y-2.5">
            {reminders.map((r) => {
              const now = Date.now();
              const remainingMs = Math.max(0, r.targetTime - now);
              const remainingSec = Math.ceil(remainingMs / 1000);
              const mins = Math.floor(remainingSec / 60);
              const secs = remainingSec % 60;
              const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
              const progressPercent = Math.min(100, Math.max(0, ((r.totalSeconds - remainingSec) / r.totalSeconds) * 100));

              return (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 font-mono font-bold text-xs">
                      {mins > 0 ? `${mins}m` : `${secs}s`}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-200 truncate">{r.title}</p>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                        {r.fileSize && (
                          <span className="text-amber-400/90 font-mono">[{r.fileSize}]</span>
                        )}
                        <span className="flex items-center gap-1 font-mono text-indigo-300">
                          <Clock className="w-3 h-3" />
                          {t.remainLabel} {formattedTime}
                        </span>
                        {r.enableSound && (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Volume2 className="w-3 h-3" /> {t.soundLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-white tracking-wider">
                        {formattedTime}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveReminder(r.id);
                        addToast(
                          currentLang === 'ar' ? 'تم إلغاء التنبيه' : 'Reminder Cancelled',
                          r.title,
                          'info',
                          2500
                        );
                      }}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-gray-700 hover:border-rose-500/30 transition-colors cursor-pointer"
                      title={t.cancelTooltip}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Countdown Progress Line */}
                  <div className="absolute bottom-0 right-0 left-0 h-1 bg-gray-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule a New Reminder Form */}
      <form onSubmit={handleScheduleSubmit} className="bg-[#11141b] border border-gray-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-bold text-white">{t.newTitle}</h4>
          </div>
          <span className="text-[11px] text-gray-400">{t.newSubtitle}</span>
        </div>

        {/* 1. Time Duration Presets */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-2.5">
            {t.durationLabel}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {presets.map((p) => {
              const active = !isCustom && selectedDurationSeconds === p.seconds;
              return (
                <button
                  key={p.seconds}
                  type="button"
                  onClick={() => {
                    setIsCustom(false);
                    setSelectedDurationSeconds(p.seconds);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                      : 'bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-gray-800/60 hover:text-white'
                  }`}
                >
                  <span className="text-base">{p.icon}</span>
                  <span className="text-xs font-bold">{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Time Toggle */}
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className={`text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isCustom ? 'text-amber-400' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{isCustom ? t.customToggleActive : t.customToggleInactive}</span>
            </button>
          </div>

          {isCustom && (
            <div className="mt-3 p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-16 bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-center font-mono text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-xs text-gray-400">{t.minutes}</span>
              </div>
              <span className="text-gray-600 font-bold">:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(e.target.value)}
                  className="w-16 bg-black/50 border border-gray-700 rounded-lg px-2.5 py-1.5 text-center font-mono text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-xs text-gray-400">{t.seconds}</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Reminder Title / Note */}
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-2">
            {t.titleLabel}
          </label>
          <input
            type="text"
            value={reminderTitle}
            onChange={(e) => setReminderTitle(e.target.value)}
            placeholder={t.titlePlaceholder}
            className="w-full bg-black/40 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:border-indigo-500 focus:outline-none placeholder-gray-600"
          />
        </div>

        {/* 3. Attach Recent Large File Download (Optional) */}
        {recentFileOptions.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-2 flex items-center gap-1.5">
              <FileDown className="w-3.5 h-3.5 text-indigo-400" />
              {t.attachLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {recentFileOptions.slice(0, 3).map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => {
                    setAttachedFile(f);
                    setReminderTitle(currentLang === 'ar' ? `اكتمال تحميل: ${f.name}` : `Finished: ${f.name}`);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer truncate max-w-xs text-right ${
                    attachedFile.name === f.name
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                      : 'bg-gray-900/40 border-gray-800 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="text-indigo-400 font-mono ml-1.5">[{f.size}]</span>
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Notification Sound & Browser Toggle Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Sound Toggle */}
          <div className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {enableSound ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-500" />
              )}
              <div>
                <p className="text-xs font-bold text-gray-200">{t.soundTitle}</p>
                <p className="text-[10px] text-gray-400">{t.soundDesc}</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enableSound}
              onClick={() => setEnableSound(!enableSound)}
              className={`relative w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shrink-0 ${
                enableSound ? 'bg-indigo-600 justify-start' : 'bg-gray-700 justify-end'
              }`}
            >
              <motion.div layout className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Browser Notification Toggle */}
          <div className="p-3.5 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs font-bold text-gray-200">{t.browserNotifTitle}</p>
                <p className="text-[10px] text-gray-400">{t.browserNotifDesc}</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enableBrowserNotif}
              onClick={() => setEnableBrowserNotif(!enableBrowserNotif)}
              className={`relative w-10 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shrink-0 ${
                enableBrowserNotif ? 'bg-indigo-600 justify-start' : 'bg-gray-700 justify-end'
              }`}
            >
              <motion.div layout className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Timer className="w-4 h-4 text-amber-300" />
            <span>{t.submitBtn}</span>
          </button>
        </div>
      </form>

      {/* Auto-Notification for Large Downloads Feature */}
      <div className="bg-[#11141b] border border-gray-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  {t.autoLargeTitle}
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {t.smartBadge}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {t.autoLargeDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={autoLargeDownloadAlert}
            onClick={() => onToggleAutoLargeAlert(!autoLargeDownloadAlert)}
            className={`relative w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center shrink-0 ${
              autoLargeDownloadAlert ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] justify-start' : 'bg-gray-700 justify-end'
            }`}
          >
            <motion.div layout className="w-5.5 h-5.5 rounded-full bg-white shadow-md flex items-center justify-center">
              {autoLargeDownloadAlert && <Bell className="w-3 h-3 text-amber-600 fill-amber-500" />}
            </motion.div>
          </button>
        </div>

        {/* Threshold Selection */}
        {autoLargeDownloadAlert && (
          <div className="pt-3 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span className="text-xs font-semibold text-gray-300">
              {t.thresholdLabel}
            </span>
            <div className="flex items-center gap-2">
              {[30, 50, 100, 200].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChangeLargeThreshold(size)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                    largeSizeThreshold === size
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  &gt; {size} MB
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
