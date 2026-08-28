import React, { useState } from 'react';
import { RequestBar } from './RequestBar';
import { ParamsEditor } from './ParamsEditor';
import { HeadersEditor } from './HeadersEditor';
import { AuthEditor } from './AuthEditor';
import { BodyEditor } from './BodyEditor';
import { useApi } from '../../context/ApiContext';
import { Sliders, Hash, ShieldCheck, FileCode } from 'lucide-react';

export const RequestPanel: React.FC = () => {
  const { activeTab } = useApi();
  const [activeSubTab, setActiveSubTab] = useState<'params' | 'headers' | 'body' | 'auth'>('params');

  if (!activeTab) return null;

  const { params, headers, auth, body } = activeTab.request;

  const activeParamsCount = params.filter((p) => p.enabled && p.key.trim()).length;
  const activeHeadersCount = headers.filter((h) => h.enabled && h.key.trim()).length;

  return (
    <div className="flex flex-col h-full bg-dark-900 border-b border-dark-750">
      {/* Request Bar (Method + URL + Send) */}
      <RequestBar />

      {/* Request Sub-Tabs Navigation */}
      <div className="flex items-center space-x-1 px-3 bg-dark-900 border-b border-dark-750 text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('params')}
          className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 transition ${
            activeSubTab === 'params'
              ? 'border-brand-500 text-brand-cyan font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Params</span>
          {activeParamsCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-brand-500/20 text-brand-cyan font-mono">
              {activeParamsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('headers')}
          className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 transition ${
            activeSubTab === 'headers'
              ? 'border-brand-500 text-brand-cyan font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Headers</span>
          {activeHeadersCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-brand-500/20 text-brand-cyan font-mono">
              {activeHeadersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('body')}
          className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 transition ${
            activeSubTab === 'body'
              ? 'border-brand-500 text-brand-cyan font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Body</span>
          {body.type !== 'none' && (
            <span className="px-1.5 py-0.2 text-[9px] uppercase rounded bg-brand-cyan/10 text-brand-cyan font-mono font-bold">
              {body.type}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('auth')}
          className={`flex items-center space-x-1.5 py-2 px-3 border-b-2 transition ${
            activeSubTab === 'auth'
              ? 'border-brand-500 text-brand-cyan font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Auth</span>
          {auth.type !== 'none' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          )}
        </button>
      </div>

      {/* Sub-Tab Content View */}
      <div className="flex-1 overflow-y-auto bg-dark-900/50">
        {activeSubTab === 'params' && <ParamsEditor />}
        {activeSubTab === 'headers' && <HeadersEditor />}
        {activeSubTab === 'body' && <BodyEditor />}
        {activeSubTab === 'auth' && <AuthEditor />}
      </div>
    </div>
  );
};
