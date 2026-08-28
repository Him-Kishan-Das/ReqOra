import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext';
import type { HttpMethod } from '../../types/api';
import { Send, Save, Loader2, Sparkles } from 'lucide-react';
import SaveRequestModal from '../Modals/SaveRequestModal';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export const RequestBar: React.FC = () => {
  const { activeTab, updateTabRequest, sendRequest, cancelRequest, activeEnvironment } = useApi();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  if (!activeTab) return null;

  const { request, isLoading } = activeTab;

  const handleMethodChange = (m: HttpMethod) => {
    updateTabRequest(activeTab.id, { method: m });
  };

  const handleUrlChange = (url: string) => {
    updateTabRequest(activeTab.id, { url });
  };

  return (
    <div className="p-3 bg-dark-900 border-b border-dark-750 flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <select
            value={request.method}
            onChange={(e) => handleMethodChange(e.target.value as HttpMethod)}
            className="h-10 bg-dark-800 border border-dark-700 rounded-lg px-3 text-xs font-mono font-bold text-brand-cyan focus:outline-none focus:border-brand-500 cursor-pointer appearance-none pr-8"
          >
            {HTTP_METHODS.map((method) => (
              <option key={method} value={method} className="bg-dark-900 font-mono text-slate-200">
                {method}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            ▼
          </div>
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            value={request.url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                sendRequest(activeTab.id);
              }
            }}
            placeholder="Enter request URL (e.g. https://api.example.com/v1/users or {{baseUrl}}/users)..."
            className="w-full h-10 bg-dark-850 border border-dark-750 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
          />

          {activeEnvironment && request.url.includes('{{') && (
            <div className="absolute right-3 top-2.5 flex items-center space-x-1 text-[10px] text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded border border-brand-cyan/20 pointer-events-none">
              <Sparkles className="w-3 h-3" />
              <span>{activeEnvironment.name}</span>
            </div>
          )}
        </div>

        {isLoading ? (
          <button
            onClick={() => cancelRequest(activeTab.id)}
            className="h-10 px-5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-md shadow-rose-600/20 transition"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Cancel</span>
          </button>
        ) : (
          <button
            onClick={() => sendRequest(activeTab.id)}
            className="h-10 px-6 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-cyan text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-brand-500/25 transition transform active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        )}

        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="h-10 px-3 rounded-lg bg-dark-800 hover:bg-dark-750 border border-dark-700 text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition"
          title="Save Request to Collection"
        >
          <Save className="w-4 h-4 text-amber-400" />
          <span>Save</span>
        </button>
      </div>

      {isSaveModalOpen && <SaveRequestModal onClose={() => setIsSaveModalOpen(false)} />}
    </div>
  );
};
