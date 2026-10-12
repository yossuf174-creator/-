/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  RefreshCw, 
  X, 
  Check, 
  AlertTriangle, 
  Users, 
  User as UserIcon, 
  Film, 
  ExternalLink,
  ShieldCheck,
  LogOut,
  Building2,
  Sparkles
} from 'lucide-react';
import { 
  signInWithGoogleChat, 
  getChatAccessToken, 
  listChatSpaces, 
  createChatSpace, 
  listChatMessages, 
  sendChatMessage, 
  ChatSpace, 
  ChatMessage,
  clearChatAccessToken
} from '../lib/googleChat';
import { auth, User } from '../lib/firebase';
import { Language, Translations } from '../translations';
import { ToastType } from './Toast';

interface GoogleChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoToShare?: {
    title: string;
    url: string;
    platform: string;
    format: string;
  } | null;
  lang: Language;
  t: Translations;
  addToast: (title: string, message: string, type?: ToastType, duration?: number) => void;
}

export const GoogleChatModal: React.FC<GoogleChatModalProps> = ({
  isOpen,
  onClose,
  videoToShare,
  lang,
  t,
  addToast,
}) => {
  const isRtl = lang === 'ar';
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [hasChatToken, setHasChatToken] = useState<boolean>(() => !!getChatAccessToken());
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Spaces state
  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<ChatSpace | null>(null);

  // Messages in selected space
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // New message form
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Create new space form
  const [showCreateSpaceInput, setShowCreateSpaceInput] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

  // Mandatory Confirmation Dialog State (Workspace Integration Guidelines)
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    action: 'sendMessage' | 'createSpace';
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Refresh auth state
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      const token = getChatAccessToken();
      setHasChatToken(!!token);
    });
    return () => unsub();
  }, []);

  // Fetch spaces when modal opens and token is available
  useEffect(() => {
    if (isOpen && hasChatToken) {
      handleFetchSpaces();
    }
  }, [isOpen, hasChatToken]);

  // Fetch messages when a space is selected
  useEffect(() => {
    if (selectedSpace && hasChatToken) {
      handleFetchMessages(selectedSpace.name);
    }
  }, [selectedSpace, hasChatToken]);

  const handleFetchSpaces = async () => {
    const token = getChatAccessToken();
    if (!token) return;

    try {
      setIsLoadingSpaces(true);
      const fetched = await listChatSpaces(token);
      setSpaces(fetched);
      if (fetched.length > 0 && !selectedSpace) {
        setSelectedSpace(fetched[0]);
      }
    } catch (err: any) {
      console.error('Error fetching spaces:', err);
      if (err.message?.includes('401') || err.message?.includes('UNAUTHENTICATED')) {
        setHasChatToken(false);
        clearChatAccessToken();
      }
      addToast(
        t.chat.errorTitle,
        err.message || 'Failed to load Google Chat spaces',
        'error',
        4000
      );
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  const handleFetchMessages = async (spaceName: string) => {
    const token = getChatAccessToken();
    if (!token) return;

    try {
      setIsLoadingMessages(true);
      const msgs = await listChatMessages(token, spaceName);
      setMessages(msgs);
    } catch (err: any) {
      console.warn('Error fetching messages for space:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      const { user } = await signInWithGoogleChat();
      setCurrentUser(user);
      setHasChatToken(true);
      addToast(
        isRtl ? 'تم الاتصال بـ Google Chat' : 'Connected to Google Chat',
        isRtl ? 'تم تسجيل الدخول بنجاح وتفعيل مساحات العمل.' : 'Successfully authenticated with Google Chat scopes.',
        'success',
        3000
      );
      handleFetchSpaces();
    } catch (err: any) {
      addToast(
        t.chat.errorTitle,
        err.message || 'Sign in failed',
        'error',
        4000
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = () => {
    clearChatAccessToken();
    setHasChatToken(false);
    setSpaces([]);
    setSelectedSpace(null);
    setMessages([]);
    addToast(
      isRtl ? 'تم قطع الاتصال' : 'Disconnected',
      isRtl ? 'تم قطع الاتصال بـ Google Chat.' : 'Disconnected from Google Chat.',
      'info',
      2500
    );
  };

  // Step 1 of Send: Trigger Mandatory User Confirmation Dialog
  const promptSendMessageConfirmation = () => {
    if (!selectedSpace) {
      addToast(t.chat.errorTitle, t.chat.selectSpace, 'error', 3000);
      return;
    }

    const spaceLabel = selectedSpace.displayName || selectedSpace.name;
    const confirmDesc = t.chat.confirmSendDesc.replace('{spaceName}', spaceLabel);

    setPendingConfirmation({
      action: 'sendMessage',
      title: t.chat.confirmSendTitle,
      description: confirmDesc,
      onConfirm: executeSendMessage,
    });
  };

  // Step 2 of Send: Execute after user clicks confirm
  const executeSendMessage = async () => {
    const token = getChatAccessToken();
    if (!token || !selectedSpace) return;

    try {
      setIsSending(true);
      const defaultText = videoToShare 
        ? `${customNote ? `${customNote}\n\n` : ''}🎬 ${videoToShare.title}\n🔗 ${videoToShare.url}`
        : customNote;

      await sendChatMessage(token, selectedSpace.name, {
        text: defaultText,
        videoDetails: videoToShare || undefined,
      });

      addToast(t.chat.sentSuccessTitle, t.chat.sentSuccessDesc, 'success', 3500);
      setCustomNote('');
      // Refresh messages
      handleFetchMessages(selectedSpace.name);
    } catch (err: any) {
      addToast(t.chat.errorTitle, err.message || 'Failed to post message to Google Chat', 'error', 4500);
    } finally {
      setIsSending(false);
      setPendingConfirmation(null);
    }
  };

  // Step 1 of Create Space: Trigger Mandatory User Confirmation Dialog
  const promptCreateSpaceConfirmation = () => {
    const trimmed = newSpaceName.trim();
    if (!trimmed) return;

    const confirmDesc = t.chat.confirmCreateDesc.replace('{name}', trimmed);

    setPendingConfirmation({
      action: 'createSpace',
      title: t.chat.confirmCreateSpace,
      description: confirmDesc,
      onConfirm: executeCreateSpace,
    });
  };

  // Step 2 of Create Space: Execute after user clicks confirm
  const executeCreateSpace = async () => {
    const token = getChatAccessToken();
    const trimmed = newSpaceName.trim();
    if (!token || !trimmed) return;

    try {
      setIsCreatingSpace(true);
      const newSpace = await createChatSpace(token, trimmed);
      addToast(t.chat.createSuccessTitle, t.chat.createSuccessDesc, 'success', 3500);
      setNewSpaceName('');
      setShowCreateSpaceInput(false);
      // Add to list and select it
      setSpaces((prev) => [newSpace, ...prev]);
      setSelectedSpace(newSpace);
    } catch (err: any) {
      addToast(t.chat.errorTitle, err.message || 'Failed to create Google Chat space', 'error', 4500);
    } finally {
      setIsCreatingSpace(false);
      setPendingConfirmation(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-[#11141b] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between shrink-0 bg-[#0d0f14]/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {t.chat.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {t.chat.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t.chat.subtitle}
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

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            
            {/* If NOT Authenticated with Google Chat OAuth */}
            {!hasChatToken ? (
              <div className="p-6 text-center space-y-4 bg-gray-900/40 rounded-2xl border border-gray-800 my-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-base font-bold text-white">
                    {t.chat.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {t.chat.signInPrompt}
                  </p>
                </div>

                {/* Official Sign in with Google Button (Workspace Integration Spec) */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleSignIn}
                    disabled={isAuthenticating}
                    className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-800 font-semibold text-xs transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>{isAuthenticating ? 'Connecting...' : t.chat.signInButton}</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Authenticated Account Bar */}
                <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold shrink-0">
                      {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <UserIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="truncate">
                      <span className="text-gray-400 text-[10px] block">{t.chat.connectedAs}</span>
                      <span className="text-white font-semibold truncate">
                        {currentUser?.displayName || currentUser?.email || 'Google Chat User'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleFetchSpaces}
                      disabled={isLoadingSpaces}
                      className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer border border-gray-700/60"
                      title={t.chat.refreshSpaces}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSpaces ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="px-2 py-1 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-300 text-xs font-semibold transition-colors cursor-pointer border border-gray-700/60 flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>{t.chat.signOut}</span>
                    </button>
                  </div>
                </div>

                {/* Video Preview Card (if sharing a video) */}
                {videoToShare && (
                  <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Film className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {videoToShare.platform}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {videoToShare.format}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white truncate">
                        {videoToShare.title}
                      </p>
                    </div>
                  </div>
                )}

                {/* Spaces Selector & Management */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{t.chat.spacesTitle} ({spaces.length})</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowCreateSpaceInput(!showCreateSpaceInput)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.chat.createSpaceBtn}</span>
                    </button>
                  </div>

                  {/* Create New Space Collapsible Form */}
                  {showCreateSpaceInput && (
                    <div className="p-3 bg-gray-900/80 rounded-xl border border-emerald-500/30 space-y-2.5">
                      <span className="text-xs font-semibold text-emerald-300 block">
                        {t.chat.createSpaceTitle}
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSpaceName}
                          onChange={(e) => setNewSpaceName(e.target.value)}
                          placeholder={t.chat.spaceNamePlaceholder}
                          className="flex-1 bg-gray-950 border border-gray-700 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={promptCreateSpaceConfirmation}
                          disabled={!newSpaceName.trim() || isCreatingSpace}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isCreatingSpace ? '...' : t.chat.createSpaceBtn}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Spaces List Pills / Selector */}
                  {isLoadingSpaces ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-emerald-400" />
                      <span>{isRtl ? 'جاري تحميل المساحات...' : 'Loading spaces...'}</span>
                    </div>
                  ) : spaces.length === 0 ? (
                    <div className="p-4 text-center rounded-xl bg-gray-900/30 border border-gray-800 space-y-1">
                      <p className="text-xs font-semibold text-gray-300">{t.chat.noSpaces}</p>
                      <p className="text-[11px] text-gray-500">{t.chat.noSpacesDesc}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                      {spaces.map((sp) => {
                        const isSelected = selectedSpace?.name === sp.name;
                        return (
                          <button
                            key={sp.name}
                            type="button"
                            onClick={() => setSelectedSpace(sp)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md'
                                : 'bg-gray-900/40 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-xs block truncate">
                                {sp.displayName || sp.name.replace('spaces/', 'Space ')}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                {sp.spaceType === 'SPACE' ? t.chat.spaceTypeRoom : t.chat.spaceTypeDm}
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Message Composer & Send Section */}
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <label className="text-xs font-bold text-gray-300 block">
                    {t.chat.sendMessageTitle}
                  </label>
                  <textarea
                    rows={2}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder={t.chat.messagePlaceholder}
                    className="w-full bg-gray-950 border border-gray-700 focus:border-emerald-500 rounded-xl p-3 text-xs text-white placeholder-gray-500 outline-none resize-none transition-colors"
                  />

                  <button
                    type="button"
                    onClick={promptSendMessageConfirmation}
                    disabled={!selectedSpace || isSending}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/30 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSending ? t.chat.sending : t.chat.sendBtn}</span>
                  </button>
                </div>

                {/* Recent Messages in selected Space */}
                {selectedSpace && (
                  <div className="pt-2 border-t border-gray-800 space-y-2">
                    <span className="text-[11px] font-bold text-gray-400 block">
                      {t.chat.recentMessages} ({selectedSpace.displayName || selectedSpace.name})
                    </span>

                    {isLoadingMessages ? (
                      <div className="p-3 text-center text-xs text-gray-500">
                        <RefreshCw className="w-3 h-3 animate-spin mx-auto inline" />
                      </div>
                    ) : messages.length === 0 ? (
                      <p className="text-[11px] text-gray-500 italic p-2 bg-gray-950/40 rounded-lg">
                        {t.chat.noMessages}
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {messages.slice(0, 5).map((m) => (
                          <div key={m.name} className="p-2 rounded-lg bg-gray-950/50 border border-gray-800 text-xs">
                            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
                              <span className="font-semibold text-emerald-400">
                                {m.sender?.displayName || 'User'}
                              </span>
                              <span className="font-mono">
                                {m.createTime ? new Date(m.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p className="text-gray-200 line-clamp-2">{m.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-3.5 px-5 border-t border-gray-800 bg-[#0d0f14]/80 flex items-center justify-between text-xs text-gray-500 shrink-0">
            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Workspace OAuth (Protected)</span>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </motion.div>

        {/* MANDATORY USER CONFIRMATION DIALOG (Workspace Integration Compliance) */}
        {pendingConfirmation && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="bg-[#151922] border border-emerald-500/40 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {pendingConfirmation.title}
                  </h4>
                  <span className="text-[10px] text-amber-400 font-semibold block">
                    {isRtl ? 'إذن إجراء في Google Chat' : 'Permission Required for Google Chat'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                {pendingConfirmation.description}
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingConfirmation(null)}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t.chat.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => pendingConfirmation.onConfirm()}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-emerald-600/30"
                >
                  {t.chat.confirm}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
