import React, { useState } from 'react';
import { CollectionTree } from './Collection/CollectionTree';
import { HistoryList } from './Collection/HistoryList';
import { useApi } from '../context/ApiContext';
import { FolderGit2, History, Cpu, Zap, ExternalLink } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'collections' | 'history' | 'mocks'>('collections');
  const { addTab } = useApi();

  const MOCK_PRESETS = [
    {
      name: 'Get Users List (Mock)',
      method: 'GET' as const,
      url: '{{baseUrl}}/users',
      description: 'Returns mock user directory list with pagination.',
    },
    {
      name: 'User Login Authentication',
      method: 'POST' as const,
      url: '{{baseUrl}}/auth/login',
      description: 'Simulates OAuth/JWT login token issue.',
    },
    {
      name: 'System Health Diagnostics',
      method: 'GET' as const,
      url: '{{baseUrl}}/health',
      description: 'Returns database uptime and service statuses.',
    },
    {
      name: 'ReqRes Public Users API',
      method: 'GET' as const,
      url: 'https://reqres.in/api/users?page=2',
      description: 'Live external test endpoint.',
    },
    {
      name: 'JSONPlaceholder Posts API',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      description: 'Public mock JSON REST service.',
    },
  ];

  return (
    <aside className="w-80 bg-dark-900 border-r border-dark-750 flex flex-col h-[calc(100vh-3.5rem)] z-10">
      {/* Sidebar Section Switcher */}
      <div className="flex border-b border-dark-750 p-2 bg-dark-850 gap-1">
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition ${
            activeTab === 'collections'
              ? 'bg-brand-600/15 text-brand-500 border border-brand-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Collections</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition ${
            activeTab === 'history'
              ? 'bg-brand-600/15 text-brand-500 border border-brand-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History</span>
        </button>

        <button
          onClick={() => setActiveTab('mocks')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition ${
            activeTab === 'mocks'
              ? 'bg-brand-600/15 text-brand-500 border border-brand-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Mocks</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-3 overflow-y-auto">
        {activeTab === 'collections' && <CollectionTree />}
        {activeTab === 'history' && <HistoryList />}
        {activeTab === 'mocks' && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-brand-500/10 border border-brand-500/20 text-xs">
              <div className="flex items-center space-x-1.5 text-brand-cyan font-semibold mb-1">
                <Zap className="w-4 h-4" />
                <span>Instant Mock APIs</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Click any preset to test immediately without configuring an external backend.
              </p>
            </div>

            <div className="space-y-2">
              {MOCK_PRESETS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    addTab({
                      name: preset.name,
                      method: preset.method,
                      url: preset.url,
                    })
                  }
                  className="p-2.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-750/80 hover:border-brand-cyan/40 cursor-pointer transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      {preset.method}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-brand-cyan transition" />
                  </div>
                  <div className="text-xs font-medium text-slate-200 group-hover:text-white">
                    {preset.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {preset.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
