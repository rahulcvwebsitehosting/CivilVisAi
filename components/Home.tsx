
import React from 'react';
import { AnalysisResult } from '../types.ts';

interface HomeProps {
  onStart: () => void;
  onUpload: () => void;
  onKnowledge: () => void;
  onSettings: () => void;
  onProfile: () => void;
  history: AnalysisResult[];
  onSelectHistory: (item: AnalysisResult) => void;
}

const Home: React.FC<HomeProps> = ({ onStart, onUpload, onKnowledge, onSettings, onProfile, history, onSelectHistory }) => {
  const getElementIcon = (name: any) => {
    if (!name || typeof name !== 'string') return '🏗️';
    const n = name.toLowerCase();
    if (n.includes('column')) return '🏛️';
    if (n.includes('beam')) return '➖';
    if (n.includes('slab')) return '🔲';
    if (n.includes('footing') || n.includes('foundation')) return '⚓';
    if (n.includes('stair')) return '🪜';
    if (n.includes('bench') || n.includes('furniture')) return '🪑';
    if (n.includes('tunnel') || n.includes('metro')) return '🚇';
    return '🏗️';
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20 scrollbar-hide relative">
      {/* Hero Section with Animated Background */}
      <div className="relative min-h-[400px] overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-cyan-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Hero content */}
        <div className="relative z-10 text-center px-6 py-16">
          <div className="inline-block mb-6 px-4 py-2 glass rounded-full">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest animate-pulse">🚀 AI-Powered Inspection</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-4 gradient-text">
            CivilVision AI
          </h1>
          
          <p className="text-xl text-blue-300 font-semibold mb-8 tracking-wide">
            See Through Structures with Intelligence
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
            <button 
              onClick={onStart}
              className="group relative w-full sm:w-auto px-8 py-4 gradient-button rounded-2xl font-black uppercase tracking-wider text-white overflow-hidden hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 shimmer"></div>
              <div className="relative flex items-center justify-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Start Inspection</span>
              </div>
            </button>

            <button 
              onClick={onUpload}
              className="group relative w-full sm:w-auto px-8 py-4 glass-strong rounded-2xl font-bold uppercase tracking-wider text-white hover:scale-105 active:scale-95 border-2 border-white/20"
            >
              <div className="flex items-center justify-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Photo</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {/* AI Status Card */}
        <div className="glass-card p-6 rounded-3xl hover:scale-105 cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center pulse-glow">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <div className="text-xs font-bold text-green-400 uppercase tracking-wider">System Status</div>
              <div className="text-xl font-black text-white">Online</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>AI Engine Active</span>
          </div>
        </div>

        {/* Knowledge Base Card */}
        <button 
          onClick={onKnowledge}
          className="glass-card p-6 rounded-3xl hover:scale-105 text-left group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center glow-blue">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Knowledge Base</div>
              <div className="text-xl font-black text-white">24 Domains</div>
            </div>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Access Engineering Data</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Settings Card */}
        <button 
          onClick={onSettings}
          className="glass-card p-6 rounded-3xl hover:scale-105 text-left group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center glow-purple">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">Configuration</div>
              <div className="text-xl font-black text-white">Settings</div>
            </div>
          </div>
          <div className="text-xs text-slate-400">Customize your experience</div>
        </button>
      </div>

      {/* Inspection History */}
      <div className="px-6 py-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <span className="gradient-text">Recent Inspections</span>
          </h2>
        </div>
        
        <div className="space-y-4">
          {(history || []).length === 0 ? (
            <div className="glass-card p-12 rounded-3xl text-center">
              <div className="text-6xl mb-4 opacity-30">📂</div>
              <p className="text-slate-400 font-semibold">No inspections yet</p>
              <p className="text-sm text-slate-500 mt-2">Start your first analysis to see results here</p>
            </div>
          ) : (
            (history || []).map((item) => (
              <button 
                key={item.id}
                onClick={() => onSelectHistory(item)}
                className="w-full glass-card p-6 rounded-3xl flex items-center gap-6 hover:scale-[1.02] group"
              >
                {/* Icon */}
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform glow-blue">
                  <span className="text-4xl">{getElementIcon(item.data?.elementName)}</span>
                </div>
                
                {/* Content */}
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black text-lg text-white">{item.data?.elementName || 'Unknown Element'}</h3>
                    <span className="text-xs font-mono text-slate-500">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass px-3 py-2 rounded-xl">
                      <div className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1">Material</div>
                      <div className="text-sm font-bold text-white truncate">
                        {item.data?.materialDetails && typeof item.data.materialDetails === 'string' ? item.data.materialDetails.split(',')[0] : 'Processing...'}
                      </div>
                    </div>
                    
                    <div className="glass px-3 py-2 rounded-xl">
                      <div className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-1">Cost Est.</div>
                      <div className="text-sm font-bold text-white truncate">
                        {item.data?.costEstimate && typeof item.data.costEstimate === 'string' ? item.data.costEstimate.split(' ')[0] : 'TBD'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Floating Profile Button */}
      <button 
        onClick={onProfile}
        className="fixed bottom-8 right-8 w-16 h-16 gradient-button rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 z-50 pulse-glow float"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </button>
    </div>
  );
};

export default Home;
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white mono shadow-lg shadow-blue-500/20">CV</div>
          <span className="font-bold tracking-tighter text-lg uppercase italic">CivilVision <span className="text-blue-500">PRO</span></span>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onSettings} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-blue-500 transition-all text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Action Area */}
      <div className="p-6 space-y-4">
        <button 
          onClick={onStart}
          className="group relative w-full h-36 bg-blue-600 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all flex flex-col items-center justify-center"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-lg font-black uppercase tracking-widest text-white italic">Live Inspection</span>
          <span className="text-[9px] mono text-blue-100 uppercase font-bold opacity-60">Real-time Vision</span>
        </button>

        <button 
          onClick={onUpload}
          className="group relative w-full h-32 bg-slate-900 rounded-3xl overflow-hidden border border-blue-500/30 active:scale-[0.98] transition-all flex flex-col items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-lg font-black uppercase tracking-widest text-blue-500 italic">Upload Document</span>
          <span className="text-[9px] mono text-slate-500 uppercase font-bold">Process Site Photos</span>
        </button>
      </div>

      {/* Grid Stats */}
      <div className="px-6 grid grid-cols-2 gap-4">
        <div className="bg-slate-900/80 blueprint-border p-4">
          <div className="text-[9px] font-bold text-blue-500 mono uppercase mb-1">Status</div>
          <div className="text-lg font-bold text-green-400 uppercase italic">Active</div>
          <div className="text-[9px] text-slate-500 mono mt-1 flex items-center">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            SYSTEM: ONLINE
          </div>
        </div>
        <button 
          onClick={onKnowledge}
          className="bg-slate-900/80 blueprint-border p-4 text-left active:scale-95 transition-all group"
        >
          <div className="text-[9px] font-bold text-blue-500 mono uppercase mb-1">Database</div>
          <div className="text-lg font-bold text-white flex items-center justify-between">
            KNOWLEDGE
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
          <div className="text-[9px] text-slate-500 mono mt-1 uppercase">24 CORE DOMAINS</div>
        </button>
      </div>

      {/* Field Records Section */}
      <div className="px-6 mt-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📋</span>
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mono italic">Inspection Logs</h2>
          </div>
          <span className="text-[10px] text-blue-500 font-bold mono border border-blue-500/20 px-2 py-0.5 rounded uppercase">V1.24_DB</span>
        </div>
        
        <div className="space-y-4">
          {(history || []).length === 0 ? (
            <div className="bg-slate-900/30 border-2 border-dashed border-slate-800 p-12 rounded-3xl text-center">
              <div className="text-3xl mb-3 opacity-20 grayscale">📂</div>
              <span className="text-xs text-slate-600 mono uppercase font-bold tracking-widest">Awaiting Site Analysis</span>
            </div>
          ) : (
            (history || []).map((item) => (
              <button 
                key={item.id}
                onClick={() => onSelectHistory(item)}
                className="w-full bg-slate-900/60 hover:bg-slate-900 border border-slate-800 p-4 rounded-3xl flex items-center space-x-4 transition-all group active:scale-[0.99] shadow-lg hover:border-blue-600/30"
              >
                <div className="relative h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 border border-slate-700 group-hover:bg-blue-600/10 transition-colors shadow-inner">
                  <span className="text-3xl drop-shadow-md">{getElementIcon(item.data?.elementName)}</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-sm uppercase text-white tracking-tight">{item.data?.elementName || 'Untyped Element'}</span>
                    <span className="text-[9px] mono text-slate-500 font-bold">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-black/30 px-2 py-1.5 rounded-xl border border-white/5">
                        <span className="text-[8px] text-blue-500 block mono font-black uppercase tracking-tighter">Material</span>
                        <span className="text-[10px] font-bold text-slate-300 truncate block">
                          {item.data?.materialDetails && typeof item.data.materialDetails === 'string' ? item.data.materialDetails.split(',')[0] : 'Processing...'}
                        </span>
                    </div>
                    <div className="bg-black/30 px-2 py-1.5 rounded-xl border border-white/5">
                        <span className="text-[8px] text-blue-500 block mono font-black uppercase tracking-tighter">Cost_Est</span>
                        <span className="text-[10px] font-bold text-slate-300 truncate block">
                          {item.data?.costEstimate && typeof item.data.costEstimate === 'string' ? item.data.costEstimate.split(' ')[0] : 'TBD'}
                        </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Floating Settings Button */}
      <button 
        onClick={onSettings}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50 hover:scale-110 active:scale-95 transition-all z-50 group border border-white/20"
      >
        <div className="absolute inset-0 bg-blue-400 rounded-2xl animate-ping opacity-20 pointer-events-none"></div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-blue-600 text-[8px] font-black text-white uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          User Settings
        </div>
      </button>
    </div>
  );
};

export default Home;
