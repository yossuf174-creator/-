/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DownloadItemExport {
  id: string;
  name: string;
  platform: string;
  format: string;
  size: string;
  status: 'completed' | 'processing';
  progress?: number;
  url: string;
  downloadUrl?: string;
  createdAt?: number;
  exactTime?: string;
  exactDate?: string;
}

/**
 * Escapes a single CSV cell according to RFC 4180
 */
function escapeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Exports an array of download items to a downloadable CSV file.
 * Includes UTF-8 BOM (\uFEFF) to ensure Arabic text renders properly
 * in Microsoft Excel, Google Sheets, and Apple Numbers.
 */
export function exportDownloadsToCsv(
  items: DownloadItemExport[],
  lang: 'ar' | 'en' = 'ar',
  customFilename?: string
): boolean {
  if (!items || items.length === 0) return false;

  const isRtl = lang === 'ar';

  const headers = isRtl
    ? [
        'معرف التحميل',
        'اسم الفيديو',
        'المنصة',
        'الصيغة والجودة',
        'حجم الملف',
        'الحالة',
        'نسبة الإنجاز',
        'رابط المصدر',
        'رابط التحميل',
        'وقت التحميل',
        'تاريخ التحميل',
        'التاريخ الكامل (ISO)',
      ]
    : [
        'Download ID',
        'Video Name',
        'Platform',
        'Format & Quality',
        'File Size',
        'Status',
        'Progress',
        'Source URL',
        'Download URL',
        'Download Time',
        'Download Date',
        'Full ISO Timestamp',
      ];

  const rows = items.map((item) => {
    const statusLabel = isRtl
      ? item.status === 'completed'
        ? 'مكتمل'
        : 'قيد المعالجة'
      : item.status === 'completed'
      ? 'Completed'
      : 'Processing';

    return [
      escapeCsvCell(item.id),
      escapeCsvCell(item.name),
      escapeCsvCell(item.platform),
      escapeCsvCell(item.format),
      escapeCsvCell(item.size),
      escapeCsvCell(statusLabel),
      escapeCsvCell(item.progress !== undefined ? `${item.progress}%` : '100%'),
      escapeCsvCell(item.url),
      escapeCsvCell(item.downloadUrl || item.url),
      escapeCsvCell(item.exactTime || ''),
      escapeCsvCell(item.exactDate || ''),
      escapeCsvCell(item.createdAt ? new Date(item.createdAt).toISOString() : ''),
    ].join(',');
  });

  const headerLine = headers.map(escapeCsvCell).join(',');
  const csvContent = '\uFEFF' + [headerLine, ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = customFilename || `video-downloads-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
