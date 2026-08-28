import React from 'react';
import { useApi } from '../../context/ApiContext';
import type { AuthConfig, AuthType } from '../../types/api';
import { ShieldCheck, Key } from 'lucide-react';

export const AuthEditor: React.FC = () => {
  const { activeTab, updateTabRequest } = useApi();

  if (!activeTab) return null;

  const { auth } = activeTab.request;

  const handleAuthChange = (updates: Partial<AuthConfig>) => {
    updateTabRequest(activeTab.id, {
      auth: { ...auth, ...updates },
    });
  };

  return (
    <div className="p-3 space-y-4 max-w-xl">
      <div className="flex items-center space-x-2">
        <ShieldCheck className="w-4 h-4 text-brand-cyan" />
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Authentication Mode
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {(['none', 'bearer', 'basic', 'apikey'] as AuthType[]).map((type) => {
          const isSelected = auth.type === type;
          return (
            <button
              key={type}
              onClick={() => handleAuthChange({ type })}
              className={`p-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition ${
                isSelected
                  ? 'bg-brand-600/20 border-brand-500 text-brand-cyan shadow-sm'
                  : 'bg-dark-850 border-dark-750 text-slate-400 hover:text-slate-200 hover:bg-dark-800'
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      <div className="p-4 rounded-lg bg-dark-850 border border-dark-750 space-y-3 font-mono text-xs">
        {auth.type === 'none' && (
          <div className="text-slate-400 text-xs font-sans text-center py-2">
            No authentication headers will be automatically attached to this request.
          </div>
        )}

        {auth.type === 'bearer' && (
          <div className="space-y-2">
            <label className="block text-[11px] font-sans font-semibold text-slate-300">
              Bearer Token
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={auth.bearerToken}
                onChange={(e) => handleAuthChange({ bearerToken: e.target.value })}
                className="w-full bg-dark-900 border border-dark-750 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>
            <p className="text-[10px] font-sans text-slate-500">
              Will add header: <code className="text-brand-cyan">Authorization: Bearer &lt;token&gt;</code>
            </p>
          </div>
        )}

        {auth.type === 'basic' && (
          <div className="space-y-3 font-sans">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Username</label>
              <input
                type="text"
                placeholder="e.g. admin or {{username}}"
                value={auth.username}
                onChange={(e) => handleAuthChange({ username: e.target.value })}
                className="w-full bg-dark-900 border border-dark-750 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                placeholder="Password or {{password}}"
                value={auth.password}
                onChange={(e) => handleAuthChange({ password: e.target.value })}
                className="w-full bg-dark-900 border border-dark-750 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Will send base64 encoded string as <code className="text-brand-cyan">Authorization: Basic &lt;credentials&gt;</code>
            </p>
          </div>
        )}

        {auth.type === 'apikey' && (
          <div className="space-y-3 font-sans">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Key Name</label>
                <input
                  type="text"
                  placeholder="X-API-Key"
                  value={auth.apiKeyKey}
                  onChange={(e) => handleAuthChange({ apiKeyKey: e.target.value })}
                  className="w-full bg-dark-900 border border-dark-750 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Key Value</label>
                <input
                  type="text"
                  placeholder="api_key_secret_val"
                  value={auth.apiKeyValue}
                  onChange={(e) => handleAuthChange({ apiKeyValue: e.target.value })}
                  className="w-full bg-dark-900 border border-dark-750 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Add To</label>
              <select
                value={auth.apiKeyAddTo}
                onChange={(e) => handleAuthChange({ apiKeyAddTo: e.target.value as 'header' | 'query' })}
                className="w-full bg-dark-900 border border-dark-750 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="header">Header</option>
                <option value="query">Query Params</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
