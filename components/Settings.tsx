
import React, { useState, useEffect } from 'react';
import { UserRole, StructuralAnalysis } from '../types.ts';

interface SettingsProps {
  onBack: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  stats: {
    analyses: number;
    saved: number;
    days: number;
  };
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  isOffline: boolean;
  setIsOffline: (val: boolean) => void;
}

interface StoredCorrection {
  data: StructuralAnalysis;
  timestamp: number;
}

const Settings: React.FC<SettingsProps> = ({ 
  onBack, role, setRole, stats, theme, setTheme, isOffline, setIsOffline 
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'ai' | 'branding' | 'memory'>('account');
  const [corrections, setCorrections] = useState<Record<string, StoredCorrection>>({});
  
  // User Preferences
  const [userName, setUserName] = useState('Rahul Shyam');
  const [userEmail, setUserEmail] = useState('rahulcvfiitjee@gmail.com');
  const [location, setLocation] = useState('Chennai, India');
  const [specialization, setSpecialization] = useState('Metro & Tunnel Engineering');
  const [aiVoice, setAiVoice] = useState('Friendly');
  const [aiDepth, setAiDepth] = useState('Intermediate');

  useEffect(() => {
    const db = JSON.parse(localStorage.getItem('civilvision_correction_memory') || '{}');
    setCorrections(db);
  }, []);

  const deleteCorrection = (hash: string) => {
    if (window.confirm("Delete this verified correction? The AI will revert to original predictions for this image.")) {
      const db = { ...corrections };
      delete db[hash];
      localStorage.setItem('civilvision_correction_memory', JSON.stringify(db));
      setCorrections(db);
    }
  };

  const clearAllCorrections = () => {
    if (window.confirm("CRITICAL: Wipe all learned corrections from memory?")) {
      localStorage.removeItem('civilvision_correction_memory');
      setCorrections({});
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'ai', label: 'AI & Voice', icon: '🗣️' },
    { id: 'branding', label: 'Branding', icon: '🌐' },
    { id: 'memory', label: 'Memory', icon: '🧠' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-800 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl border-b border-white/5 relative z-10">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="text-center">
          <div className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] mb-0.5">System_Config_V3</div>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">Settings Console</h1>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-slate-900/30 border-b border-white/5 overflow-x-auto scrollbar-hide relative z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[100px] py-4 flex flex-col items-center justify-center transition-all relative ${
              activeTab === tab.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-lg mb-1">{tab.icon}</span>
            <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide relative z-10 pb-32">
        
        {/* Account & Profile */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] mx-auto mb-4 flex items-center justify-center text-3xl shadow-2xl shadow-blue-500/20 border-4 border-white/5">
                🏗️
              </div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1">{userName}</h2>
              <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6">{specialization}</p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                  <div className="text-[8px] text-slate-500 font-black uppercase mb-1">Analyses</div>
                  <div className="text-lg font-black text-white">{stats.analyses}</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                  <div className="text-[8px] text-slate-500 font-black uppercase mb-1">Saved</div>
                  <div className="text-lg font-black text-white">{stats.saved}</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                  <div className="text-[8px] text-slate-500 font-black uppercase mb-1">Uptime</div>
                  <div className="text-lg font-black text-white">{stats.days}d</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">Identity_Parameters</h3>
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Full Name</span>
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-transparent text-right text-[11px] font-black text-white uppercase outline-none"
                  />
                </div>
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                  <input 
                    type="text" 
                    value={userEmail} 
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="bg-transparent text-right text-[11px] font-black text-white lowercase outline-none"
                  />
                </div>
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                  <input 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    className="bg-transparent text-right text-[11px] font-black text-white uppercase outline-none"
                  />
                </div>
                <div className="p-5 flex items-center justify-between">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">User Role</span>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="bg-slate-900 text-blue-400 text-[10px] font-black uppercase outline-none border border-white/10 px-3 py-1.5 rounded-xl"
                  >
                    <option value={UserRole.STUDENT}>Student</option>
                    <option value={UserRole.PROFESSIONAL}>Professional</option>
                    <option value={UserRole.INTERN}>Intern</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appearance */}
        {activeTab === 'appearance' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">Visual_Interface</h3>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Theme Mode</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Toggle between light and dark optics</div>
                  </div>
                  <div className="flex bg-slate-900 rounded-xl p-1 border border-white/10">
                    <button 
                      onClick={() => setTheme('dark')} 
                      className={`px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${theme === 'dark' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
                    >
                      Dark
                    </button>
                    <button 
                      onClick={() => setTheme('light')} 
                      className={`px-4 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${theme === 'light' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
                    >
                      Light
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Offline Sync</div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase">Enable local structural intelligence</div>
                  </div>
                  <button 
                    onClick={() => setIsOffline(!isOffline)}
                    className={`w-14 h-7 rounded-full relative transition-all duration-300 ${isOffline ? 'bg-green-600 shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'bg-slate-800'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${isOffline ? 'left-8' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl">
              <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-2 italic">Interface Protocol</h4>
              <p className="text-[9px] text-slate-400 leading-relaxed font-bold italic">
                The UI adapts dynamically to your selection. High-contrast mode is automatically enabled for field inspections in direct sunlight.
              </p>
            </div>
          </div>
        )}

        {/* AI & Voice */}
        {activeTab === 'ai' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">Neural_Voice_Config</h3>
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
                <div className="space-y-3">
                  <div className="text-[11px] font-black text-white uppercase tracking-widest">AI Personality</div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Professional', 'Friendly', 'Academic', 'Concise'].map(p => (
                      <button 
                        key={p}
                        onClick={() => setAiVoice(p)}
                        className={`py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          aiVoice === p ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="text-[11px] font-black text-white uppercase tracking-widest">Explanation Depth</div>
                  <div className="flex bg-slate-900 rounded-xl p-1 border border-white/10">
                    {['Basic', 'Intermediate', 'Advanced'].map(d => (
                      <button 
                        key={d}
                        onClick={() => setAiDepth(d)}
                        className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all ${
                          aiDepth === d ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Branding & Online Presence */}
        {activeTab === 'branding' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border border-blue-500/30 rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <div className="text-[40px] rotate-12">🌐</div>
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Rahul Shyam</h3>
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] mb-6">Civil Engineer & Developer</p>
              
              <p className="text-xs text-slate-300 leading-relaxed font-medium italic mb-8">
                "Bridging the gap between structural integrity and digital innovation. Specialized in Metro & Tunnel Engineering (TBM)."
              </p>

              <div className="flex justify-center gap-4">
                <a href="https://www.linkedin.com/in/rahulshyamcivil/" target="_blank" className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">LinkedIn</a>
                <a href="https://rahulshyam-portfolio.vercel.app/" target="_blank" className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Portfolio</a>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 px-2">Featured_Projects</h3>
              <div className="space-y-3">
                {[
                  { title: "CivilVision AI", desc: "Multi-modal AI for structural inspection.", icon: "🏗️" },
                  { title: "TunnelViz 3D", desc: "Interactive TBM operation visualizer.", icon: "🚇" },
                  { title: "IPL Auction Game", desc: "Real-time multiplayer strategy arena.", icon: "🏏" }
                ].map((p, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-xl">{p.icon}</div>
                    <div>
                      <div className="text-[11px] font-black text-white uppercase tracking-widest">{p.title}</div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase">{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Memory Bank */}
        {activeTab === 'memory' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Correction Memory</h3>
                {Object.keys(corrections).length > 0 && (
                  <button onClick={clearAllCorrections} className="text-[9px] text-red-500 font-black uppercase hover:underline">Wipe All</button>
                )}
              </div>
              
              <div className="space-y-3">
                {(Object.entries(corrections) as [string, StoredCorrection][]).map(([hash, item]) => (
                  <div key={hash} className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black text-white uppercase italic">{item.data.elementName}</div>
                      <div className="text-[8px] text-slate-500 mono uppercase">Hash: {hash.substring(0, 10)}...</div>
                    </div>
                    <button 
                      onClick={() => deleteCorrection(hash)}
                      className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
                {Object.keys(corrections).length === 0 && (
                  <div className="text-center py-12 opacity-20">
                    <div className="text-4xl mb-3">🧠</div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Neural memory is currently empty</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none">
        <div className="text-center opacity-30">
          <p className="text-[8px] mono font-black uppercase tracking-[0.5em]">Rahul Shyam - CivilVision AI - 2026</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
