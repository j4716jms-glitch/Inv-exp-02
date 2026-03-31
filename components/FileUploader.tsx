'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload, FileSpreadsheet, Trash2, RefreshCw,
  CheckCircle2, AlertCircle, CloudUpload, Eye,
  HardDrive, Calendar, ChevronRight
} from 'lucide-react';
import type { UploadedFile } from '@/lib/types';

interface FileUploaderProps {
  activeFile: UploadedFile | null;
  onFileSelect: (file: UploadedFile) => void;
}

export function FileUploader({ activeFile, onFileSelect }: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      setError('Failed to load files.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const uploadFile = async (file: File) => {
    setError('');
    setSuccessMsg('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      setError('Only .xlsx, .xls, and .csv files are supported.');
      return;
    }
    setUploading(true);
    setUploadProgress(10);
    const fd = new FormData();
    fd.append('file', file);
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 15, 85));
      }, 200);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      clearInterval(progressInterval);
      setUploadProgress(100);
      const data = await res.json();
      if (!res.ok || !data.file) throw new Error(data.error || 'Upload failed');
      setSuccessMsg(`"${file.name}" uploaded successfully!`);
      await fetchFiles();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, []);

  const handleDelete = async (url: string) => {
    if (!confirm('Delete this file? This cannot be undone.')) return;
    setDeletingUrl(url);
    try {
      await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      setFiles(prev => prev.filter(f => f.url !== url));
    } catch {
      setError('Delete failed.');
    } finally {
      setDeletingUrl(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getFileName = (pathname: string) =>
    pathname.split('/').pop()?.replace(/^\d+_/, '') || pathname;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-700 text-surface-50">File Manager</h2>
        <p className="text-surface-400 text-sm mt-1">Upload Excel or CSV files to parse inventory data.</p>
      </div>

      {/* Drop Zone */}
      <div
        className={`drop-zone p-10 text-center ${dragOver ? 'drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ''; }}
        />
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${dragOver ? 'bg-brand-500 scale-110' : 'bg-surface-800'}`}>
            <CloudUpload size={26} className={dragOver ? 'text-white' : 'text-surface-400'} />
          </div>
          {uploading ? (
            <>
              <p className="text-surface-200 font-500">Uploading…</p>
              <div className="w-48 progress-bar mt-1">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-surface-500 text-sm">{uploadProgress}%</p>
            </>
          ) : (
            <>
              <p className="text-surface-200 font-500">
                {dragOver ? 'Drop to upload' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-surface-500 text-sm">Supports .xlsx, .xls, .csv · Max 50 MB</p>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 animate-slideIn">
          <AlertCircle size={15} />{error}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 animate-slideIn">
          <CheckCircle2 size={15} />{successMsg}
        </div>
      )}

      {/* File List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-600 text-surface-300 uppercase tracking-wider">Uploaded Files</h3>
          <button onClick={fetchFiles} className="text-surface-500 hover:text-surface-300 transition-colors" data-tooltip="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl shimmer-bg" />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="glass rounded-xl p-10 text-center">
            <HardDrive size={32} className="text-surface-600 mx-auto mb-3" />
            <p className="text-surface-400 font-500">No files uploaded yet</p>
            <p className="text-surface-600 text-sm mt-1">Upload your first Excel file above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map(file => {
              const name = getFileName(file.pathname);
              const isActive = activeFile?.url === file.url;
              const isDeleting = deletingUrl === file.url;
              return (
                <div
                  key={file.url}
                  className={`glass rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all ${isActive ? 'border-brand-500/40 bg-brand-500/5' : 'glass-hover'}`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-brand-500/20' : 'bg-surface-700'}`}>
                    <FileSpreadsheet size={17} className={isActive ? 'text-brand-400' : 'text-surface-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-500 truncate ${isActive ? 'text-brand-300' : 'text-surface-200'}`}>{name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-surface-500 text-xs flex items-center gap-1">
                        <HardDrive size={10} />{formatSize(file.size)}
                      </span>
                      <span className="text-surface-500 text-xs flex items-center gap-1">
                        <Calendar size={10} />{formatDate(file.uploadedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onFileSelect(file)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-500 transition-all ${
                        isActive
                          ? 'bg-brand-500 text-white'
                          : 'bg-surface-700 text-surface-300 hover:bg-surface-600'
                      }`}
                    >
                      <Eye size={12} />
                      {isActive ? 'Active' : 'Load'}
                    </button>
                    <button
                      onClick={() => handleDelete(file.url)}
                      disabled={isDeleting}
                      className="btn-danger py-1.5 px-2.5 text-xs"
                    >
                      {isDeleting
                        ? <RefreshCw size={12} className="animate-spin" />
                        : <Trash2 size={12} />
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
