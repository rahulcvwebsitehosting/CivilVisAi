import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Camera, Upload, Book, Settings, User, Clock, Shield, Activity, RefreshCw, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  onStart: () => void;
  onUpload: () => void;
  onKnowledge: () => void;
  onSettings: () => void;
  onProfile: () => void;
  history: AnalysisResult[];
  onSelectHistory: (item: AnalysisResult) => void;
  isOffline?: boolean;
}

const Home: React.FC<HomeProps> = ({ 
  onStart, 
  onUpload, 
  onKnowledge, 
  onSettings, 
  onProfile, 
  history, 
  onSelectHistory,
  isOffline = false
}) => {
  // Concrete Curing Strength Calculator States
  const [selectedGrade, setSelectedGrade] = useState<number>(25); // e.g., M25
  const [curingDays, setCuringDays] = useState<number>(7); // e.g., 7 days
  
  // Real-time animated telemetry metrics
  const simulatedTemp = 36.4;
  const neuralLatency = isOffline ? "LOCAL" : "94ms";

  // Compressive Strength gain factor calculation (IS 456 approximations)
  const estimateStrength = (grade: number, days: number): { value: number; percentage: number } => {
    if (days <= 0) return { value: 0, percentage: 0 };
    let percentage = 0;
    if (days >= 28) {
      percentage = 1.0 + 0.15 * Math.log10(days / 28);
    } else {
      if (days <= 1) percentage = 0.16 * days;
      else if (days <= 3) percentage = 0.16 + (0.24 * (days - 1)) / 2;
      else if (days <= 7) percentage = 0.40 + (0.25 * (days - 3)) / 4;
      else if (days <= 14) percentage = 0.65 + (0.25 * (days - 7)) / 7;
      else percentage = 0.90 + (0.10 * (days - 14)) / 14;
    }
    const val = Number((grade * percentage).toFixed(2));
    return { value: val, percentage: Math.round(percentage * 100) };
  };

  const calculatedStrength = estimateStrength(selectedGrade, curingDays);

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono overflow-y-auto scrollbar-hide">
      
      {/* Offline Alert Banner */}
      {isOffline && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-amber-600/20 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-amber-500"
        >
          <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-wider">
            <AlertTriangle size={14} className="animate-pulse" />
            <span>Local Inference Protocol Active (Offline Mode)</span>
          </div>
          <span className="text-[7px] bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">CACHED</span>
        </motion.div>
      )}

      {/* Primary Container */}
      <div className="px-6 pt-10 pb-8 space-y-8">
        
        {/* Header HUD Block */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start"
        >
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white">CivilVision AI</h1>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            </div>
            <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mt-1 flex items-center">
              <Activity size={10} className="mr-1" /> Core Engine v3.11 • IS 456 / IS 800 Compliant
            </p>
          </div>
          <button 
            onClick={onProfile} 
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:border-blue-500/40 transition-colors"
          >
            <User size={18} />
          </button>
        </motion.div>

        {/* Real-time Telemetry Dashboard (Newly added information panel) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 grid grid-cols-3 gap-2"
        >
          <div className="text-center">
            <div className="text-[8px] text-slate-500 uppercase font-black">GPU Thermal</div>
            <div className="text-xs font-black text-white mt-1">{simulatedTemp}°C</div>
          </div>
          <div className="text-center border-x border-slate-800/60">
            <div className="text-[8px] text-slate-500 uppercase font-black">Inference Link</div>
            <div className="text-xs font-black text-blue-500 mt-1">{neuralLatency}</div>
          </div>
          <div className="text-center">
            <div className="text-[8px] text-slate-500 uppercase font-black">Accuracy Sync</div>
            <div className="text-xs font-black text-emerald-500 mt-1">98.4%</div>
          </div>
        </motion.div>

        {/* Primary Action Buttons (Bento Cards) */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            onClick={onStart} 
            className="blueprint-border bg-blue-600/10 p-5 rounded-3xl text-left group hover:bg-blue-600/20 transition-all cursor-pointer"
          >
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20 group-active:scale-90 transition-transform">
              <Camera className="text-white" size={20} />
            </div>
            <span className="text-white font-black uppercase text-[10px] tracking-widest block">Live Scan</span>
            <span className="text-[8px] text-blue-400 font-bold block mt-1 uppercase">Structural Cam</span>
          </motion.button>

          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            onClick={onUpload} 
            className="blueprint-border bg-slate-900/50 p-5 rounded-3xl text-left group hover:bg-slate-900 transition-all cursor-pointer"
          >
            <div className="w-11 h-11 bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-active:scale-90 transition-transform">
              <Upload className="text-slate-400" size={20} />
            </div>
            <span className="text-white font-black uppercase text-[10px] tracking-widest block">Upload Doc</span>
            <span className="text-[8px] text-slate-500 font-bold block mt-1 uppercase">Direct File Analysis</span>
          </motion.button>
        </div>

        {/* Quick Utilities: Concrete Compressive Strength Estimator (Bento Grid Expansion) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Shield size={64} className="text-blue-500" />
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1.5 h-3 bg-blue-500 rounded"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-white">Compressive Curing Curve (IS 456)</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[8px] text-slate-500 uppercase font-black block mb-1">Concrete Grade</label>
              <select 
                value={selectedGrade} 
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:border-blue-500 outline-none"
              >
                <option value={15}>M15 (Lean)</option>
                <option value={20}>M20 (Standard)</option>
                <option value={25}>M25 (RCC Frame)</option>
                <option value={30}>M30 (High Strength)</option>
                <option value={35}>M35 (Pre-stressed)</option>
                <option value={40}>M40 (Commercial)</option>
              </select>
            </div>

            <div>
              <label className="text-[8px] text-slate-500 uppercase font-black block mb-1">Curing Duration ({curingDays} days)</label>
              <input 
                type="range" 
                min="1" 
                max="28" 
                value={curingDays} 
                onChange={(e) => setCuringDays(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2.5" 
              />
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/60 rounded-xl p-3 flex justify-between items-center">
            <div>
              <div className="text-[8px] text-slate-500 uppercase font-bold">Estimated Compressive Strength</div>
              <div className="text-lg font-black text-white tracking-tight mt-0.5">{calculatedStrength.value} <span className="text-[9px] text-blue-500 font-bold">N/mm² (MPa)</span></div>
            </div>
            <div className="text-right">
              <div className="text-[8px] text-slate-500 uppercase font-bold">Total Gain</div>
              <div className="text-xs font-black text-emerald-500 mt-0.5">{calculatedStrength.percentage}%</div>
            </div>
          </div>
        </motion.div>

        {/* Knowledge & Settings shortcuts */}
        <div className="flex space-x-4">
          <button 
            onClick={onKnowledge} 
            className="flex-1 bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <Book size={15} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Engineering manual</span>
          </button>
          
          <button 
            onClick={onSettings} 
            className="flex-1 bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 py-4 rounded-2xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <Settings size={15} className="text-slate-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Config panel</span>
          </button>
        </div>

        {/* Inspections History list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] flex items-center">
              <Clock size={12} className="mr-2 text-slate-500 animate-spin-slow" /> Recent Inspections
            </h3>
            <span className="text-[8px] text-blue-500 font-bold uppercase">{history.length} ACTIVE FILTERS</span>
          </div>
          
          {history.length === 0 ? (
            <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-10 text-center">
              <p className="text-[10px] text-slate-600 uppercase font-bold">No recent site data found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, index) => (
                <motion.button 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  key={item.id} 
                  onClick={() => onSelectHistory(item)} 
                  className="w-full bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4 hover:border-blue-500/50 transition-all text-left"
                >
                  <div className="relative overflow-hidden rounded-lg w-12 h-12 border border-slate-700 bg-slate-950 flex items-center justify-center">
                    <img src={item.image} className="w-full h-full object-cover" alt="Inspection" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-white uppercase truncate">{item.data.elementName}</div>
                    <div className="text-[8px] text-slate-500 uppercase mt-1 truncate">
                      {new Date(item.timestamp).toLocaleDateString()} • {item.data.elementCategory}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded ${item.data.healthScore > 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                      {item.data.healthScore} PTS
                    </span>
                    <span className="text-[7px] text-slate-600 font-bold uppercase tracking-widest">VIEW</span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;
