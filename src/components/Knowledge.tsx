import React, { useState } from 'react';
import { KNOWLEDGE_BASE } from '../constants';
import { KnowledgeTopic } from '../types';
import { ChevronLeft, Search, BookOpen, ExternalLink } from 'lucide-react';

interface KnowledgeProps {
  onBack: () => void;
}

const Knowledge: React.FC<KnowledgeProps> = ({ onBack }) => {
  const [selectedTopic, setSelectedTopic] = useState<KnowledgeTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBase = KNOWLEDGE_BASE.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden font-mono">
      <div className="px-6 py-4 flex items-center justify-between bg-slate-900 border-b border-blue-500/20 sticky top-0 z-30">
        <button onClick={selectedTopic ? () => setSelectedTopic(null) : onBack} className="p-2 -ml-2 text-slate-400"><ChevronLeft size={20} /></button>
        <div className="text-center">
            <div className="text-[8px] text-blue-500 uppercase font-black tracking-[0.2em]">Engineering Core</div>
            <div className="text-xs font-bold uppercase">{selectedTopic ? selectedTopic.title : 'Knowledge Base'}</div>
        </div>
        <div className="w-9"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {!selectedTopic ? (
          <>
            <div className="mb-8 relative">
                <input type="text" placeholder="SEARCH_ENGINEERING_DATA..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:border-blue-500 outline-none transition-all pl-10" />
                <Search className="h-4 w-4 absolute left-3 top-3.5 text-slate-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {filteredBase.map(topic => (
                    <button key={topic.id} onClick={() => setSelectedTopic(topic)} className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl text-left hover:border-blue-500 transition-all active:scale-95 group relative overflow-hidden">
                        <div className="text-3xl mb-3">{topic.icon}</div>
                        <div className="font-black text-[10px] uppercase text-white mb-1 leading-tight">{topic.title}</div>
                        <div className="text-[8px] text-slate-500 uppercase leading-relaxed line-clamp-2">{topic.description}</div>
                        <div className="absolute -bottom-2 -right-2 opacity-5 scale-150 rotate-12 transition-transform group-hover:rotate-0">{topic.icon}</div>
                    </button>
                ))}
            </div>

            <div className="mt-10 p-6 bg-blue-900/10 border border-blue-900/20 rounded-3xl relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-[10px] font-black uppercase text-blue-400 mb-2 tracking-widest">System Recommendation</h4>
                    <p className="text-xs text-slate-300 font-bold leading-relaxed mb-4">You haven't viewed 'IS 456 - RCC Design' in a while. Would you like a refresher?</p>
                    <button className="text-[10px] bg-blue-600 px-4 py-2 rounded-lg font-black uppercase tracking-widest">Start Module</button>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            </div>
          </>
        ) : (
          <div className="space-y-8 pb-10">
            <div>
                <span className="text-4xl mb-4 block">{selectedTopic.icon}</span>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2">{selectedTopic.title}</h2>
                <p className="text-xs text-slate-500 uppercase leading-relaxed mb-6">{selectedTopic.description}</p>
                <div className="h-[1px] bg-slate-800 w-full"></div>
            </div>

            <div className="space-y-6">
                {(selectedTopic.subcategories || []).map(sub => (
                    <div key={sub.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden">
                        <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                            <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-widest">{sub.title}</h4>
                            <span className="text-[8px] text-slate-600">{(sub.items || []).length} MODULES</span>
                        </div>
                        <div className="p-4 grid grid-cols-1 gap-2">
                            {(sub.items || []).map((item, i) => (
                                <button key={i} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group">
                                    <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-bold group-hover:border-blue-500 group-hover:text-blue-500">{i+1}</div>
                                    <span className="text-xs font-bold text-slate-300 group-hover:text-white">{item}</span>
                                    <ExternalLink className="h-3 w-3 ml-auto text-slate-700 group-hover:text-blue-500" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Knowledge;
