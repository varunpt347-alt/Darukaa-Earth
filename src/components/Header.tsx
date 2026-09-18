import React from 'react';
import { Leaf, Database, GitBranch, RefreshCw, Cpu } from 'lucide-react';

interface HeaderProps {
  activeTab: 'chat' | 'structured' | 'debug';
  setActiveTab: (tab: 'chat' | 'structured' | 'debug') => void;
  onResetSession: () => void;
  sessionId: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onResetSession,
  sessionId
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-emerald-400">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-white">Darukaa.Earth</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                AI Environmental Scientist
              </span>
            </div>
            <p className="text-xs text-slate-400">Evidence-Backed Biodiversity & Agroecological Reasoning Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Navigation tabs */}
          <nav className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
            <button
              id="nav-chat-tab"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'chat'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Scientist Chat
            </button>
            <button
              id="nav-structured-tab"
              onClick={() => setActiveTab('structured')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'structured'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              Structured JSON Input
            </button>
            <button
              id="nav-debug-tab"
              onClick={() => setActiveTab('debug')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center space-x-1 transition-all ${
                activeTab === 'debug'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>RAG & Causal Inspector</span>
            </button>
          </nav>

          <button
            id="btn-reset-session"
            onClick={onResetSession}
            title="Reset Session Memory"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors flex items-center space-x-1 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>
      </div>
    </header>
  );
};
