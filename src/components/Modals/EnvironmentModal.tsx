import React, { useState } from 'react';
import { useApi } from '../../context/ApiContext';
import type { EnvironmentVariable } from '../../types/api';
import { X, Plus, Trash2, Globe, CheckSquare, Square } from 'lucide-react';

interface EnvironmentModalProps {
  onClose: () => void;
}

export const EnvironmentModal: React.FC<EnvironmentModalProps> = ({ onClose }) => {
  const {
    environments,
    createEnvironment,
    deleteEnvironment,
    setActiveEnvironment,
    updateEnvironmentVariables,
  } = useApi();

  const [selectedEnvId, setSelectedEnvId] = useState<string>(
    environments[0]?.id || ''
  );
  const [newEnvName, setNewEnvName] = useState('');

  const selectedEnv = environments.find((e) => e.id === selectedEnvId);

  const handleVariableChange = (varId: string, field: keyof EnvironmentVariable, val: any) => {
    if (!selectedEnv) return;
    const updatedVars = selectedEnv.variables.map((v) =>
      v.id === varId ? { ...v, [field]: val } : v
    );
    updateEnvironmentVariables(selectedEnv.id, updatedVars);
  };

  const addVariable = () => {
    if (!selectedEnv) return;
    const newVar: EnvironmentVariable = {
      id: 'v-' + Math.random().toString(36).substring(2, 9),
      key: '',
      value: '',
      enabled: true,
    };
    updateEnvironmentVariables(selectedEnv.id, [...selectedEnv.variables, newVar]);
  };

  const removeVariable = (varId: string) => {
    if (!selectedEnv) return;
    updateEnvironmentVariables(
      selectedEnv.id,
      selectedEnv.variables.filter((v) => v.id !== varId)
    );
  };

  const handleCreateEnv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvName.trim()) return;
    createEnvironment(newEnvName.trim());
    setNewEnvName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-dark-900 border border-dark-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-5 py-4 bg-dark-850 border-b border-dark-750 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-brand-cyan" />
            <h2 className="text-sm font-bold text-slate-100">Environment Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-dark-750 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-56 bg-dark-850 border-r border-dark-750 p-3 flex flex-col space-y-3">
            <form onSubmit={handleCreateEnv} className="flex space-x-1">
              <input
                type="text"
                placeholder="Env name..."
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                className="w-full bg-dark-900 border border-dark-750 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="px-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-1">
              {environments.map((env) => (
                <div
                  key={env.id}
                  onClick={() => setSelectedEnvId(env.id)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold cursor-pointer transition ${
                    selectedEnvId === env.id
                      ? 'bg-brand-600/20 text-brand-cyan border border-brand-cyan/30'
                      : 'hover:bg-dark-800 text-slate-300'
                  }`}
                >
                  <span className="truncate">{env.name}</span>
                  {env.isActive ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEnvironment(env.id);
                      }}
                      className="text-[10px] text-slate-500 hover:text-brand-cyan"
                    >
                      Set Active
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3">
            {selectedEnv ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{selectedEnv.name}</h3>
                    <p className="text-xs text-slate-400">
                      Use variables in requests like <code className="text-brand-cyan font-mono">&#123;&#123;variableName&#125;&#125;</code>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={addVariable}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Variable</span>
                    </button>

                    {environments.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete environment "${selectedEnv.name}"?`)) {
                            deleteEnvironment(selectedEnv.id);
                            setSelectedEnvId(environments.find((e) => e.id !== selectedEnv.id)?.id || '');
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400"
                        title="Delete Environment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="border border-dark-750 rounded-lg overflow-hidden bg-dark-850">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-dark-800 text-slate-400 border-b border-dark-750 uppercase text-[10px]">
                      <tr>
                        <th className="p-2 w-10 text-center">Use</th>
                        <th className="p-2 w-1/2">Variable Key</th>
                        <th className="p-2 w-1/2">Variable Value</th>
                        <th className="p-2 w-10 text-center">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-750">
                      {selectedEnv.variables.map((v) => (
                        <tr key={v.id}>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleVariableChange(v.id, 'enabled', !v.enabled)}
                              className="text-slate-400 hover:text-brand-500"
                            >
                              {v.enabled ? (
                                <CheckSquare className="w-4 h-4 text-brand-500" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="baseUrl"
                              value={v.key}
                              onChange={(e) => handleVariableChange(v.id, 'key', e.target.value)}
                              className="w-full bg-dark-900 border border-dark-750 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="https://api.example.com"
                              value={v.value}
                              onChange={(e) => handleVariableChange(v.id, 'value', e.target.value)}
                              className="w-full bg-dark-900 border border-dark-750 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => removeVariable(v.id)}
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
              </>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                Select or create an environment to manage variables.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentModal;
