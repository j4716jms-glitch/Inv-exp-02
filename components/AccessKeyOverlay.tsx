'use client';

import { useState, useRef, useEffect } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface AccessKeyOverlayProps {
  onAuthenticated: () => void;
}

export function AccessKeyOverlay({ onAuthenticated }: AccessKeyOverlayProps) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: key.trim() }),
      });
      const data = await res.json();

      if (data.ok) {
        onAuthenticated();
      } else {
        setError('Invalid access key. Please try again.');
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setKey('');
        inputRef.current?.focus();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(251,111,24,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(251,111,24,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(251,111,24,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Card */}
      <div
        className={`relative z-10 glass rounded-2xl p-8 w-full max-w-sm mx-4 transition-all duration-300 ${
          shake ? 'animate-[shake_0.4s_ease-in-out]' : ''
        }`}
        style={{
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #fb6f18, #ec510c)' }}
          >
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-700 text-surface-50">
            StockSense Pro
          </h1>
          <p className="text-surface-400 text-sm mt-1">
            Enter your access key to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(''); }}
              placeholder="Access key"
              className="inv-input w-full pr-11"
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
              tabIndex={-1}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm animate-slideIn">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !key.trim()}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ padding: '11px 18px' }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying…
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Unlock Dashboard
              </>
            )}
          </button>
        </form>

        {/* Dev note */}
        <p className="text-surface-600 text-xs text-center mt-6">
          Set{' '}
          <code className="bg-surface-800 px-1.5 py-0.5 rounded text-surface-400">
            DASHBOARD_PASSWORD
          </code>{' '}
          in Vercel env vars
        </p>
      </div>

      {/* Keyframe for shake */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-6px); }
          30%       { transform: translateX(6px); }
          45%       { transform: translateX(-4px); }
          60%       { transform: translateX(4px); }
          75%       { transform: translateX(-2px); }
          90%       { transform: translateX(2px); }
        }
      `}</style>
    </div>
  );
}
