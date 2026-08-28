import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext';
import type { BodyType, RequestBody } from '../../types/api';
import { Wand2 } from 'lucide-react';

export const BodyEditor: React.FC = () => {
  const { activeTab, updateTabRequest } = useApi();
  const [jsonError, setJsonError] = useState<string | null>(null);

  if (!activeTab) return null;

  const { body } = activeTab.request;

  const handleBodyChange = (updates: Partial<RequestBody>) => {
    updateTabRequest(activeTab.id, {
      body: { ...body, ...updates },
    });
  };

  const beautifyJson = () => {
    try {
      if (!body.rawJson.trim()) return;
      const parsed = JSON.parse(body.rawJson);
      const formatted = JSON.stringify(parsed, null, 2);
      handleBodyChange({ rawJson: formatted });
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message || 'Invalid JSON syntax');
    }
  };

  const bodyTypes: { type: BodyType; label: string }[] = [
    { type: 'none', label: 'None' },
    { type: 'json', label: 'JSON' },
    { type: 'form-data', label: 'Form Data' },
    { type: 'x-www-form-urlencoded', label: 'URL Encoded' },
    { type: 'raw', label: 'Raw Text' },
    { type: 'graphql', label: 'GraphQL' },
  ];

  return (
    <div className="p-3 space-y-3 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 bg-dark-850 p-1 rounded-lg border border-dark-750">
          {bodyTypes.map((bt) => (
            <button
              key={bt.type}
              onClick={() => handleBodyChange({ type: bt.type })}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                body.type === bt.type
                  ? 'bg-brand-600/20 text-brand-cyan border border-brand-cyan/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {bt.label}
            </button>
          ))}
        </div>

        {body.type === 'json' && (
          <button
            onClick={beautifyJson}
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-dark-800 hover:bg-dark-750 border border-dark-700 text-xs text-brand-500 hover:text-brand-400 font-medium transition"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Format JSON</span>
          </button>
        )}
      </div>

      {body.type === 'none' && (
        <div className="p-6 text-center text-xs text-slate-500 bg-dark-850 rounded-lg border border-dark-750">
          This request does not include a payload body.
        </div>
      )}

      {body.type === 'json' && (
        <div className="flex-1 flex flex-col space-y-2">
          <textarea
            value={body.rawJson}
            onChange={(e) => {
              handleBodyChange({ rawJson: e.target.value });
              setJsonError(null);
            }}
            placeholder='{\n  "key": "value"\n}'
            className="w-full h-48 bg-dark-850 border border-dark-750 rounded-lg p-3 font-mono text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 resize-y"
          />
          {jsonError && (
            <div className="text-xs font-mono text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20">
              ⚠️ Syntax Error: {jsonError}
            </div>
          )}
        </div>
      )}

      {body.type === 'raw' && (
        <textarea
          value={body.rawText}
          onChange={(e) => handleBodyChange({ rawText: e.target.value })}
          placeholder="Enter raw request text, XML, or payload..."
          className="w-full h-48 bg-dark-850 border border-dark-750 rounded-lg p-3 font-mono text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 resize-y"
        />
      )}

      {body.type === 'graphql' && (
        <div className="grid grid-cols-2 gap-3 h-52">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              GraphQL Query
            </label>
            <textarea
              value={body.graphqlQuery}
              onChange={(e) => handleBodyChange({ graphqlQuery: e.target.value })}
              placeholder="query GetUsers { users { id name } }"
              className="w-full h-44 bg-dark-850 border border-dark-750 rounded-lg p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Variables (JSON)
            </label>
            <textarea
              value={body.graphqlVariables}
              onChange={(e) => handleBodyChange({ graphqlVariables: e.target.value })}
              placeholder='{ "limit": 10 }'
              className="w-full h-44 bg-dark-850 border border-dark-750 rounded-lg p-3 font-mono text-xs text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
