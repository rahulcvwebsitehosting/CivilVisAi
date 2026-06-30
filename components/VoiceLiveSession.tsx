
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from '@google/genai';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CIVIL_ENGINEER_SYSTEM_PROMPT } from '../constants.ts';
import { decode, decodeAudioData, encode, getApiKey } from '../services/gemini.ts';
import { StructuralAnalysis, TranscriptionItem } from '../types.ts';

interface VoiceLiveSessionProps {
  context: StructuralAnalysis;
  initialPrompt: string;
}

const VoiceLiveSession: React.FC<VoiceLiveSessionProps> = ({ context, initialPrompt }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionItem[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const nextStartTimeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const stopSession = useCallback(() => {
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    streamRef.current?.getTracks().forEach(t => t.stop());
    sessionPromiseRef.current?.then(session => session.close());
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
  }, []);

  const startSession = async () => {
    try {
      // Fix: Use getApiKey() helper to initialize GoogleGenAI.
      const ai = new GoogleGenAI({ apiKey: getApiKey() });

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsListening(true);
            
            if (audioContextRef.current) {
              const source = audioContextRef.current.createMediaStreamSource(stream);
              const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`.
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              
              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContextRef.current.destination);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const uText = currentInputTranscriptionRef.current;
              const mText = currentOutputTranscriptionRef.current;
              if (uText || mText) {
                setTranscription(prev => [
                  ...prev, 
                  ...(uText ? [{ speaker: 'user' as const, text: uText }] : []),
                  ...(mText ? [{ speaker: 'model' as const, text: mText }] : [])
                ]);
              }
              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              setIsSpeaking(true);
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              // Do not use ctx.decodeAudioData for raw PCM streams.
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              });
              // Track end time for seamless playback.
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Gemini Live Error:', e);
            stopSession();
          },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          // Fix: Incorporate interaction context into the system instruction for the Live API.
          systemInstruction: CIVIL_ENGINEER_SYSTEM_PROMPT + `
            CONTEXT: You are inspecting ${context.elementName}.
            SITE TASK: ${initialPrompt}.
            SPECIFICATIONS: ${context.constructionMethodology?.concreteSpecs?.grade || 'M30'} Grade, ${context.constructionMethodology?.concreteSpecs?.shutteringType || 'Steel Shuttering'}.
            OBSERVED DEFECTS: ${JSON.stringify(context.defects)}.
            TONE: Technical, precise, site-ready mentor.`,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  const createBlob = (data: Float32Array): Blob => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  useEffect(() => {
    return () => {
      if (isActive) stopSession();
    };
  }, [isActive, stopSession]);

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 space-y-6 pb-40 mono">
      <div className="h-40 bg-slate-900 rounded-2xl border border-slate-800 relative flex items-center justify-center overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
        
        <div className="relative z-10 flex items-center justify-center space-x-[2px] w-full px-8">
            {[...Array(40)].map((_, i) => (
                <div 
                    key={i} 
                    className={`w-[2px] bg-blue-500 rounded-full transition-all duration-75 ${
                        isActive && (isSpeaking || isListening) ? 'animate-pulse' : 'h-1 opacity-20'
                    }`}
                    style={{ 
                        height: isActive && (isSpeaking || isListening) ? `${Math.random() * 80 + 10}%` : '4px',
                        transitionDelay: `${i * 0.01}s`,
                        filter: 'drop-shadow(0 0 5px #3b82f6)'
                    }}
                ></div>
            ))}
        </div>

        <div className="absolute top-2 left-2 text-[8px] text-blue-500 font-bold uppercase tracking-widest">Signal State: {isActive ? 'Established' : 'Offline'}</div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-950 px-3 py-0.5 rounded-full border border-slate-800">
            {isActive ? (isSpeaking ? 'Expert Output' : isListening ? 'Site Input Active' : 'Link Ready') : 'Link Disconnected'}
        </div>
      </div>

      {!isActive ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 bg-blue-600/10 rounded-3xl mb-8 flex items-center justify-center border-2 border-dashed border-blue-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-3 text-white">Live Engineering Consult</h3>
          <p className="text-slate-500 text-[10px] leading-relaxed max-w-xs mb-10 mono">
              Connect to the CivilVision AI neural engine for real-time voice consultation on structural defects and IS Code requirements.
          </p>
          <button 
            onClick={startSession}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-2xl shadow-blue-500/20"
          >
            <span>Initiate Link</span>
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2 scrollbar-hide">
          {transcription.map((t, idx) => (
            <div key={idx} className={`flex ${t.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-xl text-[11px] font-bold ${
                t.speaker === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                : 'bg-slate-900 text-slate-300 rounded-tl-none border border-slate-800'
              }`}>
                <div className="text-[8px] uppercase opacity-50 mb-1 tracking-widest">{t.speaker === 'user' ? 'Operator' : 'AI Consultant'}</div>
                {t.text}
              </div>
            </div>
          ))}
          
          <div className="fixed bottom-10 left-0 right-0 px-6 z-40 bg-gradient-to-t from-slate-950 pt-10 pb-4">
             <button 
                onClick={stopSession}
                className="w-full bg-slate-900 hover:bg-red-950/20 text-red-500 border border-red-900/30 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
             >
                Terminate Signal
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceLiveSession;
