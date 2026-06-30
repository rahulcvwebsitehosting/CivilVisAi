import React, { useState, useEffect } from 'react';
import { AppMode, UserRole, AnalysisResult } from './types';
import CameraInterface from './components/CameraInterface';
import Home from './components/Home';
import AnalysisView from './components/AnalysisView';
import Knowledge from './components/Knowledge';
import Settings from './components/Settings';
import UploadView from './components/UploadView';
import Profile from './components/Profile';
import { MOCK_ANALYSES } from './constants';
import { getOllamaApiKey } from './services/gemini';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [role, setRole] = useState<UserRole>(() => {
    return (localStorage.getItem('civilvision_role') as UserRole) || UserRole.STUDENT;
  });
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  
  const [history, setHistory] = useState<AnalysisResult[]>(() => {
    try {
      const saved = localStorage.getItem('civilvision_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load history", e);
    }
    return MOCK_ANALYSES;
  });

  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('civilvision_theme') as 'dark' | 'light') || 'dark';
  });
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    return localStorage.getItem('civilvision_offline') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('civilvision_history', JSON.stringify(history));
  }, [history]);

  const handleSetTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('civilvision_theme', newTheme);
  };

  const handleSetOffline = (offline: boolean) => {
    setIsOffline(offline);
    localStorage.setItem('civilvision_offline', String(offline));
  };

  const handleSetRole = (newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem('civilvision_role', newRole);
  };

  useEffect(() => {
    const checkKey = async () => {
      const envKey = getOllamaApiKey();
      let studioKey = false;
      try {
        if ((window as any).aistudio?.hasSelectedApiKey) {
          studioKey = await (window as any).aistudio.hasSelectedApiKey();
        }
      } catch (e) {
        console.warn("AI Studio Key check failed", e);
      }
      setHasApiKey(true);
    };
    checkKey();
    const interval = setInterval(checkKey, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenKeySelection = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      try {
        await (window as any).aistudio.openSelectKey();
        setHasApiKey(true);
      } catch (err) {
        console.error("Key selection failed:", err);
      }
    } else {
      alert("Billing setup required: Please ensure you are viewing this app via the authorized Vercel URL.");
    }
  };

  const startCamera = () => setMode(AppMode.ANALYSIS);
  const startUpload = () => setMode(AppMode.UPLOAD);
  const openKnowledge = () => setMode(AppMode.KNOWLEDGE);
  const openSettings = () => setMode(AppMode.SETTINGS);
  const openProfile = () => setMode(AppMode.PROFILE);
  
  const handleCaptureComplete = (result: AnalysisResult) => {
    setCurrentAnalysis(result);
    setHistory(prev => [result, ...prev]);
    setMode(AppMode.ANALYSIS);
  };

  const handleBack = () => {
    setCurrentAnalysis(null);
    setMode(AppMode.HOME);
  };

  if (!hasApiKey) {
    return (
      <div className="flex flex-col h-screen bg-slate-950 items-center justify-center p-8 text-center font-mono">
        <div className="blueprint-border p-10 max-w-sm w-full bg-slate-900/50 backdrop-blur-xl">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl shadow-2xl shadow-blue-500/20">📡</div>
          <h1 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">Neural Link Required</h1>
          <p className="text-[10px] text-slate-400 leading-relaxed mb-8 uppercase font-bold">To enable structural vision, connect your billing project.</p>
          <button onClick={handleOpenKeySelection} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-blue-500/30">Establish Secure Link</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-slate-950 text-white overflow-hidden font-sans ${theme === 'light' ? 'theme-light' : ''}`}>
      {mode === AppMode.HOME && (
        <Home onStart={startCamera} onUpload={startUpload} onKnowledge={openKnowledge} onSettings={openSettings} onProfile={openProfile} history={history} onSelectHistory={(item) => { setCurrentAnalysis(item); setMode(AppMode.ANALYSIS); }} isOffline={isOffline} />
      )}
      {mode === AppMode.ANALYSIS && !currentAnalysis && (
        <CameraInterface onBack={handleBack} onComplete={handleCaptureComplete} />
      )}
      {mode === AppMode.UPLOAD && (
        <UploadView onBack={handleBack} onComplete={handleCaptureComplete} />
      )}
      {mode === AppMode.ANALYSIS && currentAnalysis && (
        <AnalysisView key={currentAnalysis.id} analysis={currentAnalysis} onBack={handleBack} role={role} />
      )}
      {mode === AppMode.KNOWLEDGE && (
        <Knowledge onBack={handleBack} />
      )}
      {mode === AppMode.SETTINGS && (
        <Settings onBack={handleBack} role={role} setRole={handleSetRole} stats={{ analyses: history.length, saved: Math.max(1, history.length), days: Math.max(3, history.length * 4) }} theme={theme} setTheme={handleSetTheme} isOffline={isOffline} setIsOffline={handleSetOffline} />
      )}
      {mode === AppMode.PROFILE && (
        <Profile onBack={handleBack} />
      )}
    </div>
  );
};

export default App;
