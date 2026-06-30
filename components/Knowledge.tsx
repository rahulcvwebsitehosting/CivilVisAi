
import React, { useState } from 'react';
import { KNOWLEDGE_BASE } from '../constants.ts';
import { KnowledgeTopic, KnowledgeSubcategory } from '../types.ts';

interface KnowledgeProps {
  onBack: () => void;
}

const Knowledge: React.FC<KnowledgeProps> = ({ onBack }) => {
  const [selectedTopic, setSelectedTopic] = useState<KnowledgeTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState<'base' | 'tools' | 'resources'>('base');

  const filteredBase = KNOWLEDGE_BASE.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const interactiveTools = [
    { id: 'calc_concrete', title: 'Concrete Mix Design', icon: '🧪', desc: 'IS 10262:2019 Standard' },
    { id: 'calc_rebar', title: 'Rebar Weight Calc', icon: '📏', desc: 'D²/162 Weight Estimator' },
    { id: 'calc_slope', title: 'Slope Stability', icon: '📐', desc: 'FOS Analysis Tool' },
    { id: 'calc_beam', title: 'Beam Moment Calc', icon: '🏗️', desc: 'Simply Supported / Cantilever' },
    { id: 'calc_unit', title: 'Unit Converter', icon: '🔄', desc: 'Civil Engineering Units' },
    { id: 'calc_cost', title: 'Cost Estimator', icon: '💰', desc: 'Material & Labor Rates' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl border-b border-white/5 relative z-30">
        <button onClick={selectedTopic ? () => setSelectedTopic(null) : onBack} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="text-center">
          <div className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] mb-0.5">Engineering_Intelligence</div>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">
            {selectedTopic ? selectedTopic.title : 'Knowledge Hub'}
          </h1>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Sub Navigation */}
      {!selectedTopic && (
        <div className="flex bg-slate-900/30 border-b border-white/5 relative z-20">
          {[
            { id: 'base', label: 'Library', icon: '📚' },
            { id: 'tools', label: 'Calculators', icon: '🧮' },
            { id: 'resources', label: 'Resources', icon: '📂' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex-1 py-4 flex flex-col items-center justify-center transition-all relative ${
                activeView === tab.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
              {activeView === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide relative z-10 pb-32">
        {!selectedTopic ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Search Bar */}
            <div className="mb-8 relative">
              <input 
                type="text" 
                placeholder="SEARCH_ENGINEERING_DATA..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs focus:border-blue-500 outline-none transition-all pl-12 text-white placeholder:text-slate-600 font-bold"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {activeView === 'base' && (
              <div className="grid grid-cols-2 gap-4">
                {filteredBase.map(topic => (
                  <button 
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic)}
                    className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-left hover:border-blue-500/50 transition-all active:scale-95 group relative overflow-hidden"
                  >
                    <div className="text-4xl mb-4 transition-transform group-hover:scale-110 duration-300">{topic.icon}</div>
                    <div className="font-black text-[11px] uppercase text-white mb-1 leading-tight tracking-widest">{topic.title}</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed line-clamp-2">{topic.description}</div>
                    <div className="absolute -bottom-4 -right-4 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-0 group-hover:opacity-10">{topic.icon}</div>
                  </button>
                ))}
              </div>
            )}

            {activeView === 'tools' && (
              <div className="space-y-4">
                {interactiveTools.map(tool => (
                  <button 
                    key={tool.id}
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center space-x-5 hover:bg-white/10 transition-all text-left group"
                  >
                    <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-2xl border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] font-black text-white uppercase tracking-widest">{tool.title}</div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase">{tool.desc}</div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {activeView === 'resources' && (
              <div className="space-y-6">
                <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2.5rem] relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-[10px] font-black uppercase text-indigo-400 mb-2 tracking-[0.3em]">Premium_Resources</h4>
                    <p className="text-sm text-white font-black italic leading-relaxed mb-6">Access 500+ CAD drawings, IS Codes, and Site Checklists.</p>
                    <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">Explore Library</button>
                  </div>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['IS Codes', 'CAD Blocks', 'Site Forms', 'Video Library'].map(res => (
                    <div key={res} className="bg-white/5 border border-white/10 p-5 rounded-3xl text-center">
                      <div className="text-2xl mb-2">📄</div>
                      <div className="text-[10px] font-black text-white uppercase tracking-widest">{res}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="relative">
              <span className="text-6xl mb-6 block drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">{selectedTopic.icon}</span>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-3 italic leading-none">{selectedTopic.title}</h2>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mb-8 max-w-md">{selectedTopic.description}</p>
              <div className="h-[1px] bg-gradient-to-r from-blue-500/50 to-transparent w-full"></div>
            </div>

            <div className="space-y-8">
              {(selectedTopic.subcategories || []).map(sub => (
                <div key={sub.id} className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-[0.3em]">{sub.title}</h4>
                    <span className="text-[9px] text-slate-600 font-bold uppercase">{(sub.items || []).length} Units</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {(sub.items || []).map((item, i) => (
                      <button key={i} className="flex items-center space-x-4 p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all text-left group">
                        <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] text-slate-500 font-black group-hover:border-blue-500 group-hover:text-blue-500 transition-all">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <span className="text-xs font-black text-slate-300 group-hover:text-white uppercase tracking-wide">{item}</span>
                        <div className="ml-auto w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none">
        <div className="text-center opacity-20">
          <p className="text-[8px] mono font-black uppercase tracking-[0.5em]">CivilVision_Knowledge_Core_V2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Knowledge;
