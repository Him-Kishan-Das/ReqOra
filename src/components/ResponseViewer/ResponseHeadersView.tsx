import React from 'react';
import type { ApiResponse } from '../../types/api';

interface ResponseHeadersViewProps {
  response: ApiResponse;
}

export const ResponseHeadersView: React.FC<ResponseHeadersViewProps> = ({ response }) => {
  const headerEntries = Object.entries(response.headers);

  if (headerEntries.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 font-sans">
        No response headers available for this request.
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="border border-dark-750 rounded-lg overflow-hidden bg-dark-850">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-dark-800 text-slate-400 border-b border-dark-750 font-semibold uppercase text-[10px]">
            <tr>
              <th className="p-2.5 w-1/3">Header Name</th>
              <th className="p-2.5">Header Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-750/60">
            {headerEntries.map(([key, value]) => (
              <tr key={key} className="hover:bg-dark-800/50 transition">
                <td className="p-2.5 font-bold text-brand-cyan">{key}</td>
                <td className="p-2.5 text-slate-200 break-all">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
