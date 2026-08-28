import React, { useState } from 'react';
import type { ApiRequest } from '../../types/api';
import { generateCodeSnippet } from '../../utils/codeGen';
import { X, Code2, Copy, Check } from 'lucide-react';

interface CodeSnippetModalProps {
  request: ApiRequest;
  onClose: () => void;
}

const LANGUAGES = [
  { id: 'curl', name: 'cURL' },
  { id: 'javascript-fetch', name: 'JS (Fetch)' },
  { id: 'javascript-axios', name: 'JS (Axios)' },
  { id: 'python-requests', name: 'Python (requests)' },
  { id: 'nodejs-native', name: 'Node.js (https)' },
  { id: 'go', name: 'Go (net/http)' },
  { id: 'php-curl', name: 'PHP (cURL)' },
];

export const CodeSnippetModal: React.FC<CodeSnippetModalProps> = ({ request, onClose }) => {
  const [selectedLang, setSelectedLang] = useState('curl');
  const [copied, setCopied] = useState(false);

  const snippet = generateCodeSnippet(request, selectedLang);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-dark-900 border border-dark-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-5 py-4 bg-dark-850 border-b border-dark-750 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-brand-500" />
            <h2 className="text-sm font-bold text-slate-100">Code Snippet Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-dark-750 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-1 px-4 py-2 bg-dark-850 border-b border-dark-750 overflow-x-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLang(lang.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedLang === lang.id
                  ? 'bg-brand-600/20 text-brand-cyan border border-brand-cyan/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        <div className="p-4 flex-1 overflow-y-auto bg-dark-950 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">
              Request: <strong className="text-slate-200">{request.name}</strong> ({request.method})
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="flex-1 p-4 rounded-xl bg-dark-900 border border-dark-750 font-mono text-xs text-slate-100 whitespace-pre-wrap overflow-x-auto select-text">
            {snippet}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetModal;
