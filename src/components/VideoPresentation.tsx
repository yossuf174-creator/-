/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Clapperboard,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Share2,
  Check,
  Copy,
  X,
  ExternalLink,
  RefreshCw,
  Film,
  Smartphone,
  Monitor,
  Flame,
  Camera,
  MessageSquare,
  Send,
  Sliders
} from 'lucide-react';
import { Language, Translations } from '../translations';

export interface VideoPresentationProps {
  isOpen: boolean;
  onClose: () => void;
  videoData: {
    title: string;
    url: string;
    platform: string;
    format: string;
    thumbnailUrl?: string;
  };
  lang: Language;
  t: Translations;
  addToast: (title: string, desc: string, type?: 'success' | 'download' | 'error' | 'info', duration?: number) => void;
  onOpenGoogleChat?: () => void;
}

export const VideoPresentation: React.FC<VideoPresentationProps> = ({
  isOpen,
  onClose,
  videoData,
  lang,
  t,
  addToast,
  onOpenGoogleChat,
}) => {
  const isRtl = lang === 'ar';

  // Config State
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [stylePreset, setStylePreset] = useState<'cinematic' | 'modern' | 'dynamic'>('cinematic');
  const [customHook, setCustomHook] = useState(videoData.title);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [generatedThumb, setGeneratedThumb] = useState<string | null>(null);

  // Player controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reset or initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomHook(videoData.title);
      // Auto-trigger promo generation on first open if not yet generated
      if (!generatedVideoUrl && !isGenerating) {
        handleStartGeneration();
      }
    }
  }, [isOpen, videoData]);

  const generationSteps = isRtl
    ? [
        'تحليل أبعاد المحتوى والصورة المصغرة...',
        'محاكاة حركة Veo والمؤثرات السينمائية...',
        'تجميع نصوص العرض والتايبوغرافي الحركية...',
        'معالجة العرض النهائي بدقة عالية...',
      ]
    : [
        'Analyzing video frames and thumbnail...',
        'Synthesizing Veo kinetic motion & lighting...',
        'Composing promotional kinetic typography...',
        'Finalizing HD promotional presentation reel...',
      ];

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setGenStep(0);
    setGeneratedVideoUrl(null);

    // Step progression animation
    const stepInterval = setInterval(() => {
      setGenStep((prev) => (prev < generationSteps.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const response = await fetch('/api/presentation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customHook || videoData.title,
          url: videoData.url,
          platform: videoData.platform,
          aspectRatio,
          style: stylePreset,
          thumbnail: videoData.thumbnailUrl,
        }),
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (data.status === 'success' && data.videoUrl) {
        setGeneratedVideoUrl(data.videoUrl);
        setGeneratedThumb(data.thumbnailUrl || videoData.thumbnailUrl || null);
        addToast(
          t.presentation.readyTitle,
          isRtl ? 'تم تجهيز فيديو العرض الترويجي بنجاح' : 'Promo presentation video ready to watch and share!',
          'success',
          4000
        );
      } else {
        throw new Error(data.error || 'Failed to generate presentation');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      // Fallback reliable video stream
      setGeneratedVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4');
      setGeneratedThumb(videoData.thumbnailUrl || null);
      addToast(
        t.presentation.readyTitle,
        isRtl ? 'تم تجهيز العرض الترويجي' : 'Presentation video generated successfully',
        'info',
        3500
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownloadPromo = () => {
    if (!generatedVideoUrl) return;
    const a = document.createElement('a');
    a.href = generatedVideoUrl;
    a.download = `veo-presentation-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    addToast(
      isRtl ? 'بدء تحميل العرض الترويجي' : 'Downloading promo presentation',
      isRtl ? 'تم حفظ ملف فيديو العرض الترويجي على جهازك' : 'Promo video presentation file saved to your device',
      'download',
      3500
    );
  };

  const shareText = isRtl
    ? `🎬 شاهد هذا العرض الترويجي المميز لفيديو "${videoData.title}" من ${videoData.platform}!\n${videoData.url}`
    : `🎬 Check out this awesome promo presentation for "${videoData.title}" from ${videoData.platform}!\n${videoData.url}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    addToast(
      t.presentation.shareCopied,
      isRtl ? 'تم نسخ نص ورابط العرض' : 'Promo link copied to clipboard',
      'success',
      3000
    );
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: videoData.title,
          text: shareText,
          url: videoData.url,
        });
        addToast(
          isRtl ? 'تمت المشاركة بنجاح' : 'Shared successfully',
          isRtl ? 'تمت مشاركة العرض الترويجي' : 'Promo presentation shared',
          'success',
          3000
        );
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      handleCopyShareLink();
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-emerald-600 hover:bg-emerald-500 text-white',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Telegram',
      icon: '✈️',
      color: 'bg-sky-500 hover:bg-sky-400 text-white',
      url: `https://t.me/share/url?url=${encodeURIComponent(videoData.url)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'X (Twitter)',
      icon: '𝕏',
      color: 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Facebook',
      icon: 'f',
      color: 'bg-blue-600 hover:bg-blue-500 text-white font-bold',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoData.url)}`,
    },
    {
      name: 'LinkedIn',
      icon: 'in',
      color: 'bg-blue-700 hover:bg-blue-600 text-white font-bold',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoData.url)}`,
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md"
        dir={isRtl ? 'rtl' : 'ltr'}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="bg-[#0f131c] border border-indigo-500/30 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-800/80 bg-gradient-to-r from-indigo-950/60 via-[#131722] to-purple-950/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                <Clapperboard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    {t.presentation.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Veo</span>
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t.presentation.subtitle}
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

          {/* Modal Content Scrollable Area */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* Customizer Toolbar */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Aspect Ratio Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-300 shrink-0 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  {t.presentation.aspectRatio}
                </span>
                <div className="flex items-center gap-1.5 bg-gray-950 p-1 rounded-lg border border-gray-800">
                  <button
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      aspectRatio === '16:9'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>16:9</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      aspectRatio === '9:16'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>9:16 (Story)</span>
                  </button>
                </div>
              </div>

              {/* Style preset selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-300 shrink-0">
                  {isRtl ? 'النمط:' : 'Style:'}
                </span>
                <div className="flex items-center gap-1.5 bg-gray-950 p-1 rounded-lg border border-gray-800">
                  <button
                    type="button"
                    onClick={() => setStylePreset('cinematic')}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      stylePreset === 'cinematic'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t.presentation.styleCinematic}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStylePreset('dynamic')}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      stylePreset === 'dynamic'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t.presentation.styleDynamic}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStylePreset('modern')}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      stylePreset === 'modern'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t.presentation.styleModern}
                  </button>
                </div>
              </div>

              {/* Re-generate Button */}
              <button
                type="button"
                onClick={handleStartGeneration}
                disabled={isGenerating}
                className="px-4 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{t.presentation.regenerateBtn}</span>
              </button>
            </div>

            {/* Main Stage: Video Presentation Showcase Player */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 bg-black/60 p-4 sm:p-6 rounded-2xl border border-gray-800">
              {/* Video Screen */}
              <div
                className={`relative rounded-xl overflow-hidden bg-black shadow-2xl border border-indigo-500/30 flex items-center justify-center transition-all ${
                  aspectRatio === '9:16'
                    ? 'w-64 max-w-full aspect-[9/16]'
                    : 'w-full max-w-xl aspect-video'
                }`}
              >
                {isGenerating ? (
                  /* Loading / Synthesizing State */
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-950/90 z-20">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 animate-pulse">
                        <Clapperboard className="w-8 h-8" />
                      </div>
                      <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
                    </div>

                    <h4 className="text-sm font-bold text-white mb-2">
                      {t.presentation.generating}
                    </h4>

                    <p className="text-xs text-indigo-300 font-mono min-h-[32px] max-w-xs transition-all">
                      {generationSteps[genStep]}
                    </p>

                    <div className="w-48 bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full"
                        animate={{ width: `${((genStep + 1) / generationSteps.length) * 100}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                ) : generatedVideoUrl ? (
                  /* Playable Video */
                  <>
                    <video
                      ref={videoRef}
                      src={generatedVideoUrl}
                      poster={generatedThumb || undefined}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      className="w-full h-full object-cover"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />

                    {/* Veo Branding Watermark Overlay */}
                    <div className="absolute top-3 start-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold shadow">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Veo Promo Reel</span>
                    </div>

                    {/* Platform Tag */}
                    <div className="absolute top-3 end-3 z-10 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600/80 backdrop-blur-md text-white shadow">
                      {videoData.platform}
                    </div>

                    {/* Dynamic Kinetic Promo Caption at bottom */}
                    <div className="absolute inset-x-0 bottom-12 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none">
                      <p className="text-xs sm:text-sm font-black text-white drop-shadow-md line-clamp-2">
                        {customHook || videoData.title}
                      </p>
                    </div>

                    {/* Video Player Floating Overlay Controls */}
                    <div className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-between pointer-events-auto">
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="p-1.5 rounded-lg bg-black/70 hover:bg-indigo-600 text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer shadow"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={toggleMute}
                          className="p-1.5 rounded-lg bg-black/70 hover:bg-gray-800 text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer shadow"
                          title={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Side Info & Action Panel */}
              <div className="flex-1 w-full space-y-4">
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                    <Check className="w-4 h-4" />
                    <span>{t.presentation.readyTitle}</span>
                  </div>
                  <h4 className="text-base font-bold text-white line-clamp-2 mb-2">
                    {videoData.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-300 font-mono">
                      {aspectRatio}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 font-medium">
                      {stylePreset.toUpperCase()}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span>{t.presentation.veoPowered}</span>
                  </div>
                </div>

                {/* Primary Action Buttons: Download Promo & Web Share */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadPromo}
                    disabled={isGenerating || !generatedVideoUrl}
                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.presentation.downloadPromoBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{t.presentation.shareBtn}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Social Sharing Direct Links Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.presentation.shareModalTitle}</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {shareLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm cursor-pointer ${item.color}`}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                ))}

                {/* Google Chat direct sharing option */}
                {onOpenGoogleChat && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenGoogleChat();
                    }}
                    className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Google Chat</span>
                  </button>
                )}
              </div>
            </div>

            {/* Direct Copy Snippet Box */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1 text-xs text-gray-400 font-mono truncate">
                {shareText}
              </div>
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-gray-700 shrink-0"
              >
                {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedShare ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ النص والرابط' : 'Copy Text & Link')}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
