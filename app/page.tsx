'use client';

import { useState, useEffect } from 'react';
import { AccessKeyOverlay } from '@/components/AccessKeyOverlay';
import { FileUploader } from '@/components/FileUploader';
import { InventoryDashboard } from '@/components/InventoryDashboard';
import type { UploadedFile, InventoryItem } from '@/lib/types';

export default function HomePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeFile, setActiveFile] = useState<UploadedFile | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'files'>('dashboard');

  useEffect(() => {
    // Check if already authenticated in this session
    const isAuth = sessionStorage.getItem('inv_auth') === '1';
    setAuthenticated(isAuth);
    setCheckingAuth(false);
  }, []);

  const handleAuth = () => {
    sessionStorage.setItem('inv_auth', '1');
    setAuthenticated(true);
  };

  const handleFileSelect = async (file: UploadedFile) => {
    setActiveFile(file);
    setLoadingData(true);
    try {
      const res = await fetch(`/api/parse?url=${encodeURIComponent(file.url)}`);
      const json = await res.json();
      if (json.data) {
        setInventoryData(json.data);
        setActiveTab('dashboard');
      }
    } catch (e) {
      console.error('Failed to parse file', e);
    } finally {
      setLoadingData(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-surface-700 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return <AccessKeyOverlay onAuthenticated={handleAuth} />;
  }

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Tab switcher */}
      <div className="border-b border-surface-800 bg-surface-900/50 px-4 sm:px-6">
        <div className="flex gap-1 pt-3">
          {(['dashboard', 'files'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-surface-800 text-surface-100 border border-b-surface-800 border-surface-700 -mb-px relative z-10'
                  : 'text-surface-400 hover:text-surface-200'
              }`}
            >
              {tab === 'dashboard' ? '📊 Dashboard' : '📁 File Manager'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 animate-fadeIn">
        {activeTab === 'files' && (
          <FileUploader
            activeFile={activeFile}
            onFileSelect={handleFileSelect}
          />
        )}

        {activeTab === 'dashboard' && (
          <InventoryDashboard
            data={inventoryData}
            loading={loadingData}
            activeFile={activeFile}
            onGoToFiles={() => setActiveTab('files')}
          />
        )}
      </div>
    </main>
  );
}
