'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Search, SlidersHorizontal, Download, ArrowUpDown,
  ArrowUp, ArrowDown, LayoutGrid, Table2, FolderOpen,
  TrendingUp, Package, AlertTriangle, Tag, ChevronDown,
  X, Filter
} from 'lucide-react';
import type { InventoryItem, UploadedFile } from '@/lib/types';
import { isPriceColumn, isStockColumn, formatINR, formatIndianNumber, itemsToCSV, downloadCSV } from '@/lib/ExcelParser';

interface InventoryDashboardProps {
  data: InventoryItem[];
  loading: boolean;
  activeFile: UploadedFile | null;
  onGoToFiles: () => void;
}

type SortDir = 'asc' | 'desc' | null;
interface SortState { col: string; dir: SortDir; }

const PAGE_SIZES = [10, 25, 50, 100];

export function InventoryDashboard({ data, loading, activeFile, onGoToFiles }: InventoryDashboardProps) {
  const [search, setSearch] = useState('');
  const [sortState, setSortState] = useState<SortState>({ col: '', dir: null });
  const [category, setCategory] = useState('');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showFilters, setShowFilters] = useState(false);

  // Derive columns from data (exclude internal _ fields)
  const columns = useMemo(() => {
    if (!data.length) return [];
    return Object.keys(data[0]).filter(c => !c.startsWith('_'));
  }, [data]);

  // Find key columns
  const priceCol = useMemo(() => columns.find(c => isPriceColumn(c)), [columns]);
  const stockCol = useMemo(() => columns.find(c => isStockColumn(c)), [columns]);
  const categoryCol = useMemo(() =>
    columns.find(c => ['category', 'cat', 'type', 'group', 'department'].some(k => c.toLowerCase().includes(k))),
    [columns]
  );
  const nameCol = useMemo(() =>
    columns.find(c => ['name', 'item', 'product', 'description', 'title'].some(k => c.toLowerCase().includes(k))),
    [columns]
  );

  // Category options
  const categories = useMemo(() => {
    if (!categoryCol) return [];
    const set = new Set(data.map(r => String(r[categoryCol] ?? '')).filter(Boolean));
    return Array.from(set).sort();
  }, [data, categoryCol]);

  // Filter + search + sort
  const filtered = useMemo(() => {
    let result = [...data];
    if (category && categoryCol)
      result = result.filter(r => String(r[categoryCol] ?? '') === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(r =>
        columns.some(c => String(r[c] ?? '').toLowerCase().includes(q))
      );
    }
    if (sortState.col && sortState.dir) {
      result.sort((a, b) => {
        const av = a[sortState.col], bv = b[sortState.col];
        const an = Number(av), bn = Number(bv);
        const isNum = !isNaN(an) && !isNaN(bn);
        let cmp = isNum ? an - bn : String(av ?? '').localeCompare(String(bv ?? ''));
        return sortState.dir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, category, sortState, columns, categoryCol]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = useCallback((col: string) => {
    setSortState(prev => {
      if (prev.col !== col) return { col, dir: 'asc' };
      if (prev.dir === 'asc') return { col, dir: 'desc' };
      return { col: '', dir: null };
    });
  }, []);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleCategory = (v: string) => { setCategory(v); setPage(1); };

  // Stats
  const stats = useMemo(() => {
    const total = data.length;
    const totalValue = priceCol
      ? data.reduce((s, r) => s + (Number(r[priceCol]) || 0), 0)
      : 0;
    const lowStock = stockCol
      ? data.filter(r => Number(r[stockCol] || 0) < 10).length
      : 0;
    const cats = categoryCol ? new Set(data.map(r => r[categoryCol])).size : 0;
    return { total, totalValue, lowStock, cats };
  }, [data, priceCol, stockCol, categoryCol]);

  const handleExport = () => {
    const csv = itemsToCSV(filtered, columns);
    const fname = activeFile
      ? `export_${activeFile.pathname.split('/').pop()?.replace(/\.[^.]+$/, '')}_${Date.now()}.csv`
      : `inventory_export_${Date.now()}.csv`;
    downloadCSV(csv, fname);
  };

  const formatCell = (col: string, val: string | number | null) => {
    if (val === null || val === undefined || val === '') return <span className="text-surface-600">—</span>;
    if (isPriceColumn(col)) return <span className="font-mono text-emerald-400">{formatINR(val)}</span>;
    if (isStockColumn(col)) {
      const n = Number(val);
      const color = n < 5 ? 'text-red-400' : n < 20 ? 'text-amber-400' : 'text-surface-200';
      return <span className={`font-mono ${color}`}>{formatIndianNumber(n)}</span>;
    }
    return <span>{String(val)}</span>;
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortState.col !== col) return <ArrowUpDown size={12} className="text-surface-600" />;
    if (sortState.dir === 'asc') return <ArrowUp size={12} className="text-brand-400" />;
    return <ArrowDown size={12} className="text-brand-400" />;
  };

  // ── Empty / Loading States ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl shimmer-bg" />)}
        </div>
        <div className="h-12 rounded-xl shimmer-bg" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <div key={i} className="h-12 rounded-lg shimmer-bg" />)}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center">
          <Package size={28} className="text-surface-500" />
        </div>
        <div className="text-center">
          <p className="text-surface-200 font-600 text-lg">No inventory data</p>
          <p className="text-surface-500 text-sm mt-1">Upload and load an Excel file to get started</p>
        </div>
        <button onClick={onGoToFiles} className="btn-primary mt-2">
          <FolderOpen size={16} /> Go to File Manager
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Stat Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Package size={18} />}
          label="Total Items"
          value={formatIndianNumber(stats.total)}
          color="#818cf8"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Total Value"
          value={formatINR(stats.totalValue)}
          color="#4ade80"
          small
        />
        <StatCard
          icon={<AlertTriangle size={18} />}
          label="Low Stock"
          value={formatIndianNumber(stats.lowStock)}
          color="#f87171"
          sub={stats.lowStock > 0 ? 'Needs reorder' : 'All good'}
        />
        <StatCard
          icon={<Tag size={18} />}
          label="Categories"
          value={formatIndianNumber(stats.cats || 0)}
          color="#fb6f18"
        />
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
          <input
            className="inv-input w-full pl-9"
            placeholder="Search across all columns…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category filter */}
        {categoryCol && (
          <div className="relative">
            <select
              className="inv-input pr-8 appearance-none cursor-pointer min-w-[160px]"
              value={category}
              onChange={e => handleCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`btn-secondary ${showFilters ? 'border-brand-500/40 text-brand-400' : ''}`}
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* View toggle */}
          <div className="flex rounded-lg overflow-hidden border border-surface-700">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 transition-colors ${viewMode === 'table' ? 'bg-surface-700 text-surface-100' : 'bg-surface-800 text-surface-500 hover:text-surface-300'}`}
              data-tooltip="Table view"
            >
              <Table2 size={15} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 transition-colors ${viewMode === 'cards' ? 'bg-surface-700 text-surface-100' : 'bg-surface-800 text-surface-500 hover:text-surface-300'}`}
              data-tooltip="Card view"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          <button onClick={handleExport} className="btn-primary whitespace-nowrap">
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Advanced filters panel */}
      {showFilters && (
        <div className="glass rounded-xl p-4 animate-slideIn">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-xs text-surface-500 mb-1.5 block">Rows per page</label>
              <select
                className="inv-input text-sm"
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                {PAGE_SIZES.map(s => <option key={s} value={s}>{s} rows</option>)}
              </select>
            </div>
            {sortState.col && (
              <div className="flex items-center gap-2 mt-5">
                <span className="text-xs text-surface-500">Sorted by:</span>
                <span className="badge badge-blue">{sortState.col} ({sortState.dir})</span>
                <button onClick={() => setSortState({ col: '', dir: null })} className="text-surface-500 hover:text-surface-300">
                  <X size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-surface-400">
          Showing <span className="text-surface-200 font-500">{paginated.length}</span> of{' '}
          <span className="text-surface-200 font-500">{filtered.length}</span> results
          {search && <span className="text-surface-500"> for "{search}"</span>}
        </span>
        {activeFile && (
          <span className="text-surface-600 text-xs truncate max-w-[200px]">
            📄 {activeFile.pathname.split('/').pop()?.replace(/^\d+_/, '')}
          </span>
        )}
      </div>

      {/* ── Table View ───────────────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="inv-table">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col} onClick={() => handleSort(col)} className="cursor-pointer select-none">
                      <div className="flex items-center gap-1.5 text-xs font-600 uppercase tracking-wider text-surface-400 hover:text-surface-200">
                        {col}
                        <SortIcon col={col} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12 text-surface-500">
                      No results match your filters
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, i) => (
                    <tr key={String(row._rowIndex ?? i)}>
                      {columns.map(col => (
                        <td key={col} className="text-sm text-surface-300">
                          {formatCell(col, row[col] as string | number | null)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Card View (Mobile-optimised vertical layout) ──────────────────── */}
      {viewMode === 'cards' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {paginated.length === 0 ? (
            <div className="col-span-full text-center py-12 text-surface-500">No results match your filters</div>
          ) : (
            paginated.map((row, i) => {
              const name = nameCol ? row[nameCol] : row[columns[0]];
              const price = priceCol ? row[priceCol] : null;
              const stock = stockCol ? row[stockCol] : null;
              const cat = categoryCol ? row[categoryCol] : null;
              const stockNum = Number(stock);
              const stockColor = stockNum < 5 ? '#f87171' : stockNum < 20 ? '#fbbf24' : '#4ade80';
              const maxStock = 100;
              const stockPct = Math.min((stockNum / maxStock) * 100, 100);

              return (
                <div key={String(row._rowIndex ?? i)} className="mobile-card animate-fadeIn">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-600 text-surface-100 truncate text-sm">{String(name ?? '—')}</p>
                      {cat && (
                        <span className="badge badge-blue mt-1">{String(cat)}</span>
                      )}
                    </div>
                    {price !== null && (
                      <span className="font-mono text-emerald-400 font-600 text-sm whitespace-nowrap">
                        {formatINR(price as number | string)}
                      </span>
                    )}
                  </div>

                  {/* Stock bar */}
                  {stock !== null && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-surface-500">Stock</span>
                        <span className="text-xs font-500" style={{ color: stockColor }}>
                          {formatIndianNumber(stock as number | string)}
                        </span>
                      </div>
                      <div className="stock-bar">
                        <div className="stock-fill" style={{ width: `${stockPct}%`, background: stockColor }} />
                      </div>
                    </div>
                  )}

                  {/* Other fields */}
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-surface-700">
                    {columns
                      .filter(c => c !== nameCol && c !== priceCol && c !== stockCol && c !== categoryCol)
                      .slice(0, 4)
                      .map(col => (
                        <div key={col} className="flex justify-between gap-2">
                          <span className="text-xs text-surface-500 truncate">{col}</span>
                          <span className="text-xs text-surface-300 text-right truncate max-w-[55%]">
                            {formatCell(col, row[col] as string | number | null)}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ←
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-500 transition-colors ${
                    page === p
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary px-3 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, color, sub, small = false
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  sub?: string;
  small?: boolean;
}) {
  return (
    <div className="glass rounded-xl p-4 flex items-start gap-3 hover:border-white/10 transition-colors">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-surface-400 text-xs font-500 uppercase tracking-wide">{label}</p>
        <p
          className={`font-display font-700 text-surface-50 mt-0.5 leading-tight ${small ? 'text-base' : 'text-xl'}`}
        >
          {value}
        </p>
        {sub && <p className="text-xs text-surface-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
