import React from 'react';
import { ApiProvider } from './context/ApiContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WorkspaceTabs } from './components/WorkspaceTabs';
import { RequestPanel } from './components/RequestBuilder/RequestPanel';
import { ResponsePanel } from './components/ResponseViewer/ResponsePanel';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen bg-dark-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Header Bar */}
      <Header />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Workspace Central Area */}
        <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-dark-950">
          {/* Workspace Tab Bar */}
          <WorkspaceTabs />

          {/* Request & Response Split Workspace View */}
          <div className="flex-1 grid grid-rows-2 h-full overflow-hidden">
            {/* Request Configuration Panel (Top Half) */}
            <div className="overflow-hidden border-b border-dark-750">
              <RequestPanel />
            </div>

            {/* Response Viewer Panel (Bottom Half) */}
            <div className="overflow-hidden">
              <ResponsePanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ApiProvider>
      <MainLayout />
    </ApiProvider>
  );
}
