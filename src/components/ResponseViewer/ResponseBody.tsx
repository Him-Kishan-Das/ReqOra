import React, { useState } from 'react';
import type { ApiResponse } from '../../types/api';
import { Search, Code, Eye, FileText } from 'lucide-react';

interface ResponseBodyProps {
  response: ApiResponse;
}

export const ResponseBody: React.FC<ResponseBodyProps> = ({ response }) => {
  const [viewMode, setViewMode] = useState<'pretty' | 'raw' | 'preview'>('pretty');
  const [searchTerm, setSearchTerm] = useState('');

  const renderFormattedJson = (data: any) => {
    if (typeof data !== 'object' || data === null) {
      return <span className="text-slate-200">{String(data)}</span>;
    }

    const jsonString = JSON.stringify(data, null, 2);
    
    const highlighted = jsonString.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );

    return (
      <pre
        className="font-mono text-xs leading-relaxed text-slate-200 select-text whitespace-pre-wrap break-all"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  };

  return (
    <div className="flex flex-col h-full bg-dark-950/80">
      <div className="flex items-center justify-between p-2 bg-dark-900 border-b border-dark-750">
        <div className="flex items-center space-x-1 bg-dark-850 p-1 rounded-lg border border-dark-750">
          <button
            onClick={() => setViewMode('pretty')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition ${
              viewMode === 'pretty'
                ? 'bg-brand-600/20 text-brand-cyan border border-brand-cyan/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Pretty</span>
          </button>

          <button
            onClick={() => setViewMode('raw')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition ${
              viewMode === 'raw'
                ? 'bg-brand-600/20 text-brand-cyan border border-brand-cyan/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Raw</span>
          </button>

          {response.contentType.includes('html') && (
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition ${
                viewMode === 'preview'
                  ? 'bg-brand-600/20 text-brand-cyan border border-brand-cyan/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          )}
        </div>

        {viewMode !== 'preview' && (
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              placeholder="Find in response..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-850 border border-dark-750 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-320px)] font-mono">
        {response.error && (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-sans space-y-2 mb-3">
            <div className="font-bold flex items-center space-x-2">
              <span>⚠️ Request Execution Failed</span>
            </div>
            <p>{response.rawText}</p>
            <p className="text-[11px] text-slate-400">
              Tip: If calling external APIs directly from the browser, make sure <strong>CORS Proxy: ON</strong> is enabled in the top header bar.
            </p>
          </div>
        )}

        {viewMode === 'pretty' && (
          typeof response.data === 'object' && response.data !== null ? (
            renderFormattedJson(response.data)
          ) : (
            <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap">
              {response.rawText}
            </pre>
          )
        )}

        {viewMode === 'raw' && (
          <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap select-text">
            {response.rawText}
          </pre>
        )}

        {viewMode === 'preview' && (
          <iframe
            srcDoc={response.rawText}
            title="Response Preview"
            className="w-full h-full bg-white rounded border border-dark-700 min-h-[300px]"
          />
        )}
      </div>
    </div>
  );
};
