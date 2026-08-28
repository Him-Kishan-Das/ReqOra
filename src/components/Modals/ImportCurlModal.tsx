import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext';
import { X, Terminal, ArrowRight } from 'lucide-react';

interface ImportCurlModalProps {
  onClose: () => void;
}

export const ImportCurlModal: React.FC<ImportCurlModalProps> = ({ onClose }) => {
  const { importCurlString } = useApi();
  const [curlText, setCurlText] = useState('');
  const [error, setError] = useState(false);

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!curlText.trim()) return;

    const success = importCurlString(curlText);
    if (success) {
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-dark-900 border border-dark-750 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-dark-850 border-b border-dark-750 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-brand-cyan" />
            <h2 className="text-sm font-bold text-slate-100">Import cURL Command</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-dark-750 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleImport} className="p-5 space-y-4">
          <p className="text-xs text-slate-300">
            Paste raw <code className="text-brand-cyan font-mono">cURL</code> command string below. ReqOra will parse the method, URL, headers, and request body automatically.
          </p>

          <textarea
            value={curlText}
            onChange={(e) => {
              setCurlText(e.target.value);
              setError(false);
            }}
            placeholder='curl -X POST "https://api.example.com/v1/users" -H "Content-Type: application/json" -d "{\"name\":\"John\"}"'
            className="w-full h-44 bg-dark-850 border border-dark-750 rounded-xl p-3 font-mono text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 resize-none"
          />

          {error && (
            <div className="text-xs font-mono text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20">
              ⚠️ Unable to parse cURL command. Make sure string starts with `curl`.
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-750 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-brand-600/20"
            >
              <span>Import to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportCurlModal;
