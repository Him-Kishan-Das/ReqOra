import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext';
import type { HttpMethod } from '../../types/api';
import { Search, Trash2, Clock } from 'lucide-react';

const getMethodBadgeClass = (method: HttpMethod) => {
  switch (method) {
    case 'GET': return 'text-emerald-400 font-bold';
    case 'POST': return 'text-indigo-400 font-bold';
    case 'PUT': return 'text-amber-400 font-bold';
    case 'PATCH': return 'text-cyan-400 font-bold';
    case 'DELETE': return 'text-rose-400 font-bold';
    default: return 'text-purple-400 font-bold';
  }
};

const getStatusBadge = (status: number) => {
  if (status >= 200 && status < 300) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (status >= 300 && status < 400) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
  if (status >= 400 && status < 500) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  if (status >= 500) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
};

export const HistoryList: React.FC = () => {
  const { history, loadRequestIntoTab, clearHistory } = useApi();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.request.name.toLowerCase().includes(q) ||
      item.request.url.toLowerCase().includes(q) ||
      item.request.method.toLowerCase().includes(q)
    );
  });

  if (history.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 space-y-2">
        <Clock className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
        <p>No request history yet.</p>
        <p className="text-[11px] text-slate-600">Requests you execute will appear here automatically.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-850 border border-dark-750 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500 transition"
          />
        </div>
        <button
          onClick={() => {
            if (confirm('Clear all request history?')) clearHistory();
          }}
          className="p-1.5 rounded-lg bg-dark-850 hover:bg-rose-500/10 border border-dark-750 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition"
          title="Clear History"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
        {filteredHistory.map((item) => {
          const res = item.response;
          return (
            <div
              key={item.id}
              onClick={() => loadRequestIntoTab(item.request)}
              className="p-2.5 rounded-lg bg-dark-850 hover:bg-dark-800 border border-dark-750/60 hover:border-brand-500/40 cursor-pointer transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono ${getMethodBadgeClass(item.request.method)}`}>
                    {item.request.method}
                  </span>
                  {res && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${getStatusBadge(res.status)}`}>
                      {res.status > 0 ? res.status : 'ERR'}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <div className="text-xs font-medium text-slate-200 truncate group-hover:text-brand-cyan transition">
                {item.request.name || item.request.url}
              </div>

              <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                {item.request.url}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
