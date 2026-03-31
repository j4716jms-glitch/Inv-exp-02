'use client';

import { useState } from 'react';
import { Save, User, Palette, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    userName: 'Arjun Sharma',
    companyName: 'StockSense Pro',
    primaryColor: '#fb6f18',
    logoPath: '',
    locale: 'en-IN',
    defaultPageSize: '25',
    theme: 'dark',
  });

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const save = () => {
    // In production, persist to localStorage or a DB
    localStorage.setItem('inv_settings', JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <main className="flex-1 p-4 sm:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-700 text-surface-50">Settings</h1>
        <p className="text-surface-400 text-sm mt-1">Customize your dashboard experience.</p>
      </div>

      <div className="space-y-5">
        {/* Identity */}
        <Section icon={<User size={16} />} title="Identity">
          <Field label="Your Name">
            <input className="inv-input w-full" value={form.userName} onChange={e => update('userName', e.target.value)} />
          </Field>
          <Field label="Company / Dashboard Name">
            <input className="inv-input w-full" value={form.companyName} onChange={e => update('companyName', e.target.value)} />
          </Field>
          <Field label="Logo Path (public/)" hint="e.g. /logo.svg — leave blank for text logo">
            <input className="inv-input w-full" placeholder="/logo.svg" value={form.logoPath} onChange={e => update('logoPath', e.target.value)} />
          </Field>
        </Section>

        {/* Appearance */}
        <Section icon={<Palette size={16} />} title="Appearance">
          <Field label="Primary Accent Color">
            <div className="flex gap-3 items-center">
              <input type="color" value={form.primaryColor} onChange={e => update('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-surface-700 bg-surface-800 cursor-pointer p-1" />
              <input className="inv-input flex-1" value={form.primaryColor} onChange={e => update('primaryColor', e.target.value)} />
            </div>
          </Field>
          <Field label="Theme">
            <select className="inv-input w-full" value={form.theme} onChange={e => update('theme', e.target.value)}>
              <option value="dark">Dark</option>
              <option value="light">Light (coming soon)</option>
            </select>
          </Field>
        </Section>

        {/* Data */}
        <Section icon={<RefreshCw size={16} />} title="Data & Display">
          <Field label="Locale / Numbering">
            <select className="inv-input w-full" value={form.locale} onChange={e => update('locale', e.target.value)}>
              <option value="en-IN">en-IN (Indian — ₹1,00,000)</option>
              <option value="en-US">en-US (US — $100,000)</option>
            </select>
          </Field>
          <Field label="Default Rows Per Page">
            <select className="inv-input w-full" value={form.defaultPageSize} onChange={e => update('defaultPageSize', e.target.value)}>
              {['10','25','50','100'].map(v => <option key={v} value={v}>{v} rows</option>)}
            </select>
          </Field>
        </Section>

        {/* Security */}
        <Section icon={<Shield size={16} />} title="Access Control">
          <div className="glass rounded-xl p-4 text-sm">
            <p className="text-surface-300 font-500 mb-1">Dashboard Password</p>
            <p className="text-surface-500 text-sm">
              Set the <code className="bg-surface-700 px-1.5 py-0.5 rounded text-surface-300">DASHBOARD_PASSWORD</code> environment
              variable in your Vercel project settings.
            </p>
            <a
              href="https://vercel.com/docs/projects/environment-variables"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 text-sm mt-2 inline-block underline underline-offset-2"
            >
              Vercel Environment Variables →
            </a>
          </div>
        </Section>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={save} className="btn-primary">
            {saved ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Settings</>}
          </button>
          {saved && <p className="text-green-400 text-sm animate-fadeIn">Settings saved to local storage.</p>}
        </div>
      </div>
    </main>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-surface-700/50">
        <span className="text-brand-400">{icon}</span>
        <h2 className="font-600 text-surface-200 text-sm">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-500 text-surface-300 mb-1.5 block">{label}</label>
      {hint && <p className="text-xs text-surface-600 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}
