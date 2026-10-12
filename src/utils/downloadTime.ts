/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../translations';

export interface DownloadTimeEstimate {
  sizeMB: number;
  totalSeconds: number;
  remainingSeconds: number;
  formattedTotal: string;
  formattedRemaining: string;
  speedMBps: number;
  speedLabel: string;
}

/**
 * Parses file size string (e.g. "45.2 MB", "1.2 GB", "850 KB") into megabytes (MB)
 */
export function parseFileSizeToMB(sizeStr: string): number {
  if (!sizeStr) return 25.0;

  const clean = sizeStr.trim().toUpperCase();
  const match = clean.match(/([\d.]+)\s*(GB|MB|KB|G|M|K)?/i);

  if (!match) {
    return 25.0; // fallback standard estimate
  }

  const val = parseFloat(match[1]);
  if (isNaN(val)) return 25.0;

  const unit = (match[2] || 'MB').toUpperCase();

  if (unit.startsWith('G')) {
    return val * 1024;
  } else if (unit.startsWith('K')) {
    return val / 1024;
  }

  return val; // Default is MB
}

/**
 * Formats a duration in seconds into a friendly localized compact string
 */
export function formatEstimateDuration(seconds: number, lang: Language = 'ar'): string {
  if (seconds <= 0) {
    return lang === 'ar' ? 'أقل من ثانية' : '< 1s';
  }

  if (seconds < 60) {
    return lang === 'ar' ? `~${seconds} ث` : `~${seconds}s`;
  }

  const mins = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;

  if (seconds < 3600) {
    if (lang === 'ar') {
      return remainingSecs > 0 ? `~${mins} د ${remainingSecs} ث` : `~${mins} د`;
    }
    return remainingSecs > 0 ? `~${mins}m ${remainingSecs}s` : `~${mins}m`;
  }

  const hours = Math.floor(seconds / 3600);
  const remainingMins = Math.floor((seconds % 3600) / 60);

  if (lang === 'ar') {
    return remainingMins > 0 ? `~${hours} س ${remainingMins} د` : `~${hours} س`;
  }
  return remainingMins > 0 ? `~${hours}h ${remainingMins}m` : `~${hours}h`;
}

/**
 * Helper function that estimates the download time based on file size and a mock download speed (default 5MB/s).
 *
 * @param fileSizeStr - String representation of file size (e.g. "45.2 MB")
 * @param mockSpeedMBps - Mock download speed in MB/s (default 5 MB/s)
 * @param progressPercent - Optional current progress (0-100) to compute remaining time
 * @param lang - Target language ('ar' or 'en')
 */
export function estimateDownloadTime(
  fileSizeStr: string,
  mockSpeedMBps: number = 5,
  progressPercent: number = 0,
  lang: Language = 'ar'
): DownloadTimeEstimate {
  const effectiveSpeed = mockSpeedMBps > 0 ? mockSpeedMBps : 5;
  const sizeMB = parseFileSizeToMB(fileSizeStr);

  const totalSeconds = Math.max(1, Math.round(sizeMB / effectiveSpeed));

  // Calculate remaining portion based on progress percent
  const clampedProgress = Math.min(100, Math.max(0, progressPercent));
  const remainingFraction = Math.max(0, 1 - clampedProgress / 100);
  const remainingMB = sizeMB * remainingFraction;
  const remainingSeconds = clampedProgress >= 100 
    ? 0 
    : Math.max(1, Math.round(remainingMB / effectiveSpeed));

  return {
    sizeMB,
    totalSeconds,
    remainingSeconds,
    formattedTotal: formatEstimateDuration(totalSeconds, lang),
    formattedRemaining: formatEstimateDuration(remainingSeconds, lang),
    speedMBps: effectiveSpeed,
    speedLabel: `${effectiveSpeed} MB/s`,
  };
}
