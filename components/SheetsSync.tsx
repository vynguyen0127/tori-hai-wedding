'use client';

import { useState } from 'react';

interface SyncResult {
  imported: number;
  skipped: number;
  errors: { lineNumber: number; message: string }[];
}

export default function SheetsSync() {
  const [status, setStatus]   = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
  const [result, setResult]   = useState<SyncResult | null>(null);
  const [errMsg, setErrMsg]   = useState('');

  async function sync() {
    setStatus('syncing');
    setResult(null);
    setErrMsg('');
    try {
      const res  = await fetch('/api/admin/sync-sheets', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setErrMsg(data.error ?? 'Sync failed.');
        setStatus('error');
        return;
      }
      setResult(data);
      setStatus('done');
    } catch {
      setErrMsg('Could not reach the server.');
      setStatus('error');
    }
  }

  return (
    <div className="sheets-sync">
      <div className="sheets-sync__row">
        <button
          className="sheets-sync__btn"
          onClick={sync}
          disabled={status === 'syncing'}
        >
          {status === 'syncing' ? 'Syncing…' : '↻ Sync from Google Sheet'}
        </button>
        {status === 'done' && result && (
          <span className="sheets-sync__ok">
            ✓ {result.imported} imported{result.skipped > 0 ? `, ${result.skipped} skipped` : ''}
          </span>
        )}
        {status === 'error' && (
          <span className="sheets-sync__err">{errMsg}</span>
        )}
      </div>
      {status === 'done' && result && result.errors.length > 0 && (
        <ul className="sheets-sync__errors">
          {result.errors.map((e) => (
            <li key={e.lineNumber}>Row {e.lineNumber}: {e.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
