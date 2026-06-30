
import React, { useState, useRef, useEffect } from 'react';
import { StructuralAnalysis } from '../types.ts';
import { CIVIL_ENGINEER_SYSTEM_PROMPT, LOCAL_ENGINEERING_FAQ } from '../constants.ts';
import { marked } from 'marked';
import { callOllama } from '../services/gemini.ts';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isLocal?: boolean;
}

interface EngineeringChatbotProps {
  context: StructuralAnalysis;
  onMessagesUpdate?: (messages: Message[]) => void;
}

const EngineeringChatbot: React.FC<EngineeringChatbotProps> = ({ context, onMessagesUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isEstablishingLink, setIsEstablishingLink] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Configure marked for safe links and basic structure
  useEffect(() => {
    marked.setOptions({
      gfm: true,
      breaks: true
    });
  }, []);

  // Store metadata locally so the Chatbot doesn't need the image again
  const metadataRef = useRef({
    elementName: context.elementName,
    grade: context.constructionMethodology?.concreteSpecs?.grade || 
           context.constructionMethodology?.machinerySpecs?.liftingCapacity || 'N/A',
    category: context.elementCategory,
    isManualCorrection: context.isCorrection || false,
    defects: (context.defects || []).map(d => d.type).join(', '),
    summary: context.executiveSummary?.brief || '',
    methodology: context.constructionMethodology?.methodSummary || ''
  });

  useEffect(() => {
    // Initial connection simulation
    const initTimer = setTimeout(() => {
      setIsEstablishingLink(false);
      const initialText = context.isCorrection 
        ? `Verified link for ${context.elementName} active. Submit technical queries.`
        : `AI Consultant ready. Technical mapping for ${context.elementName} complete.`;
      
      setMessages([{ 
        role: 'model', 
        text: initialText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);

    return () => clearTimeout(initTimer);
  }, [context.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (onMessagesUpdate) {
        onMessagesUpdate(messages);
    }
  }, [messages, isTyping, onMessagesUpdate]);

  const getLocalResponse = (query: string): string | null => {
    const q = query.toLowerCase();
    for (const [key, response] of Object.entries(LOCAL_ENGINEERING_FAQ)) {
      if (q.includes(key)) return response;
    }
    return null;
  };

  const handleSend = async (customInput?: string) => {
    const userMessage = (customInput || input).trim();
    if (!userMessage || isTyping) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage, timestamp: time }]);
    setIsTyping(true);

    const maxRetries = 2;
    let retryDelay = 2000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // REFINED CONSULTANT PROTOCOL INSTRUCTIONS
        const systemInstruction = CIVIL_ENGINEER_SYSTEM_PROMPT + `
        
        STRICT CHATBOT PROTOCOLS (MANDATORY):
        1. IGNORE REPORTING STANDARDS: Do NOT provide 250 words. Ignore the "WORD COUNT" and "SUMMARY STRUCTURE" rules from the base prompt.
        2. EXTREME BREVITY: Limit your response to a maximum of 1 or 2 sentences. Total word count must be under 30 words.
        3. NO EXPLANATIONS: Provide only the direct fact or value requested. Do NOT explain "why", "how", or provide historical/theoretical context.
        4. FIRST SENTENCE DIRECT ANSWER: Your very first sentence MUST be the direct technical answer. No greetings.
        5. FORBIDDEN HEADERS: Never use headers or formatting like '###', 'Summary', etc.
        6. NO MARKDOWN: Use plain text ONLY. No bold (**), italics (_), or lists.
        7. PARAMETER FOCUS: Give values and IS Code references only (e.g., 'Grade is M30 per IS 456 Table 2.').
        
        BACKGROUND CONTEXT (DO NOT REPEAT):
        - Current Element: ${metadataRef.current.elementName}
        - Current Grade/Spec: ${metadataRef.current.grade}
        - Detected Defects: ${metadataRef.current.defects}
        - Summary visible to user: ${metadataRef.current.summary}`;

        // Map existing history to Ollama message format
        const ollamaHistory = messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text
        }));
        ollamaHistory.push({ role: 'user', content: userMessage });

        const mText = await callOllama(ollamaHistory, undefined, systemInstruction);
        
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: mText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsTyping(false);
        setIsLocalMode(false);
        return; 

      } catch (err: any) {
        console.error(`Consultant Link Attempt ${attempt + 1} Failed:`, err);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }

        setIsLocalMode(true);
        const localResp = getLocalResponse(userMessage);
        const fallbackText = localResp 
          ? `[LOCAL] ${localResp}`
          : `[LOCAL] Remote link unstable. Standard IS codes for concrete and machinery are available.`;

        setMessages(prev => [...prev, { 
          role: 'model', 
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLocal: true
        }]);
      }
    }
    
    setIsTyping(false);
  };

  const renderMarkdown = (text: string) => {
    try {
      return { __html: marked.parse(text) };
    } catch (e) {
      return { __html: text };
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-sans relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 scrollbar-hide">
        {isEstablishingLink ? (
          <div className="flex justify-start">
            <div className="p-3 bg-slate-900 border border-blue-500/20 text-slate-400 rounded-2xl rounded-bl-none animate-pulse flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
              <span className="text-[10px] font-black uppercase tracking-widest mono">Syncing Consultant Link...</span>
            </div>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col w-full ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center space-x-2 mb-1.5 px-1">
                <span className={`text-[7px] font-black uppercase tracking-[0.2em] mono ${m.role === 'user' ? 'text-blue-500' : 'text-slate-400'}`}>
                   {m.role === 'user' ? 'Operator' : 'Consultant'}
                </span>
                <span className="text-[7px] font-black uppercase tracking-widest text-slate-600 mono">
                   {m.timestamp} {m.isLocal && "• LCL"}
                </span>
              </div>
              <div className={`p-4 text-[12px] shadow-2xl rounded-2xl max-w-[85%] font-medium leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : m.isLocal 
                    ? 'bg-orange-900/20 border border-orange-500/30 text-orange-200 rounded-tl-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
              }`}>
                <div 
                  className="chat-markdown"
                  dangerouslySetInnerHTML={renderMarkdown(m.text)}
                />
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex items-center space-x-2 px-2">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-150"></div>
            </div>
            <span className="text-blue-500 text-[9px] uppercase font-black tracking-widest mono">Consulting IS Codes...</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-950 border-t border-slate-900">
        <div className={`bg-slate-900 border border-blue-500/30 rounded-2xl px-3 py-1 flex items-center transition-all ${isTyping || isEstablishingLink ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isTyping || isEstablishingLink}
            placeholder={isLocalMode ? "Ask local query..." : "Query specific site parameter..."}
            className="flex-1 bg-transparent border-none outline-none text-xs py-2 px-2 text-white placeholder:text-slate-700"
          />
          <button onClick={() => handleSend()} disabled={isTyping || isEstablishingLink} className="p-2 text-blue-500 disabled:text-slate-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EngineeringChatbot;
