import React from 'react';
import { useApi } from '../context/ApiContext';
import type { HttpMethod } from '../types/api';
import { Plus, X, Copy } from 'lucide-react';

const getMethodColor = (method: HttpMethod) => {
  switch (method) {
    case 'GET': return 'text-emerald-400';
    case 'POST': return 'text-indigo-400';
    case 'PUT': return 'text-amber-400';
    case 'PATCH': return 'text-cyan-400';
    case 'DELETE': return 'text-rose-400';
    default: return 'text-purple-400';
  }
};

export const WorkspaceTabs: React.FC = () => {
  const { tabs, activeTabId, setActiveTabId, closeTab, addTab, duplicateTab } = useApi();

  return (
    <div className="h-10 bg-dark-900 border-b border-dark-750 flex items-center px-2 space-x-1 overflow-x-auto select-none">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const methodColor = getMethodColor(tab.request.method);

        return (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`group relative flex items-center space-x-2 px-3 py-1.5 rounded-t-lg max-w-[200px] min-w-[120px] text-xs font-medium cursor-pointer border-t border-x transition ${
              isActive
                ? 'bg-dark-850 border-dark-700 text-white shadow-md'
                : 'bg-dark-900/60 border-transparent text-slate-400 hover:text-slate-200 hover:bg-dark-850/50'
            }`}
          >
            <span className={`text-[10px] font-mono font-bold ${methodColor}`}>
              {tab.request.method}
            </span>

            <span className="truncate flex-1 font-sans">{tab.title || 'Untitled'}</span>

            {tab.isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan flex-shrink-0" />
            )}

            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-dark-700 text-slate-400 hover:text-white transition"
                title="Duplicate Tab"
              >
                <Copy className="w-3 h-3" />
              </button>

              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="p-0.5 rounded hover:bg-dark-700 text-slate-400 hover:text-rose-400 transition"
                  title="Close Tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500 to-brand-cyan" />
            )}
          </div>
        );
      })}

      <button
        onClick={() => addTab()}
        className="p-1.5 rounded-lg hover:bg-dark-800 text-slate-400 hover:text-white transition"
        title="Open New Tab"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
