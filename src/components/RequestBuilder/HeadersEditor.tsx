import React from 'react';
import { useApi } from '../../context/ApiContext';
import type { KeyValueParam } from '../../types/api';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';

const COMMON_HEADERS = [
  'Accept',
  'Authorization',
  'Content-Type',
  'User-Agent',
  'Cache-Control',
  'X-API-Key',
  'X-Requested-With',
  'Access-Control-Allow-Origin',
];

export const HeadersEditor: React.FC = () => {
  const { activeTab, updateTabRequest } = useApi();

  if (!activeTab) return null;

  const { headers } = activeTab.request;

  const updateHeaders = (newHeaders: KeyValueParam[]) => {
    updateTabRequest(activeTab.id, { headers: newHeaders });
  };

  const handleHeaderChange = (id: string, field: keyof KeyValueParam, val: any) => {
    const updated = headers.map((h) => (h.id === id ? { ...h, [field]: val } : h));
    updateHeaders(updated);
  };

  const addHeader = (key = '', value = '') => {
    const newH: KeyValueParam = {
      id: Math.random().toString(36).substring(2, 9),
      key,
      value,
      enabled: true,
    };
    updateHeaders([...headers, newH]);
  };

  const removeHeader = (id: string) => {
    updateHeaders(headers.filter((h) => h.id !== id));
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            HTTP Headers
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            ({headers.filter((h) => h.enabled).length} active)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => addHeader()}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-750 border border-dark-700 text-xs text-brand-cyan hover:text-white transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Header</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        <span className="text-[10px] text-slate-500 font-medium">Quick Add:</span>
        {COMMON_HEADERS.map((hKey) => (
          <button
            key={hKey}
            onClick={() => addHeader(hKey, hKey === 'Content-Type' ? 'application/json' : '')}
            className="px-2 py-0.5 rounded bg-dark-800 hover:bg-dark-750 border border-dark-750 text-[10px] text-slate-400 hover:text-slate-200 transition"
          >
            + {hKey}
          </button>
        ))}
      </div>

      {headers.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-500 bg-dark-850 rounded-lg border border-dark-750">
          No headers set. Click "Add Header" or choose a quick preset above.
        </div>
      ) : (
        <div className="border border-dark-750 rounded-lg overflow-hidden bg-dark-850">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-800 text-slate-400 border-b border-dark-750 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-2 w-10 text-center">Use</th>
                <th className="p-2 w-1/2">Header Key</th>
                <th className="p-2 w-1/2">Header Value</th>
                <th className="p-2 w-10 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750/60 font-mono">
              {headers.map((h) => (
                <tr key={h.id} className="hover:bg-dark-800/50 transition">
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleHeaderChange(h.id, 'enabled', !h.enabled)}
                      className="text-slate-400 hover:text-brand-500"
                    >
                      {h.enabled ? (
                        <CheckSquare className="w-4 h-4 text-brand-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      placeholder="Header-Name"
                      value={h.key}
                      onChange={(e) => handleHeaderChange(h.id, 'key', e.target.value)}
                      className="w-full bg-dark-900 border border-dark-750 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      placeholder="Header Value or {{variable}}"
                      value={h.value}
                      onChange={(e) => handleHeaderChange(h.id, 'value', e.target.value)}
                      className="w-full bg-dark-900 border border-dark-750 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  </td>

                  <td className="p-2 text-center">
                    <button
                      onClick={() => removeHeader(h.id)}
                      className="p-1 rounded hover:bg-rose-500/10 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
