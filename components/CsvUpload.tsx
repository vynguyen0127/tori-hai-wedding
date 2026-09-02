'use client';

import { useRef, useState } from 'react';
import type { ImportCsvResponse } from '@/app/api/admin/import-csv/route';

type Status = 'idle' | 'uploading' | 'success' | 'error';

export default function CsvUpload() {
  const inputRef              = useRef<HTMLInputElement>(null);
  const [status, setStatus]   = useState<Status>('idle');
  const [result, setResult]   = useState<ImportCsvResponse | null>(null);

  async function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setStatus('error');
      setResult({ imported: 0, errors: [{ lineNumber: 0, message: 'File must be a .csv' }] });
      return;
    }

    setStatus('uploading');
    setResult(null);

    const body = new FormData();
    body.append('file', file);

    try {
      const res  = await fetch('/api/admin/import-csv', { method: 'POST', body });
      const data: ImportCsvResponse = await res.json();
      setResult(data);
      setStatus(data.errors.length > 0 ? 'error' : 'success');
      // Refresh the page so the guest table reflects the new data
      if (data.errors.length === 0) setTimeout(() => window.location.reload(), 1500);
    } catch {
      setStatus('error');
      setResult({ imported: 0, errors: [{ lineNumber: 0, message: 'Upload failed. Check your connection.' }] });
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // reset so the same file can be re-uploaded
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="csv-upload">
      <div
        className={`csv-upload__dropzone${status === 'uploading' ? ' csv-upload__dropzone--loading' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="csv-upload__input"
          onChange={onChange}
        />
        {status === 'uploading' ? (
          <p className="csv-upload__hint">Importing…</p>
        ) : (
          <>
            <p className="csv-upload__label">Drop a CSV here or <span>browse</span></p>
            <p className="csv-upload__hint">Must match the template column layout</p>
          </>
        )}
      </div>

      {status === 'success' && result && (
        <div className="csv-upload__result csv-upload__result--success">
          ✓ {result.imported} guest{result.imported !== 1 ? 's' : ''} imported — refreshing…
        </div>
      )}

      {status === 'error' && result && result.errors.length > 0 && (
        <div className="csv-upload__result csv-upload__result--error">
          <strong>Import failed — fix these errors and re-upload:</strong>
          <ul>
            {result.errors.map((e, i) => (
              <li key={i}>{e.lineNumber > 0 ? `Line ${e.lineNumber}: ` : ''}{e.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
