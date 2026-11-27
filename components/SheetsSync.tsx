'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SyncResult {
  imported: number;
  skipped: number;
  errors: { lineNumber: number; message: string }[];
}

interface ExportResult {
  updated: number;
  message?: string;
}

export default function SheetsSync() {
  const router = useRouter();
  const [syncStatus, setSyncStatus]   = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [syncResult, setSyncResult]   = useState<SyncResult | null>(null);
  const [syncErr, setSyncErr]         = useState('');

  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [exportErr, setExportErr]       = useState('');

  async function sync() {
    setSyncStatus('loading');
    setSyncResult(null);
    setSyncErr('');
    try {
      const res  = await fetch('/api/admin/sync-sheets', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) { setSyncErr(data.error ?? 'Sync failed.'); setSyncStatus('error'); return; }
      setSyncResult(data);
      setSyncStatus('done');
      router.refresh();
    } catch {
      setSyncErr('Could not reach the server.');
      setSyncStatus('error');
    }
  }

  async function exportRsvps() {
    setExportStatus('loading');
    setExportResult(null);
    setExportErr('');
    try {
      const res  = await fetch('/api/admin/export-sheets', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) { setExportErr(data.error ?? 'Export failed.'); setExportStatus('error'); return; }
      setExportResult(data);
      setExportStatus('done');
    } catch {
      setExportErr('Could not reach the server.');
      setExportStatus('error');
    }
  }

  return (
    <div className="sheets-sync">
      <div className="sheets-sync__row">
        <button
          className="sheets-sync__btn"
          onClick={sync}
          disabled={syncStatus === 'loading'}
        >
          {syncStatus === 'loading' ? 'Syncing…' : '↻ Sync from Sheet'}
        </button>
        {syncStatus === 'done' && syncResult && (
          <span className="sheets-sync__ok">
            ✓ {syncResult.imported} imported{syncResult.skipped > 0 ? `, ${syncResult.skipped} skipped` : ''}
          </span>
        )}
        {syncStatus === 'error' && <span className="sheets-sync__err">{syncErr}</span>}
      </div>

      {syncStatus === 'done' && syncResult && syncResult.errors.length > 0 && (
        <ul className="sheets-sync__errors">
          {syncResult.errors.map((e) => (
            <li key={e.lineNumber}>Row {e.lineNumber}: {e.message}</li>
          ))}
        </ul>
      )}

      <div className="sheets-sync__row" style={{ marginTop: '0.5rem' }}>
        <button
          className="sheets-sync__btn sheets-sync__btn--export"
          onClick={exportRsvps}
          disabled={exportStatus === 'loading'}
        >
          {exportStatus === 'loading' ? 'Exporting…' : '↑ Export RSVPs to Sheet'}
        </button>
        {exportStatus === 'done' && exportResult && (
          <span className="sheets-sync__ok">
            ✓ {exportResult.message ?? `${exportResult.updated} guests updated`}
          </span>
        )}
        {exportStatus === 'error' && <span className="sheets-sync__err">{exportErr}</span>}
      </div>
    </div>
  );
}
