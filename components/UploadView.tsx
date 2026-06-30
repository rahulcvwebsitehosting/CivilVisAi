
import React, { useRef, useState, useEffect } from 'react';
import heic2any from 'heic2any';
import { analyzeImage, getImageHash, getStoredCorrection } from '../services/gemini.ts';
import { AnalysisResult } from '../types.ts';

interface UploadViewProps {
  onBack: () => void;
  onComplete: (result: AnalysisResult) => void;
}

const UploadView: React.FC<UploadViewProps> = ({ onBack, onComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing CivilVision Flash Engine...");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let interval: number;
    if (isProcessing && progress < 90) {
      interval = window.setInterval(() => {
        setProgress(p => Math.min(p + 1, 95));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isProcessing, progress]);

  const processFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setStatusText("Initializing CivilVision Flash Engine...");

    const isHeic = file.name.toLowerCase().endsWith('.heic');
    try {
      let finalFile = file;
      if (isHeic) {
        setStatusText("Converting HEIC Format...");
        const converted = await heic2any({ blob: file, toType: 'image/jpeg' });
        finalFile = new File([Array.isArray(converted) ? converted[0] : converted], "upload.jpg", { type: "image/jpeg" });
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result as string;
        const base64 = imageData.split(',')[1];
        
        try {
          const hash = await getImageHash(base64);
          
          const stored = getStoredCorrection(hash);
          if (stored) {
            setStatusText("Memory Hit. Loading Verified Data...");
            setProgress(100);
            setTimeout(() => {
              onComplete({ 
                id: Date.now().toString(), 
                timestamp: Date.now(), 
                image: imageData, 
                imageHash: hash, 
                data: { ...stored, isCorrection: true }
              });
            }, 300);
            return;
          }

          const data = await analyzeImage(base64, undefined, () => {
            setProgress(100);
            setStatusText("Streaming Engineering Intelligence...");
          });
          
          onComplete({ id: Date.now().toString(), timestamp: Date.now(), image: imageData, imageHash: hash, data });
        } catch (err: any) {
          console.error("Upload analysis failed:", err);
          if (err?.message === 'QUOTA_EXCEEDED' || err?.status === 429) {
            setError("AI Consultant peak capacity. Please try again in 60s.");
          } else {
            setError("Upload analysis failed.");
          }
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(finalFile);
    } catch (err) {
      setError("File processing error.");
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    } else {
      setError("Please drop a valid image file.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-sans overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl border-b border-white/5 relative z-10">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="text-center">
          <div className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em] mb-0.5">Data_Ingestion</div>
          <h1 className="text-sm font-black text-white uppercase tracking-widest">Upload Center</h1>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        {isProcessing ? (
          <div className="w-full max-w-sm text-center animate-in fade-in zoom-in duration-500">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
              <div 
                className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"
                style={{ animationDuration: '1.5s' }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">📡</div>
            </div>
            
            <h3 className="text-white font-black uppercase text-sm tracking-widest mb-2 italic">{statusText}</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-6">Neural Synchronization in Progress</p>
            
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-right">
              <span className="text-[10px] font-black text-blue-500 mono">{progress}%</span>
            </div>
          </div>
        ) : (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full max-w-md aspect-square rounded-[3rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-12 text-center group relative overflow-hidden ${
              isDragging 
                ? 'bg-blue-600/10 border-blue-500 scale-105 shadow-2xl shadow-blue-500/20' 
                : 'bg-slate-900/50 border-white/10 hover:border-blue-500/50 hover:bg-slate-900/80'
            }`}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
            
            <div className={`w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-3xl mb-6 transition-transform duration-500 ${isDragging ? 'scale-110 rotate-12' : 'group-hover:scale-110 group-hover:-rotate-6'}`}>
              📂
            </div>
            
            <h3 className="text-white font-black uppercase text-lg tracking-tighter italic mb-2">
              {isDragging ? "Drop to Analyze" : "Select Documentation"}
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8">
              Drag and drop site photos here or click to browse your local storage.
            </p>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-600/20"
            >
              Browse Files
            </button>
            
            <div className="mt-8 flex items-center space-x-3 opacity-40">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Supports: JPG, PNG, HEIC</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2">
            <span className="text-lg">⚠️</span>
            <span className="text-[10px] text-red-500 font-black uppercase tracking-widest">{error}</span>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,.heic" 
        onChange={handleFileUpload} 
      />

      {/* Footer Info */}
      <div className="p-8 text-center opacity-20 relative z-10">
        <p className="text-[8px] mono font-black uppercase tracking-[0.5em]">Secure_Cloud_Ingestion_Protocol_Active</p>
      </div>
    </div>
  );
};

export default UploadView;
