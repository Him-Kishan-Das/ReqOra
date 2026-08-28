import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext';
import { ResponseHeader } from './ResponseHeader';
import { ResponseBody } from './ResponseBody';
import { ResponseHeadersView } from './ResponseHeadersView';
import { FileCode, Hash, Inbox } from 'lucide-react';

export const ResponsePanel: React.FC = () => {
  const { activeTab } = useApi();
  const [activeTabType, setActiveTabType] = useState<'body' | 'headers'>('body');

  if (!activeTab) return null;

  const { response, isLoading } = activeTab;

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-950 p-8 text-center space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <div className="text-xs font-semibold text-slate-300">Sending Request...</div>
        <p className="text-[11px] text-slate-500 font-mono">
          Waiting for response from {activeTab.request.url}
        </p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-dark-950/80 p-8 text-center space-y-3 select-none">
        <div className="w-14 h-14 rounded-2xl bg-dark-850 border border-dark-750 flex items-center justify-center text-slate-500 shadow-inner">
          <Inbox className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-200">No Response Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Click the <strong className="text-brand-cyan">Send</strong> button above or hit <kbd className="px-1.5 py-0.5 rounded bg-dark-800 text-[10px] font-mono border border-dark-700">Enter</kbd> to execute this HTTP request.
          </p>
        </div>
      </div>
    );
  }

  const headerCount = Object.keys(response.headers).length;

  return (
    <div className="flex flex-col h-full bg-dark-950 border-t border-dark-750">
      <ResponseHeader response={response} />

      <div className="flex items-center space-x-1 px-3 bg-dark-900 border-b border-dark-750 text-xs font-medium">
        <button
          onClick={() => setActiveTabType('body')}
          className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 transition ${
            activeTabType === 'body'
              ? 'border-brand-500 text-brand-cyan font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Body</span>
        </button>

        <button
          onClick={() => setActiveTabType('headers')}
          className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 transition ${
            activeTabType === 'headers'
              ? 'border-brand-500 text-brand-cyan font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Headers</span>
          {headerCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-brand-500/20 text-brand-cyan font-mono">
              {headerCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTabType === 'body' && <ResponseBody response={response} />}
        {activeTabType === 'headers' && <ResponseHeadersView response={response} />}
      </div>
    </div>
  );
};
