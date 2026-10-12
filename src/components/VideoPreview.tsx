/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Maximize2, 
  X, 
  Play, 
  Film, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  Sparkles,
  Eye,
  ZoomIn,
  Volume2
} from 'lucide-react';
import { Language, Translations } from '../translations';

export interface VideoPreviewProps {
  title: string;
  url: string;
  platform: string;
  format: string;
  thumbnailUrl?: string;
  lang: Language;
  t: Translations;
  onDownload?: () => void;
  onCopyLink?: () => void;
}

/**
 * Helper to determine best thumbnail for any video URL or platform
 */
export function resolveThumbnailUrl(url: string, platform: string, fallbackThumb?: string): string {
  if (fallbackThumb && fallbackThumb.trim().length > 0) {
    return fallbackThumb;
  }

  // YouTube detection
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
  }

  // Platform specific curated visuals
  const p = platform.toLowerCase();
  if (p.includes('tiktok')) {
    return 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=800&q=80';
  }
  if (p.includes('instagram')) {
    return 'https://images.unsplash.com/photo-1611262588024-d12430b98920?auto=format&fit=crop&w=800&q=80';
  }
  if (p.includes('twitter') || p.includes('x')) {
    return 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=800&q=80';
  }
  if (p.includes('vimeo')) {
    return 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80';
  }
  if (p.includes('twitch')) {
    return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
  }
  if (p.includes('sound')) {
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
  }
  if (p.includes('linkedin')) {
    return 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?auto=format&fit=crop&w=800&q=80';
  }

  return 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80';
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  title,
  url,
  platform,
  format,
  thumbnailUrl,
  lang,
  t,
  onDownload,
  onCopyLink,
}) => {
  const isRtl = lang === 'ar';
  const isAudio = format.toLowerCase().includes('mp3') || format.toLowerCase().includes('wav');
  
  const [isZoomed, setIsZoomed] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute resolved thumbnail
  const currentThumb = imgError 
    ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'
    : resolveThumbnailUrl(url, platform, thumbnailUrl);

  // Keyboard Escape listener to close zoom modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    };
    if (isZoomed) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomed]);

  const handleCopy = () => {
    if (onCopyLink) {
      onCopyLink();
    } else {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <>
      {/* Thumbnail Card Component */}
      <div 
        className="relative group rounded-xl overflow-hidden bg-gray-950 border border-gray-800 hover:border-indigo-500/50 transition-all shadow-lg shrink-0 w-full sm:w-48 md:w-56 aspect-video flex items-center justify-center cursor-pointer"
        onClick={() => setIsZoomed(true)}
        title={t.result.clickToEnlarge || 'Click to enlarge thumbnail'}
      >
        {/* Background Image / Thumbnail */}
        <img
          src={currentThumb}
          alt={title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 group-hover:from-black/70 group-hover:via-black/20 transition-colors" />

        {/* Center Play / Audio Badge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl transform transition-transform duration-300 group-hover:scale-115 group-hover:bg-indigo-600/90 group-hover:border-indigo-400">
            {isAudio ? (
              <Volume2 className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white fill-white ml-0.5" />
            )}
          </div>
        </div>

        {/* Top Badges: Platform + Enlarge Button */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-black/70 backdrop-blur-md text-gray-200 border border-white/10 uppercase tracking-wide">
            {platform}
          </span>

          {/* Enlarge Button (interactive) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(true);
            }}
            className="p-1 rounded-md bg-black/70 hover:bg-indigo-600 text-white backdrop-blur-md border border-white/15 transition-all pointer-events-auto cursor-pointer shadow-md group-hover:scale-105"
            title={t.result.enlargeThumbnail || 'Enlarge preview'}
            aria-label={t.result.enlargeThumbnail || 'Enlarge preview'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Badges: Format & Hint */}
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-[10px] pointer-events-none">
          <span className="px-1.5 py-0.5 rounded bg-indigo-600/90 text-white font-mono font-bold tracking-tight shadow">
            {format}
          </span>
          <span className="text-[9px] text-gray-300/90 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-3 h-3 text-indigo-400" />
            <span>{isRtl ? 'تكبير' : 'Zoom'}</span>
          </span>
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <div 
            className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md" 
            dir={isRtl ? 'rtl' : 'ltr'}
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-[#11141b] border border-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-[#0e1117] shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Eye className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md" title={title}>
                      {title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-indigo-400 font-semibold">{platform}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-xs text-emerald-400 font-mono">{format}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsZoomed(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
                  aria-label={t.result.closePreview || 'Close Preview'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Large High-Resolution Image Preview */}
              <div className="relative bg-black flex items-center justify-center p-2 sm:p-4 overflow-hidden max-h-[60vh]">
                <img
                  src={currentThumb}
                  alt={title}
                  className="max-h-[55vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
                />

                {/* Overlaid Badges */}
                <div className="absolute top-4 start-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-black/80 backdrop-blur-md text-white border border-white/10 shadow">
                    {platform}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow">
                    {format}
                  </span>
                </div>
              </div>

              {/* Modal Footer & Quick Actions */}
              <div className="p-4 sm:p-5 border-t border-gray-800 bg-[#0e1117] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="text-xs text-gray-400 truncate max-w-sm sm:max-w-md font-mono" title={url}>
                  {url}
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-gray-700"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الرابط' : 'Copy Link')}</span>
                  </button>

                  {onDownload && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsZoomed(false);
                        onDownload();
                      }}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.result.downloadNow}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
