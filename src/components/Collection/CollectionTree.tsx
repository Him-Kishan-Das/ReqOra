import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext';
import type { CollectionItem, HttpMethod } from '../../types/api';
import {
  Folder,
  FolderOpen,
  Trash2,
  ChevronRight,
  ChevronDown,
  Plus,
} from 'lucide-react';

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

export const CollectionTree: React.FC = () => {
  const { collections, loadRequestIntoTab, deleteCollectionItem, saveCurrentRequestToCollection, activeTab } = useApi();
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ 'col-1': true });

  const toggleFolder = (id: string) => {
    setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderTree = (items: CollectionItem[]) => {
    return items.map((item) => {
      if (item.type === 'folder') {
        const isOpen = openFolders[item.id] ?? true;
        return (
          <div key={item.id} className="mb-1">
            <div className="flex items-center justify-between group px-2 py-1.5 rounded-lg hover:bg-dark-800/60 cursor-pointer text-xs font-medium text-slate-300">
              <div
                className="flex items-center space-x-2 flex-1 overflow-hidden"
                onClick={() => toggleFolder(item.id)}
              >
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                )}
                {isOpen ? (
                  <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
                )}
                <span className="truncate">{item.name}</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({item.children?.length || 0})
                </span>
              </div>

              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition">
                {activeTab && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const name = prompt('Name for saved request:', activeTab.request.name);
                      if (name) saveCurrentRequestToCollection(item.id, name);
                    }}
                    className="p-1 rounded hover:bg-dark-700 text-slate-400 hover:text-emerald-400"
                    title="Save active tab request here"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete collection folder "${item.name}"?`)) {
                      deleteCollectionItem(item.id);
                    }
                  }}
                  className="p-1 rounded hover:bg-dark-700 text-slate-400 hover:text-rose-400"
                  title="Delete Folder"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {isOpen && item.children && item.children.length > 0 && (
              <div className="pl-4 border-l border-dark-800 ml-3.5 space-y-0.5 mt-1">
                {renderTree(item.children)}
              </div>
            )}
          </div>
        );
      }

      const req = item.request;
      if (!req) return null;

      return (
        <div
          key={item.id}
          className="flex items-center justify-between group px-2 py-1.5 rounded-lg hover:bg-dark-800/80 cursor-pointer text-xs transition"
          onClick={() => loadRequestIntoTab(req)}
        >
          <div className="flex items-center space-x-2 overflow-hidden flex-1">
            <span className={`text-[10px] font-mono w-10 uppercase ${getMethodBadgeClass(req.method)}`}>
              {req.method}
            </span>
            <span className="truncate text-slate-200 hover:text-white font-medium">
              {item.name}
            </span>
          </div>

          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteCollectionItem(item.id);
              }}
              className="p-1 rounded hover:bg-dark-700 text-slate-400 hover:text-rose-400"
              title="Delete Request"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    });
  };

  if (collections.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-500">
        No collections yet. Click "New Collection" above to organize your requests.
      </div>
    );
  }

  return <div className="space-y-1">{renderTree(collections)}</div>;
};
