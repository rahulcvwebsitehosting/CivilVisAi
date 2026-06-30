import React, { useRef, useState, useEffect } from 'react';
import { analyzeImage, getImageHash, getStoredCorrection } from '../services/gemini';
import { AnalysisResult } from '../types';
import { X, Camera, AlertTriangle } from 'lucide-react';

interface CameraInterfaceProps {
  onBack: () => void;
  onComplete: (result: AnalysisResult) => void;
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({ onBack, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing CivilVision Engine...");
  const lastCaptureTimeRef = useRef<number>(0);

  useEffect(() => {
    let interval: number;
    if (isProcessing && progress < 90) {
      interval = window.setInterval(() => {
        setProgress(p => Math.min(p + 1, 95));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isProcessing, progress]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 } },
          audio: false 
        });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        setError('CRITICAL: CAMERA_ACCESS_DENIED');
      }
    };
    startCamera();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, []);

  const handleCapture = async () => {
    const now = Date.now();
    if (now - lastCaptureTimeRef.current < 2000) return;
    lastCaptureTimeRef.current = now;

    if (!videoRef.current || !canvasRef.current || isProcessing) return;
    setIsProcessing(true);
    setProgress(0);
    setStatusText("Initializing CivilVision Engine...");
    setError(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.5);
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
        
        const result = await analyzeImage(base64, undefined, () => {
          setProgress(100);
          setStatusText("Streaming Engineering Intelligence...");
        });
        
        onComplete({ id: Date.now().toString(), timestamp: Date.now(), image: imageData, imageHash: hash, data: result });
      } catch (err: any) {
        console.error("Camera capture analysis failed:", err);
        let errMsg = "SITE_SCAN_FAILED";
        if (err?.message === 'QUOTA_EXCEEDED') {
          errMsg = "AI Consultant peak capacity. Try again in 60s.";
        } else if (err?.message) {
          errMsg = err.message;
        }
        setError(errMsg);
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden flex flex-col font-mono">
      {isProcessing && (
        <div className="absolute inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-16 h-16 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <h2 className="text-sm font-black text-white uppercase italic tracking-tighter">{statusText}</h2>
          <div className="w-full max-w-xs bg-slate-900 h-1 rounded-full overflow-hidden mt-4">
            <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
      <video ref={videoRef} autoPlay playsInline className="flex-1 w-full object-cover" />
      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center z-50">
        <button onClick={handleCapture} className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-8 border-slate-400/30 shadow-2xl active:scale-95 transition-all">
          <div className="w-14 h-14 border-2 border-slate-900 rounded-full bg-slate-100 flex items-center justify-center">
             <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
          </div>
        </button>
      </div>
      <button onClick={onBack} className="absolute top-6 left-6 z-50 bg-black/40 p-3 rounded-xl border border-white/10 text-white"><X size={20} /></button>
      {error && (
        <div className="absolute top-24 left-6 right-6 z-50 bg-red-950/80 border border-red-500/30 p-4 rounded-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center space-x-3">
             <AlertTriangle className="text-red-500" size={20} />
             <p className="text-[10px] text-red-200 font-black uppercase tracking-tight leading-tight">{error}</p>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraInterface;
