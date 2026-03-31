'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Settings,
  Menu,
  X,
  Package2,
  ChevronRight,
  Bell,
  User,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/',        label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/',        label: 'Files',         icon: FolderOpen,    note: 'tab' },
  { href: '/settings', label: 'Settings',    icon: Settings },
];

const BOTTOM_ITEMS = [
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarWrapperProps {
  children: React.ReactNode;
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-60 fixed top-0 left-0 h-full z-30"
        style={{
          background: 'linear-gradient(180deg, #141923 0%, #0c1018 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <SidebarContent pathname={pathname} />
      </aside>

      {/* ── Mobile overlay ──────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ───────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 lg:hidden flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: '#141923',
          borderRight: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 text-surface-400 hover:text-surface-200"
        >
          <X size={20} />
        </button>
        <SidebarContent pathname={pathname} onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* ── Main content ────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-60 min-h-screen">
        {/* Top header bar */}
        <header
          className="sticky top-0 z-20 flex items-center gap-4 px-4 sm:px-6 h-14"
          style={{
            background: 'rgba(12,16,24,0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-surface-400 hover:text-surface-200 -ml-1"
          >
            <Menu size={22} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-surface-500">StockSense</span>
            <ChevronRight size={14} className="text-surface-700" />
            <span className="text-surface-200 font-medium">
              {pathname === '/' ? 'Dashboard' : pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2)}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors"
              data-tooltip="Notifications"
            >
              <Bell size={17} />
            </button>

            <div className="flex items-center gap-2.5 ml-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #fb6f18, #c43a0b)' }}
              >
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-surface-200 leading-none">Arjun Sharma</p>
                <p className="text-xs text-surface-500 mt-0.5">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        {children}
      </div>
    </div>
  );
}

// ── Inner sidebar content ───────────────────────────────────────────────────

function SidebarContent({
  pathname,
  onNavClick,
}: {
  pathname: string;
  onNavClick?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-white/5 shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #fb6f18, #c43a0b)' }}
        >
          <Package2 size={16} className="text-white" />
        </div>
        <div>
          <p className="font-display font-700 text-sm text-surface-50 leading-none">StockSense</p>
          <p className="text-[10px] text-surface-500 mt-0.5 uppercase tracking-widest">Pro</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-600 uppercase tracking-widest text-surface-600 px-3 pt-2 pb-2">
          Main
        </p>

        <Link
          href="/"
          onClick={onNavClick}
          className={`sidebar-item ${pathname === '/' ? 'active' : ''}`}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <Link
          href="/"
          onClick={onNavClick}
          className="sidebar-item"
        >
          <FolderOpen size={16} />
          File Manager
        </Link>

        <Link
          href="/"
          onClick={onNavClick}
          className="sidebar-item"
        >
          <BarChart3 size={16} />
          Analytics
          <span
            className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-600"
            style={{ background: 'rgba(251,111,24,0.15)', color: '#fb6f18' }}
          >
            Soon
          </span>
        </Link>

        <div className="pt-4">
          <p className="text-[10px] font-600 uppercase tracking-widest text-surface-600 px-3 pb-2">
            System
          </p>
          <Link
            href="/settings"
            onClick={onNavClick}
            className={`sidebar-item ${pathname === '/settings' ? 'active' : ''}`}
          >
            <Settings size={16} />
            Settings
          </Link>
        </div>
      </nav>

      {/* User badge at bottom */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #fb6f18, #c43a0b)' }}
          >
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-500 text-surface-200 leading-none truncate">Arjun Sharma</p>
            <p className="text-xs text-surface-500 mt-0.5">Administrator</p>
          </div>
          <User size={14} className="text-surface-600 shrink-0" />
        </div>
      </div>
    </>
  );
}
