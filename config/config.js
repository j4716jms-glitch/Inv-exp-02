// ============================================================
//  DASHBOARD CONFIGURATION
//  Edit this file to customize your dashboard experience.
// ============================================================

const dashboardConfig = {
  // ── Identity ────────────────────────────────────────────
  userName: 'Arjun Sharma',
  companyName: 'StockSense Pro',

  // ── Branding ────────────────────────────────────────────
  // Logo: Place your logo in /public/ and set the path here.
  // Set to null to use the text-based logo.
  logoPath: null, // e.g. '/logo.svg'

  // Primary accent color (Tailwind class suffix OR hex value).
  // Used for highlights, active states, and CTAs.
  primaryColor: '#fb6f18', // brand-500 orange

  // ── Currency & Locale ────────────────────────────────────
  currencySymbol: '₹',
  locale: 'en-IN', // Indian numbering system

  // ── Table Defaults ───────────────────────────────────────
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],

  // ── Columns to detect as price/money fields ──────────────
  // Any column header containing these keywords will be
  // formatted as currency.
  priceColumnKeywords: [
    'price', 'cost', 'amount', 'value', 'rate',
    'mrp', 'sp', 'cp', 'sale', 'purchase',
  ],

  // ── Columns to detect as stock/quantity fields ───────────
  stockColumnKeywords: [
    'stock', 'qty', 'quantity', 'units', 'count', 'inventory',
  ],

  // ── Category column keywords ─────────────────────────────
  categoryColumnKeywords: [
    'category', 'cat', 'type', 'group', 'department', 'section',
  ],

  // ── Theme ────────────────────────────────────────────────
  theme: 'dark', // 'dark' | 'light'
};

module.exports = dashboardConfig;
