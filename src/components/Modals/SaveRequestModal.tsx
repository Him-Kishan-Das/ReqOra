import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext';
import { X, Save } from 'lucide-react';

interface SaveRequestModalProps {
  onClose: () => void;
}

export const SaveRequestModal: React.FC<SaveRequestModalProps> = ({ onClose }) => {
  const { collections, activeTab, saveCurrentRequestToCollection } = useApi();

  const [requestName, setRequestName] = useState(
    activeTab?.request.name || 'New Saved Request'
  );
  const [selectedFolderId, setSelectedFolderId] = useState(
    collections[0]?.id || ''
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFolderId || !requestName.trim()) return;

    saveCurrentRequestToCollection(selectedFolderId, requestName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-dark-900 border border-dark-750 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 bg-dark-850 border-b border-dark-750 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Save className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100">Save Request</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-dark-750 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Request Name
            </label>
            <input
              type="text"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              className="w-full bg-dark-850 border border-dark-750 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Collection
            </label>
            {collections.length === 0 ? (
              <div className="text-xs text-rose-400 p-2 bg-rose-500/10 rounded border border-rose-500/20">
                No collections available. Please create a collection first.
              </div>
            ) : (
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full bg-dark-850 border border-dark-750 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {collections.map((col) => (
                  <option key={col.id} value={col.id} className="bg-dark-900 text-slate-200">
                    📂 {col.name}
                  </option>
                ))}
              </select>
            )}
          </div>

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
              disabled={collections.length === 0}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save to Collection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveRequestModal;
