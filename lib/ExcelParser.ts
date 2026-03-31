/**
 * ExcelParser.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Utility to fetch a Blob URL and parse multi-sheet Excel/CSV files.
 * Merges all sheets into a unified JSON array, tagging each row with its
 * originating sheet name for downstream filtering.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as XLSX from 'xlsx';
import type { InventoryItem, ParsedSheet } from './types';

// ── Config keywords (mirrors config/config.js for server-side use) ────────────
const PRICE_KEYWORDS  = ['price', 'cost', 'amount', 'value', 'rate', 'mrp', 'sp', 'cp'];
const STOCK_KEYWORDS  = ['stock', 'qty', 'quantity', 'units', 'count', 'inventory'];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Normalize a column header to lowercase, trimmed string. */
function norm(key: string): string {
  return String(key).toLowerCase().trim();
}

/** Detect if a header looks like a price column. */
export function isPriceColumn(header: string): boolean {
  const n = norm(header);
  return PRICE_KEYWORDS.some((kw) => n.includes(kw));
}

/** Detect if a header looks like a stock/quantity column. */
export function isStockColumn(header: string): boolean {
  const n = norm(header);
  return STOCK_KEYWORDS.some((kw) => n.includes(kw));
}

/** Format a number in Indian locale with ₹ symbol. */
export function formatINR(value: number | string | null): string {
  const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(num);
}

/** Format a plain number in Indian system (no currency symbol). */
export function formatIndianNumber(value: number | string | null): string {
  const num = typeof value === 'string' ? parseFloat(String(value)) : (value ?? 0);
  if (isNaN(num)) return String(value ?? '—');
  return new Intl.NumberFormat('en-IN').format(num);
}

// ── Core Parser ───────────────────────────────────────────────────────────────

/**
 * Given a Blob URL (or any URL to an .xlsx / .csv file), fetches the file,
 * parses every sheet, and returns:
 *   - sheets[]  → per-sheet arrays
 *   - unified[] → all rows merged, each tagged with `_sheet` and `_rowIndex`
 */
export async function parseExcelFromUrl(url: string): Promise<{
  sheets: ParsedSheet[];
  unified: InventoryItem[];
  columns: string[];
}> {
  // 1. Fetch the file as ArrayBuffer
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`);
  }
  const buffer = await res.arrayBuffer();

  // 2. Read workbook
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    cellNF: false,
    cellText: false,
  });

  const sheets: ParsedSheet[] = [];
  const unifiedRows: InventoryItem[] = [];
  const columnSet = new Set<string>();
  let globalIndex = 0;

  // 3. Iterate over all sheets
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON — first row = headers
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      {
        defval: null,
        blankrows: false,
        raw: false, // use formatted strings so dates look readable
      }
    );

    if (rawRows.length === 0) continue;

    // Collect columns
    Object.keys(rawRows[0] || {}).forEach((k) => columnSet.add(k));

    // Normalise rows
    const rows: InventoryItem[] = rawRows.map((row) => {
      const normalised: InventoryItem = {};
      for (const [key, val] of Object.entries(row)) {
        normalised[key] = val === undefined || val === '' ? null : (val as string | number | null);
      }
      // Internal meta fields (prefixed _) so UI can hide them if needed
      normalised['_sheet'] = sheetName;
      normalised['_rowIndex'] = globalIndex++;
      return normalised;
    });

    sheets.push({ sheetName, rows });
    unifiedRows.push(...rows);
  }

  // 4. Build final column list (exclude meta _ fields from display columns)
  const displayColumns = Array.from(columnSet).filter((c) => !c.startsWith('_'));

  return {
    sheets,
    unified: unifiedRows,
    columns: displayColumns,
  };
}

// ── CSV Export ────────────────────────────────────────────────────────────────

/**
 * Convert a filtered InventoryItem[] array to a downloadable CSV string.
 */
export function itemsToCSV(items: InventoryItem[], columns: string[]): string {
  if (items.length === 0) return '';

  const header = columns.map((c) => `"${c}"`).join(',');
  const rows = items.map((item) =>
    columns
      .map((col) => {
        const val = item[col];
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
}

/** Trigger browser download of a CSV string. */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
