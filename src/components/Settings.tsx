import React from 'react';
import { UserRole } from '../types';
import { ChevronLeft, Shield, Moon, Sun, Wifi, WifiOff, BarChart3 } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  stats: { analyses: number; saved: number; days: number };
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack, role, setRole, stats, theme, setTheme, isOffline, setIsOffline }) => {
  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono overflow-y-auto scrollbar-hide">
      <div className="px-6 py-4 flex items-center justify-between bg-slate-900 border-b border-blue-500/20 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-400"><ChevronLeft size={20} /></button>
        <div className="text-center">
            <div className="text-[8px] text-blue-500 uppercase font-black tracking-[0.2em]">System Config</div>
            <div className="text-xs font-bold uppercase">Settings</div>
        </div>
        <div className="w-9"></div>
      </div>

      <div className="p-6 space-y-8">
        <section>
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4 flex items-center"><BarChart3 size={14} className="mr-2" /> Performance Metrics</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-center">
              <div className="text-xl font-black text-white">{stats.analyses}</div>
              <div className="text-[7px] text-slate-500 uppercase font-bold mt-1">Scans</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-center">
              <div className="text-xl font-black text-white">{stats.saved}</div>
              <div className="text-[7px] text-slate-500 uppercase font-bold mt-1">Saved</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-center">
              <div className="text-xl font-black text-white">{stats.days}</div>
              <div className="text-[7px] text-slate-500 uppercase font-bold mt-1">Days</div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4 flex items-center"><Shield size={14} className="mr-2" /> User Protocol</h3>
          <div className="flex flex-col space-y-2">
            {[UserRole.STUDENT, UserRole.INTERN, UserRole.ENGINEER].map(r => (
              <button key={r} onClick={() => setRole(r)} className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${role === r ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900/50 border-slate-800 text-slate-500'}`}>{r}</button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Interface Preferences</h3>
          <div className="flex space-x-3">
            <button onClick={() => setTheme('dark')} className={`flex-1 py-4 rounded-2xl border flex flex-col items-center space-y-2 transition-all ${theme === 'dark' ? 'bg-slate-900 border-blue-500 text-blue-500' : 'bg-slate-900/30 border-slate-800 text-slate-600'}`}><Moon size={20} /><span className="text-[8px] font-black uppercase">Dark Mode</span></button>
            <button onClick={() => setTheme('light')} className={`flex-1 py-4 rounded-2xl border flex flex-col items-center space-y-2 transition-all ${theme === 'light' ? 'bg-white border-blue-500 text-blue-500' : 'bg-slate-900/30 border-slate-800 text-slate-600'}`}><Sun size={20} /><span className="text-[8px] font-black uppercase">Light Mode</span></button>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Connectivity</h3>
          <button onClick={() => setIsOffline(!isOffline)} className={`w-full px-6 py-4 rounded-2xl border flex items-center justify-between transition-all ${isOffline ? 'bg-orange-500/10 border-orange-500/50 text-orange-500' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}>
            <div className="flex items-center space-x-3">{isOffline ? <WifiOff size={18} /> : <Wifi size={18} />}<span className="text-[10px] font-black uppercase tracking-widest">{isOffline ? 'Offline Mode Active' : 'Online Mode Active'}</span></div>
            <div className={`w-10 h-5 rounded-full relative transition-colors ${isOffline ? 'bg-orange-500' : 'bg-slate-800'}`}><div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isOffline ? 'right-1' : 'left-1'}`}></div></div>
          </button>
        </section>
      </div>
    </div>
  );
};

export default Settings;
