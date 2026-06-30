import React, { useRef, useState, useEffect } from 'react';
import heic2any from 'heic2any';
import { analyzeImage, getImageHash, getStoredCorrection } from '../services/gemini';
import { AnalysisResult } from '../types';
import { ChevronLeft, Upload, AlertCircle } from 'lucide-react';

interface UploadViewProps {
  onBack: () => void;
  onComplete: (result: AnalysisResult) => void;
}

const UploadView: React.FC<UploadViewProps> = ({ onBack, onComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing CivilVision Engine...");

  useEffect(() => {
    let interval: number;
    if (isProcessing && progress < 90) {
      interval = window.setInterval(() => {
        setProgress(p => Math.min(p + 1, 95));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isProcessing, progress]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    setStatusText("Initializing CivilVision Engine...");

    try {
      if (file.name.toLowerCase().endsWith('.heic')) {
        const converted = await heic2any({ blob: file, toType: 'image/jpeg' });
        file = new File([Array.isArray(converted) ? converted[0] : converted], "upload.jpg", { type: "image/jpeg" });
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
              onComplete({ id: Date.now().toString(), timestamp: Date.now(), image: imageData, imageHash: hash, data: { ...stored, isCorrection: true } });
            }, 300);
            return;
          }
          const data = await analyzeImage(base64, undefined, () => {
            setProgress(100);
            setStatusText("Streaming Engineering Intelligence...");
          });
          onComplete({ id: Date.now().toString(), timestamp: Date.now(), image: imageData, imageHash: hash, data });
        } catch (err: any) {
          console.error("Upload failed", err);
          let errMsg = "Upload analysis failed.";
          if (err?.message === 'QUOTA_EXCEEDED') {
            errMsg = "AI Consultant peak capacity. Try again in 60s.";
          } else if (err?.message) {
            errMsg = err.message;
          }
          setError(errMsg);
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("File processing error.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono">
      <div className="px-6 py-4 flex items-center justify-between bg-slate-900 border-b border-blue-500/20">
        <button onClick={onBack} className="p-2 text-slate-400"><ChevronLeft size={20} /></button>
        <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Feedback Link Protocol</span>
        <div className="w-8"></div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {isProcessing ? (
          <div className="w-full max-w-xs text-center">
            <div className="w-16 h-16 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-white font-black uppercase text-xs">{statusText}</h3>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-4">
              <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        ) : (
          <button onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-900 border-2 border-dashed border-blue-500/20 rounded-3xl p-12 flex flex-col items-center group hover:border-blue-500/50 transition-all">
            <Upload size={48} className="text-blue-500/30 mb-6 group-hover:text-blue-500 transition-colors" />
            <span className="text-white font-black uppercase text-xs tracking-widest">Select Site Documentation</span>
            <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded mt-4">CORRECTION TRACKING ACTIVE</span>
          </button>
        )}
        {error && (
          <div className="flex items-center space-x-2 text-red-500 text-[10px] mt-6 font-black uppercase">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.heic" onChange={handleFileUpload} />
    </div>
  );
};

export default UploadView;
