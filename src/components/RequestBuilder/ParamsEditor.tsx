import React from 'react';
import { useApi } from '../../context/ApiContext';
import type { KeyValueParam } from '../../types/api';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';

export const ParamsEditor: React.FC = () => {
  const { activeTab, updateTabRequest } = useApi();

  if (!activeTab) return null;

  const { params } = activeTab.request;

  const updateParams = (newParams: KeyValueParam[]) => {
    updateTabRequest(activeTab.id, { params: newParams });
  };

  const handleParamChange = (id: string, field: keyof KeyValueParam, val: any) => {
    const updated = params.map((p) => (p.id === id ? { ...p, [field]: val } : p));
    updateParams(updated);
  };

  const addParam = () => {
    const newP: KeyValueParam = {
      id: Math.random().toString(36).substring(2, 9),
      key: '',
      value: '',
      enabled: true,
      description: '',
    };
    updateParams([...params, newP]);
  };

  const removeParam = (id: string) => {
    updateParams(params.filter((p) => p.id !== id));
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Query Parameters
        </span>
        <button
          onClick={addParam}
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-750 border border-dark-700 text-xs text-brand-cyan hover:text-white transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Parameter</span>
        </button>
      </div>

      {params.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-500 bg-dark-850 rounded-lg border border-dark-750">
          No query parameters set. Click "Add Parameter" to append key-value pairs to the request URL.
        </div>
      ) : (
        <div className="border border-dark-750 rounded-lg overflow-hidden bg-dark-850">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-800 text-slate-400 border-b border-dark-750 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-2 w-10 text-center">Use</th>
                <th className="p-2 w-1/3">Key</th>
                <th className="p-2 w-1/3">Value</th>
                <th className="p-2">Description</th>
                <th className="p-2 w-10 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750/60 font-mono">
              {params.map((p) => (
                <tr key={p.id} className="hover:bg-dark-800/50 transition">
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleParamChange(p.id, 'enabled', !p.enabled)}
                      className="text-slate-400 hover:text-brand-500"
                    >
                      {p.enabled ? (
                        <CheckSquare className="w-4 h-4 text-brand-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      placeholder="e.g. limit"
                      value={p.key}
                      onChange={(e) => handleParamChange(p.id, 'key', e.target.value)}
                      className="w-full bg-dark-900 border border-dark-750 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      placeholder="e.g. 100 or {{limit}}"
                      value={p.value}
                      onChange={(e) => handleParamChange(p.id, 'value', e.target.value)}
                      className="w-full bg-dark-900 border border-dark-750 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      placeholder="Optional notes"
                      value={p.description || ''}
                      onChange={(e) => handleParamChange(p.id, 'description', e.target.value)}
                      className="w-full bg-dark-900 border border-dark-750 rounded px-2 py-1 text-xs font-sans text-slate-400 focus:outline-none focus:border-brand-500"
                    />
                  </td>

                  <td className="p-2 text-center">
                    <button
                      onClick={() => removeParam(p.id)}
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
