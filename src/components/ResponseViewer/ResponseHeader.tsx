import React, { useState } from 'react';
import type { ApiResponse } from '../../types/api';
import { Clock, HardDrive, Copy, Check, Download, AlertCircle } from 'lucide-react';

interface ResponseHeaderProps {
  response: ApiResponse;
}

const getStatusBadge = (status: number) => {
  if (status >= 200 && status < 300) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }
  if (status >= 300 && status < 400) {
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  }
  if (status >= 400 && status < 500) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }
  if (status >= 500) {
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  }
  return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
};

export const ResponseHeader: React.FC<ResponseHeaderProps> = ({ response }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(response.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([response.rawText], { type: response.contentType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response-${Date.now()}.${response.contentType.includes('json') ? 'json' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="h-11 bg-dark-900 border-b border-dark-750 flex items-center justify-between px-4">
      <div className="flex items-center space-x-3">
        <div className={`px-2.5 py-1 rounded-md border font-mono text-xs font-bold flex items-center space-x-1.5 ${getStatusBadge(response.status)}`}>
          {response.status === 0 ? (
            <AlertCircle className="w-3.5 h-3.5" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-current" />
          )}
          <span>
            {response.status > 0 ? `${response.status} ${response.statusText}` : response.statusText}
          </span>
        </div>

        <div className="flex items-center space-x-1 text-slate-400 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{response.timeMs} ms</span>
        </div>

        <div className="flex items-center space-x-1 text-slate-400 text-xs font-mono">
          <HardDrive className="w-3.5 h-3.5 text-slate-500" />
          <span>{formatSize(response.sizeBytes)}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-750 border border-dark-700 text-xs text-slate-300 hover:text-white transition"
          title="Copy Response Body"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-750 border border-dark-700 text-xs text-slate-300 hover:text-white transition"
          title="Download Response File"
        >
          <Download className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
