/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  RefreshCw, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Database,
  ExternalLink
} from 'lucide-react';
import { SyncState } from '../lib/useFirestoreSync';
import { Language, Translations } from '../translations';

interface CloudSyncBadgeProps {
  syncState: SyncState;
  lang: Language;
  t: Translations;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
}

export const CloudSyncBadge: React.FC<CloudSyncBadgeProps> = ({
  syncState,
  lang,
  t,
  onGoogleSignIn,
  onSignOut,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isRtl = lang === 'ar';
  const { user, isConnected, isSyncing, lastSyncedAt } = syncState;

  return (
    <div className="relative" dir={isRtl ? 'rtl' : 'ltr'}>
      <button
        type="button"
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border border-gray-700/60 text-xs font-semibold cursor-pointer"
        title={t.firebase.cloudSync}
      >
        {isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
        ) : isConnected ? (
          <Cloud className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Cloud className="w-3.5 h-3.5 text-gray-500" />
        )}
        <span className="hidden md:inline text-[11px]">
          {isSyncing ? t.firebase.cloudConnecting : isConnected ? t.firebase.cloudConnected.split(' ')[0] : 'Cloud'}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
      </button>

      {/* Cloud Account & Firestore Popover */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className={`absolute top-full mt-2 ${isRtl ? 'left-0' : 'right-0'} z-50 w-72 bg-[#11141b] border border-gray-800 rounded-xl shadow-2xl p-4 text-xs text-gray-200 flex flex-col gap-3 backdrop-blur-md`}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">{t.firebase.cloudSync}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Firestore
              </span>
            </div>

            {/* Account Info */}
            <div className="p-2.5 bg-gray-900/80 rounded-lg border border-gray-800/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white truncate text-[11px]">
                  {user?.displayName || (user?.isAnonymous ? t.firebase.guestUser : 'User')}
                </div>
                <div className="text-[10px] text-gray-400 font-mono truncate">
                  UID: {user?.uid.slice(0, 10)}...
                </div>
              </div>
            </div>

            {/* Status Details */}
            <div className="space-y-1.5 text-[11px] text-gray-400">
              <div className="flex items-center justify-between">
                <span>{t.firebase.cloudSaved}</span>
                <span className="text-emerald-400 font-bold">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{isRtl ? 'آخر مزامنة:' : 'Last Synced:'}</span>
                <span className="text-gray-300 font-mono text-[10px]">
                  {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : t.firebase.syncedJustNow}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-800 pt-2.5 flex flex-col gap-2">
              {user?.isAnonymous ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onGoogleSignIn();
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{t.firebase.signInGoogle}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onSignOut();
                  }}
                  className="w-full py-1.5 px-3 rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-300 hover:text-red-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-gray-700/60"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>{t.firebase.signOut}</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
