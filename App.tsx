
import React, { useState, useEffect } from 'react';
import { AppMode, UserRole, AnalysisResult } from './types.ts';
import CameraInterface from './components/CameraInterface.tsx';
import Home from './components/Home.tsx';
import AnalysisView from './components/AnalysisView.tsx';
import Knowledge from './components/Knowledge.tsx';
import Settings from './components/Settings.tsx';
import UploadView from './components/UploadView.tsx';
import { MOCK_ANALYSES } from './constants.ts';
import { getOllamaApiKey, getOllamaBaseUrl } from './services/gemini.ts';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>(MOCK_ANALYSES);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = async () => {
      const envKey = getOllamaApiKey();
      const baseUrl = getOllamaBaseUrl();
      const isLocalOllama = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
      
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

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, [theme]);

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
  const openProfile = () => setMode(AppMode.SETTINGS);
  
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
      <div className="flex flex-col h-screen bg-theme-main items-center justify-center p-8 text-center font-mono">
        <div className="blueprint-border p-10 max-w-sm w-full bg-theme-card/50 backdrop-blur-xl">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl shadow-2xl shadow-blue-500/20">
            📡
          </div>
          <h1 className="text-xl font-black text-theme-main uppercase italic tracking-tighter mb-4">Neural Link Required</h1>
          <p className="text-[10px] text-theme-muted leading-relaxed mb-8 uppercase font-bold">
            To enable structural vision, click below to connect your Google Cloud billing project.
          </p>
          <button 
            onClick={handleOpenKeySelection}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-blue-500/30"
          >
            Establish Secure Link
          </button>
          <div className="mt-6 flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-[8px] text-theme-muted uppercase font-black">Ready for Initialization</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-theme-main text-theme-main overflow-hidden font-sans`}>
      {isOffline && (
        <div className="bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest py-1 text-center sticky top-0 z-[100]">
          Offline Mode Active - Limited Structural Intelligence
        </div>
      )}

      {mode === AppMode.HOME && (
        <Home 
          onStart={startCamera} 
          onUpload={startUpload}
          onKnowledge={openKnowledge}
          onSettings={openSettings}
          onProfile={openProfile}
          history={history}
          onSelectHistory={(item) => {
            setCurrentAnalysis(item);
            setMode(AppMode.ANALYSIS);
          }}
        />
      )}

      {mode === AppMode.ANALYSIS && !currentAnalysis && (
        <CameraInterface 
          onBack={handleBack} 
          onComplete={handleCaptureComplete} 
        />
      )}

      {mode === AppMode.UPLOAD && (
        <UploadView 
          onBack={handleBack} 
          onComplete={handleCaptureComplete} 
        />
      )}

      {mode === AppMode.ANALYSIS && currentAnalysis && (
        <AnalysisView 
          key={currentAnalysis.id}
          analysis={currentAnalysis} 
          onBack={handleBack} 
          role={role}
        />
      )}

      {mode === AppMode.KNOWLEDGE && (
        <Knowledge onBack={handleBack} />
      )}

      {mode === AppMode.SETTINGS && (
        <Settings 
          onBack={handleBack} 
          role={role} 
          setRole={setRole} 
          stats={{ analyses: history.length, saved: 5, days: 12 }}
          theme={theme}
          setTheme={setTheme}
          isOffline={isOffline}
          setIsOffline={setIsOffline}
        />
      )}
    </div>
  );
};

export default App;
