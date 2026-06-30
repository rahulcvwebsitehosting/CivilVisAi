import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Camera, Upload, Book, Settings, User, Clock, Shield, Activity, AlertTriangle } from 'lucide-react';
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
  const [selectedGrade, setSelectedGrade] = useState<number>(25);
  const [curingDays, setCuringDays] = useState<number>(7);
  
  const simulatedTemp = 36.4;
  const neuralLatency = isOffline ? "LOCAL" : "94ms";

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
    <div className="flex flex-col h-full overflow-y-auto scrollbar-hide relative">
      {/* Offline Alert Banner */}
      {isOffline && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="bg-amber-600/30 border-b border-amber-500/40 px-6 py-2.5 flex items-center justify-between text-amber-400"
        >
          <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-wider">
            <AlertTriangle size={14} className="animate-pulse" />
            <span>Local Inference Protocol Active (Offline Mode)</span>
          </div>
          <span className="text-[7px] bg-amber-500/20 px-2 py-0.5 rounded-full font-bold">CACHED</span>
        </motion.div>
      )}

      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-[80px] animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-pink-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="px-6 pt-10 pb-8 space-y-8 relative z-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-button rounded-xl flex items-center justify-center pulse-glow">
                  <span className="text-lg font-black text-white">CV</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tighter italic uppercase gradient-text">
                    CivilVision AI
                  </h1>
                  <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mt-0.5 flex items-center">
                    <Activity size={10} className="mr-1 animate-pulse" /> Core Engine v3.11 • IS 456 / IS 800
                  </p>
                </div>
              </div>
            </div>
            <button 
              onClick={onProfile}
              className="w-11 h-11 glass rounded-xl flex items-center justify-center text-slate-300 hover:scale-110 transition-transform pulse-glow"
            >
              <User size={18} />
            </button>
          </div>
        </motion.div>

        {/* Telemetry Dashboard */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-[8px] text-blue-400 uppercase font-black tracking-widest">GPU Thermal</div>
              <div className="text-lg font-black gradient-text mt-1">{simulatedTemp}°C</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="text-[8px] text-blue-400 uppercase font-black tracking-widest">Inference Link</div>
              <div className="text-lg font-black text-cyan-400 mt-1">{neuralLatency}</div>
            </div>
            <div className="text-center">
              <div className="text-[8px] text-blue-400 uppercase font-black tracking-widest">Accuracy Sync</div>
              <div className="text-lg font-black text-emerald-400 mt-1">98.4%</div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            onClick={onStart}
            className="gradient-button p-5 rounded-3xl text-left group cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="relative z-10">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-active:scale-90 transition-transform border border-white/20">
                <Camera className="text-white" size={20} />
              </div>
              <span className="text-white font-black uppercase text-xs tracking-widest block">Live Scan</span>
              <span className="text-[8px] text-blue-200 font-bold block mt-1 uppercase">Structural Cam</span>
            </div>
          </motion.button>

          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            onClick={onUpload}
            className="glass-card p-5 rounded-3xl text-left group cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-active:scale-90 transition-transform border border-white/10">
              <Upload className="text-blue-400" size={20} />
            </div>
            <span className="text-white font-black uppercase text-xs tracking-widest block">Upload Doc</span>
            <span className="text-[8px] text-slate-400 font-bold block mt-1 uppercase">Direct File Analysis</span>
          </motion.button>
        </div>

        {/* Compressive Strength Estimator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Shield size={64} className="text-blue-500" />
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1.5 h-3 rounded-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] gradient-text">Compressive Curing Curve (IS 456)</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[8px] text-slate-400 uppercase font-black block mb-1">Concrete Grade</label>
              <select 
                value={selectedGrade} 
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:border-blue-500 outline-none backdrop-blur-sm"
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
              <label className="text-[8px] text-slate-400 uppercase font-black block mb-1">Curing Duration ({curingDays}d)</label>
              <input 
                type="range" min="1" max="28" value={curingDays} 
                onChange={(e) => setCuringDays(Number(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2.5" 
              />
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex justify-between items-center">
            <div>
              <div className="text-[8px] text-slate-400 uppercase font-bold">Estimated Compressive Strength</div>
              <div className="text-lg font-black gradient-text mt-0.5">
                {calculatedStrength.value} <span className="text-[9px] text-blue-400 font-bold">MPa</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[8px] text-slate-400 uppercase font-bold">Total Gain</div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">{calculatedStrength.percentage}%</div>
            </div>
          </div>
        </motion.div>

        {/* Knowledge & Settings */}
        <div className="flex space-x-4">
          <button 
            onClick={onKnowledge}
            className="flex-1 glass-card py-4 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Book size={15} className="text-blue-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Engineering Manual</span>
          </button>
          <button 
            onClick={onSettings}
            className="flex-1 glass-card py-4 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Settings size={15} className="text-purple-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">Config Panel</span>
          </button>
        </div>

        {/* Inspection History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center">
              <Clock size={12} className="mr-2 text-blue-400" /> Recent Inspections
            </h3>
            <span className="text-[8px] text-blue-400 font-bold uppercase glass px-2 py-1 rounded">{history.length} RECORDS</span>
          </div>
          
          {history.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center">
              <div className="text-4xl mb-3 opacity-30">📂</div>
              <p className="text-xs text-slate-400 uppercase font-bold">No recent site data found</p>
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
                  className="w-full glass-card p-4 rounded-2xl flex items-center space-x-4 hover:scale-[1.01] active:scale-[0.99] text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden border border-white/10 glow-blue shrink-0">
                    <img src={item.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-white uppercase truncate">{item.data.elementName}</div>
                    <div className="text-[8px] text-slate-400 uppercase mt-1 truncate">
                      {new Date(item.timestamp).toLocaleDateString()} • {item.data.elementCategory}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${item.data.healthScore > 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {item.data.healthScore} PTS
                    </span>
                    <span className="text-[7px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">VIEW</span>
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
