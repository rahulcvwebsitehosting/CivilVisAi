import React, { useState } from 'react';
import { 
  ChevronLeft, User, Award, Calendar, MapPin, Mail, 
  ExternalLink, Briefcase, GraduationCap, Terminal, 
  Cpu, Layers, Globe, Code, FileText, Flame, BookOpen, 
  Sparkles, Binary, Settings, Activity, CheckCircle2, 
  ArrowRight, Linkedin, Github, Twitter, ChevronDown, 
  ChevronUp, Check, Play, Send, Layers2, MessageSquare,
  Wrench, Download, CpuIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileProps {
  onBack: () => void;
}

enum ActiveTab {
  WORKSTATION = 'workstation',
  TIMELINE = 'timeline',
  COGNITIVE_CORE = 'cognitive_core',
  LIVE_CONSOLE = 'live_console'
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.WORKSTATION);
  const [academicsExpanded, setAcademicsExpanded] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "sys_init: Initializing Rahul Shyam Workstation v2.6.0...",
    "kernel: Mounting local developer profile...",
    "network: Establishing links with portfolio platforms...",
    "status: Ready. Awaiting commands."
  ]);
  const [customCommand, setCustomCommand] = useState("");

  const runTerminalCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCommand.trim()) return;

    const cmd = customCommand.trim().toLowerCase();
    let response = `shyam@hostel-planner:~ $ ${cmd}\n`;

    if (cmd === "help") {
      response += "Available commands: help, clear, info, status, tech, skills, contact, wayfinder";
    } else if (cmd === "info") {
      response += "Rahul S. - Web Developer & Civil Engineering Innovator. Currently in Chennai, India. Dual brain focusing on software MVPs + structural geometry.";
    } else if (cmd === "status") {
      response += "SYSTEM: Online\nPROJECTS DEPLOYED: 40+ via Vercel\nWORKLOAD: Peak Performance\nCURRENT FOCUS: Browser Agents (Wayfinder)";
    } else if (cmd === "tech" || cmd === "skills") {
      response += "CORE MODULES:\n- React/Next.js: 100%\n- TypeScript: 100%\n- Tailwind CSS: 100%\n- Gemini API: 100%\n- Supabase: 93%\n- Node.js: 86%\n- Three.js: 60%";
    } else if (cmd === "contact") {
      response += "EMAIL: rahulcvfiitjee@gmail.com\nPORTFOLIO: https://rahulshyam-portfolio.vercel.app/\nGITHUB: rahulcvwebsitehosting";
    } else if (cmd === "wayfinder") {
      response += "WAYFINDER SYSTEM STATUS:\n- Platform: Chromium CDP / MCP\n- Privacy: Local First\n- Model Integration: Ollama & LM Studio (Native Local)\n- GitHub: Active Repository";
    } else if (cmd === "clear") {
      setTerminalLogs([]);
      setCustomCommand("");
      return;
    } else {
      response += `bash: command not found: ${cmd}. Type 'help' for options.`;
    }

    setTerminalLogs(prev => [...prev, response]);
    setCustomCommand("");
  };

  const handleQuickCommand = (cmd: string) => {
    setCustomCommand(cmd);
  };

  const academicEngagements = [
    { inst: "PSG College of Technology", type: "Paper Presentation & Workshop" },
    { inst: "Kongu Engineering College", type: "Technical Paper Presentation" },
    { inst: "KPR Institute of Engineering & Technology", type: "Workshop & Symposium" },
    { inst: "Sasurie College of Engineering", type: "Technical Paper Presentation" },
    { inst: "SRM Institute of Science & Technology (Chennai)", type: "Paper Presentation" },
    { inst: "Erode Sengunthar Engineering College", type: "National Conference & Presentations" },
    { inst: "Government College of Engineering", type: "Technical Engagement" },
    { inst: "Nandha Engineering College", type: "Technical Engagement" },
    { inst: "Velalar College of Engineering and Technology", type: "Technical Engagement" },
    { inst: "SSM College", type: "Technical Engagement" },
    { inst: "Government College of Technology", type: "Technical Engagement" },
    { inst: "Coimbatore Institute of Technology", type: "Technical Engagement" },
    { inst: "Sri Ramakrishna College of Engineering", type: "Technical Engagement" },
    { inst: "Bannari Amman Institute of Technology", type: "Technical Engagement" },
    { inst: "SNS College of Technology / Engineering", type: "Technical Engagement" },
    { inst: "Sri Krishna College of Technology", type: "Technical Engagement" }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono overflow-y-auto scrollbar-hide relative text-slate-100">
      {/* Drafting Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />

      {/* Header Bar */}
      <div className="px-6 py-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md border-b border-blue-500/20 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1">
          <ChevronLeft size={18} />
          <span className="text-[9px] uppercase tracking-wider font-bold">Close</span>
        </button>
        <div className="text-center">
          <div className="text-[8px] text-blue-500 uppercase font-black tracking-[0.25em]">Engineering-Focused Builder</div>
          <div className="text-xs font-bold uppercase tracking-tight text-white flex items-center justify-center">
            Rahul S <span className="mx-2 text-blue-500">•</span> Station v2.6
          </div>
        </div>
        <div className="text-[9px] text-blue-500/80 font-mono tracking-tighter bg-blue-950/50 border border-blue-500/30 px-3 py-1 rounded-md uppercase">
          LOC: Chennai 🇮🇳
        </div>
      </div>

      {/* Infinite Marquee Scrolling Banner */}
      <div className="overflow-hidden bg-blue-950/60 border-b border-blue-500/20 py-2 relative flex select-none font-mono text-[9px] tracking-[0.25em] font-black uppercase text-blue-400 z-10">
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
          className="flex whitespace-nowrap gap-12 shrink-0 pr-12"
        >
          {Array(8).fill("DESIGN • CODE • ENGINEER • SOLUTION • INNOVATE • BUILD").map((text, idx) => (
            <span key={idx} className="flex gap-12 items-center">
              <span>{text}</span>
            </span>
          ))}
        </motion.div>
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
          className="flex whitespace-nowrap gap-12 shrink-0 pr-12"
          aria-hidden="true"
        >
          {Array(8).fill("DESIGN • CODE • ENGINEER • SOLUTION • INNOVATE • BUILD").map((text, idx) => (
            <span key={idx} className="flex gap-12 items-center">
              <span>{text}</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        
        {/* Left Column: Personal Identity Plaque */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/60 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-xl">
            {/* Grid corner coordinates */}
            <div className="absolute top-2 left-2 text-[8px] text-slate-600 font-mono">[0,0]</div>
            <div className="absolute top-2 right-2 text-[8px] text-slate-600 font-mono">[40,0]</div>
            <div className="absolute bottom-2 left-2 text-[8px] text-slate-600 font-mono">[0,80]</div>
            
            {/* Photo & Identity */}
            <div className="flex flex-col items-center text-center mt-2">
              <div className="relative group">
                {/* Blueprint grid frame behind avatar */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-2 border-blue-500 bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center">
                  <span className="text-5xl">👨‍💻</span>
                </div>
                {/* Tech active status bubble */}
                <span className="absolute bottom-1 right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-slate-900 flex items-center justify-center text-[7px] text-white font-bold">OD</span>
                </span>
              </div>

              <h1 className="text-2xl font-black text-white mt-4 uppercase italic tracking-tighter">Rahul Shyam</h1>
              <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">
                CTO & Full-Stack Engineer
              </div>

              {/* Tagline */}
              <div className="mt-4 px-3 py-2 bg-blue-950/40 border border-blue-500/10 rounded-xl max-w-xs">
                <span className="text-xs italic text-blue-300">
                  "I don't just build websites — I engineer solutions."
                </span>
              </div>
            </div>

            {/* Quick bio metrics */}
            <div className="mt-6 space-y-3 pt-6 border-t border-slate-800 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-500 uppercase text-[9px] font-bold">Short Name:</span>
                <span className="text-white font-bold uppercase">Rahul S.</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-500 uppercase text-[9px] font-bold">Languages:</span>
                <span className="text-blue-300">English, Tamil, Hindi</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                <span className="text-slate-500 uppercase text-[9px] font-bold">Join Date:</span>
                <span className="text-white">April 2026 (X)</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 uppercase text-[9px] font-bold">Vercel Ships:</span>
                <span className="text-blue-400 font-bold">40+ Deployed MVPs</span>
              </div>
            </div>

            {/* Social Accounts list */}
            <div className="mt-6 space-y-2 pt-4 border-t border-slate-800">
              <div className="text-[8px] text-slate-500 uppercase font-black mb-2">Connected Channels</div>
              
              <a href="https://rahulshyam-portfolio.vercel.app/" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-xl bg-slate-950 hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/20 transition-all text-[11px]">
                <span className="flex items-center text-slate-300"><Globe size={13} className="mr-2 text-blue-500" /> Portfolio Website</span>
                <ExternalLink size={11} className="text-slate-500" />
              </a>

              <a href="https://github.com/rahulcvwebsitehosting" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-xl bg-slate-950 hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/20 transition-all text-[11px]">
                <span className="flex items-center text-slate-300"><Github size={13} className="mr-2 text-slate-400" /> GitHub Repo Host</span>
                <ExternalLink size={11} className="text-slate-500" />
              </a>

              <a href="https://linkedin.com/in/rahulshyamcivil" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-xl bg-slate-950 hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/20 transition-all text-[11px]">
                <span className="flex items-center text-slate-300"><Linkedin size={13} className="mr-2 text-blue-400" /> LinkedIn Profile</span>
                <ExternalLink size={11} className="text-slate-500" />
              </a>

              <a href="https://x.com/RahulShyamCV" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-xl bg-slate-950 hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/20 transition-all text-[11px]">
                <span className="flex items-center text-slate-300"><Twitter size={13} className="mr-2 text-sky-400" /> X Twitter Handle</span>
                <ExternalLink size={11} className="text-slate-500" />
              </a>

              <a href="https://threads.com/@rahulcvjps" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 rounded-xl bg-slate-950 hover:bg-blue-950/30 border border-slate-800 hover:border-blue-500/20 transition-all text-[11px]">
                <span className="flex items-center text-slate-300"><MessageSquare size={13} className="mr-2 text-pink-400" /> Threads Profile</span>
                <ExternalLink size={11} className="text-slate-500" />
              </a>
            </div>
          </div>

          {/* Self-Description plaque */}
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl relative">
            <div className="text-[8px] text-slate-500 uppercase font-black mb-2 flex items-center">
              <User size={10} className="mr-1 text-blue-500" /> Engineer Bio Summary
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              "I'm Rahul S, a web developer and engineering-focused builder who designs and develops intelligent, real-world web experiences. I combine clean UI, logical system thinking, and modern technology to solve practical problems."
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Terminal Dashboard */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Dashboard Tab Selector */}
          <div className="flex p-1 bg-slate-950 border border-blue-500/20 rounded-2xl sticky top-[68px] z-40 backdrop-blur-md">
            {[
              { id: ActiveTab.WORKSTATION, label: "Workstation", icon: Cpu },
              { id: ActiveTab.TIMELINE, label: "Experience/Edu", icon: Briefcase },
              { id: ActiveTab.COGNITIVE_CORE, label: "Cognitive Core", icon: Binary },
              { id: ActiveTab.LIVE_CONSOLE, label: "Wayfinder Console", icon: Terminal }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-2 rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Contents wrapper */}
          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                
                {/* TAB 1: WORKSTATION */}
                {activeTab === ActiveTab.WORKSTATION && (
                  <>
                    {/* Featured Projects Grid */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-[10px] text-blue-500 uppercase font-black tracking-widest flex items-center">
                          <Code size={14} className="mr-1.5" /> Featured Software Prototypes
                        </div>
                        <span className="text-[9px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          6 Active Pipelines
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            name: "AutoBOM",
                            status: "Live",
                            tech: "React, TypeScript, Gemini Vision",
                            desc: "AI-powered Bill of Materials generator that extracts construction information directly from drawings."
                          },
                          {
                            name: "Wayfinder",
                            status: "Desktop Application",
                            tech: "TypeScript, Chromium CDP, MCP",
                            desc: "Desktop browser agent supporting local LLMs."
                          },
                          {
                            name: "WebNav",
                            status: "Chrome Extension",
                            tech: "Vanilla JavaScript, Manifest V3",
                            desc: "Chrome extension enabling autonomous web browsing."
                          },
                          {
                            name: "Civilog",
                            status: "Live",
                            tech: "React, Supabase, RBAC",
                            desc: "College-wide On-Duty management platform serving over 2,000 students."
                          },
                          {
                            name: "GREnius",
                            status: "Live",
                            tech: "React, TypeScript, Chess Engine",
                            desc: "GRE preparation platform featuring cognitive games and chess-based learning."
                          },
                          {
                            name: "CivilVision AI",
                            status: "Live / Hackathon Winner",
                            tech: "React, Gemini API",
                            desc: "AI-powered civil engineering helpbook developed as a hackathon-winning project."
                          }
                        ].map((proj) => (
                          <div key={proj.name} className="bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/30 p-5 rounded-2xl relative transition-all group hover:bg-slate-900">
                            <div className="absolute top-3 right-3 flex items-center">
                              <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                proj.status.includes("Live") ? 'bg-green-950/50 text-green-400 border-green-500/20' : 'bg-blue-950/50 text-blue-400 border-blue-500/20'
                              }`}>
                                {proj.status}
                              </span>
                            </div>
                            <div className="text-[12px] font-black text-white uppercase group-hover:text-blue-400 transition-colors">
                              {proj.name}
                            </div>
                            <div className="text-[8px] text-blue-500 font-mono uppercase mt-1 mb-3">
                              {proj.tech}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {proj.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Domains Matrix */}
                    <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-3xl">
                      <div className="text-[10px] text-slate-500 uppercase font-black mb-3">Project Domain Map</div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { domain: "Construction Technology", proj: "AutoBOM" },
                          { domain: "Browser Agents", proj: "Wayfinder, WebNav" },
                          { domain: "Education Hubs", proj: "Civilog" },
                          { domain: "Cognitive Learning", proj: "GREnius" },
                          { domain: "Civil Engineering AI", proj: "CivilVision AI" }
                        ].map((dm, idx) => (
                          <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] flex items-center justify-between w-full md:w-[48%]">
                            <span className="text-slate-300 font-bold">{dm.domain}</span>
                            <span className="text-[8px] text-blue-400 font-mono uppercase bg-blue-950/30 px-2 py-0.5 rounded">
                              {dm.proj}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Services Offered */}
                    <div className="space-y-4">
                      <div className="text-[10px] text-blue-500 uppercase font-black tracking-widest flex items-center">
                        <Wrench size={14} className="mr-1.5" /> Professional Engineering Services
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            title: "Custom Web Dev",
                            desc: "Modern responsive websites tailored for business, ranging from landing pages to complex full-stack apps.",
                            ideal: "Startups, Brands"
                          },
                          {
                            title: "Engineering Engines",
                            desc: "Interactive learning platforms and custom visualizers that simplify complex engineering concepts.",
                            ideal: "EdTech, Founders"
                          },
                          {
                            title: "AI Integrations",
                            desc: "Intelligent software solutions automating workflows and solving practical issues using LLMs.",
                            ideal: "Productivity Apps"
                          }
                        ].map((srv, idx) => (
                          <div key={idx} className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl flex flex-col justify-between">
                            <div>
                              <div className="text-[11px] font-black text-white uppercase mb-1">{srv.title}</div>
                              <p className="text-[10px] text-slate-400 leading-relaxed mb-4">{srv.desc}</p>
                            </div>
                            <div className="text-[8px] text-blue-400 font-mono uppercase bg-blue-950/30 border border-blue-500/10 p-1.5 rounded text-center">
                              Target: {srv.ideal}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Build Architecture Chart */}
                    <div className="bg-blue-950/20 border border-blue-500/10 p-5 rounded-3xl relative">
                      <div className="text-[10px] text-blue-400 uppercase font-black mb-3">Development Workflow Architecture</div>
                      <div className="grid grid-cols-3 md:grid-cols-7 gap-2 items-center text-center text-[8px] font-mono uppercase font-black">
                        <div className="bg-slate-900 p-2 rounded-md border border-slate-800">Real Problem</div>
                        <div className="text-slate-600 hidden md:block">→</div>
                        <div className="bg-slate-900 p-2 rounded-md border border-slate-800">Sketch Path</div>
                        <div className="text-slate-600 hidden md:block">→</div>
                        <div className="bg-blue-900/50 p-2 rounded-md border border-blue-500/30 text-blue-300">Vite MVP</div>
                        <div className="text-slate-600 hidden md:block">→</div>
                        <div className="bg-slate-900 p-2 rounded-md border border-slate-800">Integrate AI</div>
                        <div className="text-slate-600 hidden md:block">→</div>
                        <div className="bg-slate-900 p-2 rounded-md border border-slate-800">Vercel Deploy</div>
                        <div className="text-slate-600 hidden md:block">→</div>
                        <div className="bg-slate-900 p-2 rounded-md border border-slate-800">Feedback Loop</div>
                        <div className="text-slate-600 hidden md:block">→</div>
                        <div className="bg-green-950/40 p-2 rounded-md border border-green-500/20 text-green-400">Stable Ship</div>
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 2: TIMELINE */}
                {activeTab === ActiveTab.TIMELINE && (
                  <div className="space-y-6">
                    {/* Double Timeline Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Experience Segment */}
                      <div className="space-y-4">
                        <div className="text-[10px] text-blue-500 uppercase font-black tracking-widest flex items-center">
                          <Briefcase size={14} className="mr-1.5" /> Professional Experience
                        </div>

                        <div className="relative border-l border-slate-800 pl-4 ml-2 space-y-6">
                          {/* Site Engineering Intern */}
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1.5 bg-blue-500 w-2.5 h-2.5 rounded-full ring-4 ring-slate-950"></span>
                            <div className="text-[11px] font-black uppercase text-white">Site Engineering Intern</div>
                            <div className="text-[9px] text-blue-400 font-mono uppercase">Tata Projects Limited <span className="text-slate-500">•</span> Jan 2025</div>
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
                              Lead site manager role at Chennai Underground Metro Project. Gained exposure to tunnel construction and guide wall execution inside complex underground transport infrastructure.
                            </p>
                          </div>

                          {/* BIM Intern */}
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1.5 bg-blue-500 w-2.5 h-2.5 rounded-full ring-4 ring-slate-950"></span>
                            <div className="text-[11px] font-black uppercase text-white">BIM Intern</div>
                            <div className="text-[9px] text-blue-400 font-mono uppercase">Pinnacle Future Build <span className="text-slate-500">•</span> June – July 2026</div>
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
                              Learned Autodesk Revit to production-level proficiency. Tasked with modeling a hostel project inside the active Pinnacle campus and contributing to documentation.
                            </p>
                          </div>

                          {/* Freelance Developer */}
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1.5 bg-slate-700 w-2.5 h-2.5 rounded-full ring-4 ring-slate-950"></span>
                            <div className="text-[11px] font-black uppercase text-white">Freelance Developer & Builder</div>
                            <div className="text-[9px] text-slate-500 font-mono uppercase">Independent <span className="text-slate-500">•</span> 2024 – Present</div>
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-2">
                              Architecting independent full-stack web applications and rapidly prototyping MVPs for private contractors, personal brands, and academic utility.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Education Segment */}
                      <div className="space-y-4">
                        <div className="text-[10px] text-blue-500 uppercase font-black tracking-widest flex items-center">
                          <GraduationCap size={14} className="mr-1.5" /> Formal Academics
                        </div>

                        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl relative">
                          <div className="text-white font-black text-xs uppercase">B.E. – Civil Engineering</div>
                          <div className="text-[9px] text-blue-400 font-mono uppercase mt-0.5">Erode Sengunthar Engineering College</div>
                          <div className="text-[9px] text-slate-400 mt-1">Duration: 2024 – 2028 (Second Year Status)</div>

                          <div className="mt-4 flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                            <div className="text-center">
                              <div className="text-blue-400 text-lg font-black font-mono">8.6</div>
                              <div className="text-[7px] text-slate-500 uppercase font-black">CGPA Score</div>
                            </div>
                            <div className="border-l border-slate-800 pl-3">
                              <p className="text-[9px] text-slate-400 leading-normal">
                                Applying civil engineering theory to educational interactive platforms and 3D web visualizations.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Study Philosophy Panel */}
                        <div className="bg-blue-950/20 border border-blue-500/10 p-4 rounded-2xl">
                          <div className="text-[8px] text-blue-400 uppercase font-black mb-1">Study Philosophy</div>
                          <p className="text-[10px] italic text-blue-300">
                            "True learning happens when theory meets application. I learn best by building tools that visualize the abstract."
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Academic Engagements (Research paper listings across Tamil Nadu) */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5">
                      <button 
                        onClick={() => setAcademicsExpanded(!academicsExpanded)}
                        className="flex items-center justify-between w-full text-left focus:outline-none"
                      >
                        <span className="text-[10px] text-white uppercase font-black flex items-center">
                          <Award size={14} className="mr-1.5 text-blue-500" /> 
                          Academic Engagements & Research ({academicEngagements.length} Institutions)
                        </span>
                        {academicsExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </button>

                      <p className="text-[10px] text-slate-400 mt-2">
                        Active participant across Tamil Nadu's engineering ecosystem through research, technical paper presentations, workshops, conferences, and symposiums.
                      </p>

                      <AnimatePresence>
                        {academicsExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-2 overflow-hidden"
                          >
                            {academicEngagements.map((item, idx) => (
                              <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-2">
                                <span className="text-[9px] text-blue-500 font-bold font-mono mt-0.5">{String(idx+1).padStart(2, '0')}.</span>
                                <div>
                                  <div className="text-[10px] text-slate-200 font-bold">{item.inst}</div>
                                  <div className="text-[8px] text-slate-500 uppercase tracking-wider">{item.type}</div>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* TAB 3: COGNITIVE CORE */}
                {activeTab === ActiveTab.COGNITIVE_CORE && (
                  <div className="space-y-6">
                    {/* Tech Proficiency Bars */}
                    <div>
                      <div className="text-[10px] text-blue-500 uppercase font-black tracking-widest flex items-center mb-4">
                        <CpuIcon size={14} className="mr-1.5" /> Technical Skill Proficiency
                      </div>

                      <div className="space-y-3 bg-slate-900/50 border border-slate-800 p-5 rounded-3xl">
                        {[
                          { name: "React / Next.js", level: 100, color: "from-blue-600 to-sky-500" },
                          { name: "TypeScript", level: 100, color: "from-blue-500 to-indigo-600" },
                          { name: "Tailwind CSS", level: 100, color: "from-cyan-500 to-blue-500" },
                          { name: "Gemini API", level: 100, color: "from-indigo-500 to-purple-600" },
                          { name: "Supabase Integration", level: 93, color: "from-emerald-500 to-teal-600" },
                          { name: "Node.js Engine", level: 86, color: "from-green-500 to-emerald-600" },
                          { name: "Three.js / 3D Visualization", level: 60, color: "from-orange-500 to-red-600" }
                        ].map((skill, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-slate-300 font-bold uppercase">{skill.name}</span>
                              <span className="text-blue-400 font-black">{skill.level}%</span>
                            </div>
                            <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.level}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className={`h-full bg-gradient-to-r ${skill.color}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Core Principles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        {
                          title: "Concept-First",
                          desc: "Deeply understanding first principles before beginning implementation. No shortcuts."
                        },
                        {
                          title: "Logical Flow",
                          desc: "Mapping data paths visually, structurally, and blueprinting system states proactively."
                        },
                        {
                          title: "Application",
                          desc: "Converting abstract mathematical and engineering concepts directly into usable code."
                        }
                      ].map((cp, idx) => (
                        <div key={idx} className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
                          <div className="text-[8px] text-blue-500 font-mono mb-1">0{idx+1} / PRINCIPLE</div>
                          <div className="text-[11px] font-black text-white uppercase mb-1.5">{cp.title}</div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">{cp.desc}</p>
                        </div>
                      ))}
                    </div>

                    {/* Hackathon Edge */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4">
                      <div className="text-[10px] text-white uppercase font-black flex items-center">
                        <Flame size={14} className="mr-1.5 text-blue-500" /> Hackathon Competitive Edge
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                        <div className="space-y-2">
                          <div className="font-bold text-slate-300">Squad Leadership & Architecture</div>
                          <p className="text-slate-400 leading-normal">
                            Frequently leads technical squads to design fully functional MVPs under intense 24-48 hour hackathon environments. Handles frontend rendering, layout design, and backend bridges.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="font-bold text-slate-300">Rapid Proto Toolkit</div>
                          <div className="flex flex-wrap gap-1.5">
                            {["React", "Node.js", "Firebase", "Tailwind CSS", "Vite", "Gemini AI", "Framer Motion"].map((tk) => (
                              <span key={tk} className="bg-slate-950 border border-slate-800 text-[8px] font-mono text-blue-400 px-2 py-0.5 rounded-md">
                                {tk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: LIVE CONSOLE */}
                {activeTab === ActiveTab.LIVE_CONSOLE && (
                  <div className="space-y-6">
                    {/* Console log outputs */}
                    <div className="bg-slate-950 border border-blue-500/20 rounded-3xl p-5 font-mono text-xs text-blue-400 flex flex-col min-h-[300px] relative">
                      <div className="absolute top-2 right-4 text-[8px] text-slate-600">SYS_CONSOLE_STDOUT</div>
                      <div className="flex-1 space-y-2 max-h-[250px] overflow-y-auto scrollbar-hide">
                        {terminalLogs.map((log, idx) => (
                          <div key={idx} className="whitespace-pre-wrap leading-normal">
                            {log.startsWith("shyam@") ? (
                              <span className="text-green-500">{log}</span>
                            ) : log.startsWith("[LOG]") ? (
                              <span className="text-slate-300">{log}</span>
                            ) : log.startsWith("Available") || log.startsWith("CORE") || log.startsWith("SYSTEM") || log.startsWith("WAYFINDER") ? (
                              <span className="text-cyan-400">{log}</span>
                            ) : (
                              <span className="text-slate-400">{log}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Command Prompt */}
                      <form onSubmit={runTerminalCommand} className="mt-4 pt-4 border-t border-slate-800 flex items-center">
                        <span className="text-green-500 mr-2 shrink-0">shyam@hostel-planner:~ $</span>
                        <input 
                          type="text" 
                          value={customCommand}
                          onChange={(e) => setCustomCommand(e.target.value)}
                          placeholder="Type 'help' to examine modules..."
                          className="bg-transparent text-white border-none outline-none focus:ring-0 flex-1 min-w-0"
                        />
                        <button type="submit" className="text-blue-500 hover:text-blue-400 shrink-0">
                          <Send size={14} />
                        </button>
                      </form>
                    </div>

                    {/* Quick helper links for console */}
                    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
                      <div className="text-[9px] text-slate-500 uppercase font-black mb-2">Diagnostic Presets</div>
                      <div className="flex flex-wrap gap-2">
                        {["help", "status", "tech", "wayfinder"].map((cmd) => (
                          <button
                            key={cmd}
                            onClick={() => handleQuickCommand(cmd)}
                            className="bg-slate-950 border border-slate-800 hover:border-blue-500/30 text-[9px] font-mono text-slate-400 px-3 py-1 rounded-xl transition-all"
                          >
                            execute: "{cmd}"
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Threads Activity Digest */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4">
                      <div className="text-[10px] text-white uppercase font-black flex items-center">
                        <Activity size={14} className="mr-1.5 text-pink-500" /> Wayfinder Open-Source Dev Logs (Threads Highlight)
                      </div>

                      <div className="border-l-2 border-pink-500/30 pl-4 space-y-3 text-[11px]">
                        <div className="space-y-1">
                          <div className="text-slate-500 text-[8px]">POSTED IN RECENT CORRESPONDENCE</div>
                          <p className="text-slate-300 leading-relaxed">
                            "Building an open-source Chromium-based browser agent called Wayfinder. It features native AI assistant integration with support for local LLMs via Ollama & LM Studio, alongside traditional cloud APIs."
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400 uppercase pt-2 font-mono">
                          <div className="flex items-center"><CheckCircle2 size={10} className="mr-1.5 text-green-500" /> Privacy-First Architecture</div>
                          <div className="flex items-center"><CheckCircle2 size={10} className="mr-1.5 text-green-500" /> Self-Hostable Release</div>
                          <div className="flex items-center"><CheckCircle2 size={10} className="mr-1.5 text-green-500" /> Zero Vendor Lock-In</div>
                          <div className="flex items-center"><CheckCircle2 size={10} className="mr-1.5 text-green-500" /> GitHub Code Repository</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="w-full mt-12 py-8 bg-slate-950 border-t border-slate-900/80 text-center z-10 text-[9px] text-slate-500 uppercase tracking-widest font-mono">
        <div>Rahul Shyam Portfolio Framework © 2026. Built with Vite, React, and Gemini AI.</div>
        <div className="mt-1 text-slate-600">Dual Core Engineer: Structural Blueprinting + Frontend Sprints</div>
      </div>
    </div>
  );
};

export default Profile;

