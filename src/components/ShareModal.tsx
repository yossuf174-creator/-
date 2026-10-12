import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  Sparkles, 
  Film, 
  Send,
  MessageCircle,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { ToastType } from './Toast';
import { Language } from '../translations';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoData: {
    title: string;
    url: string;
    platform: string;
    format: string;
  };
  lang: Language;
  addToast: (title: string, message: string, type?: ToastType, duration?: number) => void;
  onOpenGoogleChat?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  videoData,
  lang,
  addToast,
  onOpenGoogleChat
}) => {
  const [copiedPromo, setCopiedPromo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const isRtl = lang === 'ar';

  const appUrl = 'https://videobot.pro';

  const promoHeadline = isRtl
    ? `🎬 شاهد وحمّل "${videoData.title}" بدقة فائقة عبر VideoBot Pro ⚡`
    : `🎬 Watch & download "${videoData.title}" in HD via VideoBot Pro ⚡`;

  const promoBody = isRtl
    ? `أسرع وأسهل أداة لتحميل الفيديوهات من أكثر من 1000 منصة بدقة 4K وصوت نقي مجاناً وبدون إعلانات!\nجرب الأداة الآن: ${appUrl}\nرابط الفيديو: ${videoData.url}`
    : `The fastest and easiest tool to download videos from 1000+ platforms in 4K with crystal-clear audio!\nTry it now: ${appUrl}\nVideo Link: ${videoData.url}`;

  const fullPromoText = `${promoHeadline}\n\n${promoBody}`;

  const handleCopyFullPromo = () => {
    navigator.clipboard.writeText(fullPromoText).then(() => {
      setCopiedPromo(true);
      addToast(
        isRtl ? 'تم نسخ النص الترويجي' : 'Promotional Text Copied',
        isRtl ? 'تم نسخ النص الترويجي ورابط الفيديو إلى الحافظة بنجاح.' : 'Promotional text and video link copied to clipboard.',
        'success',
        3000
      );
      setTimeout(() => setCopiedPromo(false), 2500);
    });
  };

  const handleCopyLinkOnly = () => {
    navigator.clipboard.writeText(videoData.url).then(() => {
      setCopiedLink(true);
      addToast(
        isRtl ? 'تم نسخ الرابط' : 'Link Copied',
        isRtl ? 'تم نسخ رابط الفيديو إلى الحافظة بنجاح.' : 'Video link copied to clipboard.',
        'info',
        2500
      );
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `VideoBot Pro - ${videoData.title}`,
          text: fullPromoText,
          url: videoData.url || appUrl,
        });
        addToast(
          isRtl ? 'تمت المشاركة بنجاح' : 'Shared Successfully',
          isRtl ? 'تمت مشاركة الفيديو والتطبيق بنجاح.' : 'Video shared successfully.',
          'success',
          2500
        );
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyFullPromo();
        }
      }
    } else {
      handleCopyFullPromo();
    }
  };

  const shareToPlatform = (platform: 'whatsapp' | 'telegram' | 'twitter' | 'facebook' | 'linkedin') => {
    const encodedText = encodeURIComponent(fullPromoText);
    const encodedUrl = encodeURIComponent(videoData.url);
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(promoHeadline)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(promoHeadline + '\n' + appUrl)}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent(promoHeadline)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      addToast(
        isRtl ? 'فتح نافذة المشاركة' : 'Opening Share Window',
        isRtl ? `جاري فتح المشاركة عبر ${platform}...` : `Opening share on ${platform}...`,
        'info',
        2000
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md" dir={isRtl ? 'rtl' : 'ltr'}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-[#11141b] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Share2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isRtl ? 'مشاركة الفيديو والتطبيق' : 'Share Video & App'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {isRtl 
                      ? 'شارك الفيديو مباشرة مع أصدقائك عبر المنصات مع نص ترويجي للتطبيق' 
                      : 'Share video directly with friends on social media with promotional text'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Video Info Preview Box */}
              <div className="p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="px-2 py-0.2 rounded text-[9px] font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/30">
                      {videoData.platform}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {videoData.format}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white truncate" title={videoData.title}>
                    {videoData.title}
                  </p>
                </div>
              </div>

              {/* Promotional Message Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-[#131722] to-indigo-950/20 border border-indigo-500/30 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isRtl ? 'النص الترويجي الجذاب جاهز للمشاركة:' : 'Attractive Promotional Message:'}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {isRtl ? 'مميز' : 'PRO'}
                  </span>
                </div>
                <div className="bg-[#0b0d13] p-3 rounded-lg border border-gray-800 text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-line select-text">
                  {fullPromoText}
                </div>
                
                <button
                  type="button"
                  onClick={handleCopyFullPromo}
                  className="mt-3 w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  {copiedPromo ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{isRtl ? 'تم نسخ النص كاملاً مع الرابط!' : 'Full Promo Text Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{isRtl ? 'نسخ النص الترويجي كاملاً للمشاركة' : 'Copy Full Promo Text & Link'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* One-Click Social Platforms */}
              <div>
                <p className="text-xs font-bold text-gray-400 mb-2.5">
                  {isRtl ? 'مشاركة مباشرة بنقرة واحدة عبر منصات التواصل:' : 'Direct 1-Click Social Sharing:'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {/* Google Chat */}
                  {onOpenGoogleChat && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenGoogleChat();
                      }}
                      className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-500/70 text-emerald-300 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm group"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <MessageSquare className="w-3.5 h-3.5 fill-white" />
                      </div>
                      <span>Google Chat</span>
                    </button>
                  )}

                  {/* WhatsApp */}
                  <button
                    type="button"
                    onClick={() => shareToPlatform('whatsapp')}
                    className="p-2.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0">
                      <MessageCircle className="w-3.5 h-3.5 fill-black" />
                    </div>
                    <span>واتساب (WhatsApp)</span>
                  </button>

                  {/* Telegram */}
                  <button
                    type="button"
                    onClick={() => shareToPlatform('telegram')}
                    className="p-2.5 rounded-xl bg-sky-950/30 hover:bg-sky-900/50 border border-sky-500/30 hover:border-sky-500/60 text-sky-300 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
                      <Send className="w-3 h-3 fill-white" />
                    </div>
                    <span>تيليجرام (Telegram)</span>
                  </button>

                  {/* Twitter / X */}
                  <button
                    type="button"
                    onClick={() => shareToPlatform('twitter')}
                    className="p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 text-gray-200 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-6 h-6 rounded-full bg-black border border-gray-700 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                      𝕏
                    </div>
                    <span>تويتر (X)</span>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={() => shareToPlatform('facebook')}
                    className="p-2.5 rounded-xl bg-blue-950/30 hover:bg-blue-900/50 border border-blue-500/30 hover:border-blue-500/60 text-blue-300 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                      f
                    </div>
                    <span>فيسبوك (Facebook)</span>
                  </button>

                  {/* LinkedIn */}
                  <button
                    type="button"
                    onClick={() => shareToPlatform('linkedin')}
                    className="p-2.5 rounded-xl bg-[#0a66c2]/15 hover:bg-[#0a66c2]/30 border border-[#0a66c2]/40 text-[#70b5f9] flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#0a66c2] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                      in
                    </div>
                    <span>لينكد إن (LinkedIn)</span>
                  </button>

                  {/* Native Device Share */}
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="p-2.5 rounded-xl bg-indigo-950/30 hover:bg-indigo-900/50 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <span>{isRtl ? 'مشاركة عبر الهاتف' : 'Device Share'}</span>
                  </button>
                </div>
              </div>

              {/* Secondary Options */}
              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCopyLinkOnly}
                  className="flex-1 py-2 px-3 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isRtl ? 'نسخ رابط الفيديو فقط' : 'Copy Video Link Only'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isRtl ? 'تم' : 'Done'}
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
