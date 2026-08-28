import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import {
  Globe,
  Plus,
  Terminal,
  Code2,
  SlidersHorizontal,
  FolderPlus,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import EnvironmentModal from './Modals/EnvironmentModal';
import ImportCurlModal from './Modals/ImportCurlModal';
import CodeSnippetModal from './Modals/CodeSnippetModal';

export const Header: React.FC = () => {
  const {
    environments,
    activeEnvironment,
    setActiveEnvironment,
    addTab,
    createCollection,
    activeTab,
    useProxy,
    setUseProxy,
  } = useApi();

  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  return (
    <header className="h-14 bg-dark-900 border-b border-dark-750 flex items-center justify-between px-4 z-20">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-cyan text-white shadow-lg shadow-brand-500/20">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-brand-cyan bg-clip-text text-transparent">
              ReqOra
            </span>
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-cyan border border-brand-cyan/20">
              Studio v1.0
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Full-Stack REST & GraphQL Client</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* CORS Proxy Toggle Button */}
        <button
          onClick={() => setUseProxy(!useProxy)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
            useProxy
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-sm'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
          title={
            useProxy
              ? 'CORS Proxy Active: Requests are proxied via Node dev server to bypass browser CORS blocks'
              : 'Direct Browser Fetch: Requests may fail if target server blocks CORS'
          }
        >
          {useProxy ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          )}
          <span>{useProxy ? 'CORS Proxy: ON' : 'Direct Fetch (No Proxy)'}</span>
        </button>

        <div className="h-5 w-px bg-dark-750" />

        <button
          onClick={() => addTab()}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Tab</span>
        </button>

        <button
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-300 hover:text-white text-xs font-medium transition"
        >
          <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Import cURL</span>
        </button>

        <button
          onClick={() => setIsCodeModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-300 hover:text-white text-xs font-medium transition"
        >
          <Code2 className="w-3.5 h-3.5 text-brand-500" />
          <span>Code Snippets</span>
        </button>

        <button
          onClick={() => {
            const name = prompt('Enter new Collection name:', 'My API Collection');
            if (name) createCollection(name);
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-300 hover:text-white text-xs font-medium transition"
        >
          <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
          <span>New Collection</span>
        </button>

        <div className="h-5 w-px bg-dark-750" />

        <div className="flex items-center space-x-2 bg-dark-850 p-1 rounded-lg border border-dark-750">
          <Globe className="w-4 h-4 text-slate-400 ml-1.5" />
          <select
            value={activeEnvironment?.id || 'none'}
            onChange={(e) => setActiveEnvironment(e.target.value)}
            className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-2"
          >
            <option value="none" className="bg-dark-900 text-slate-400">No Environment</option>
            {environments.map((env) => (
              <option key={env.id} value={env.id} className="bg-dark-900 text-slate-200">
                {env.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsEnvModalOpen(true)}
            className="p-1 rounded hover:bg-dark-750 text-slate-400 hover:text-slate-200 transition"
            title="Manage Environments"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isEnvModalOpen && <EnvironmentModal onClose={() => setIsEnvModalOpen(false)} />}
      {isImportModalOpen && <ImportCurlModal onClose={() => setIsImportModalOpen(false)} />}
      {isCodeModalOpen && activeTab && (
        <CodeSnippetModal request={activeTab.request} onClose={() => setIsCodeModalOpen(false)} />
      )}
    </header>
  );
};
