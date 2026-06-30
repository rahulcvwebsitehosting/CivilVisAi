import React, { useEffect, useRef, useState } from 'react';

interface LiquidGlassLensProps {
  size?: number;
  refractionStrength?: number;
  chromaticStrength?: number;
  followPointer?: boolean;
  children?: React.ReactNode;
}

export const LiquidGlassLens: React.FC<LiquidGlassLensProps> = ({
  size = 300,
  refractionStrength = 30,
  chromaticStrength = 4,
  followPointer = true,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const rafRef = useRef<number>();
  const velocityRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  useEffect(() => {
    if (!followPointer || prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      targetRef.current = {
        x: e.clientX - rect.left - centerX,
        y: e.clientY - rect.top - centerY,
      };
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      targetRef.current = { x: 0, y: 0 };
    };

    // Smooth animation loop with inertia
    const animate = () => {
      const dampingFactor = 0.15;
      const dx = targetRef.current.x - position.x;
      const dy = targetRef.current.y - position.y;

      velocityRef.current.x += dx * dampingFactor;
      velocityRef.current.y += dy * dampingFactor;

      // Apply friction
      velocityRef.current.x *= 0.85;
      velocityRef.current.y *= 0.85;

      setPosition((prev) => ({
        x: prev.x + velocityRef.current.x,
        y: prev.y + velocityRef.current.y,
      }));

      rafRef.current = requestAnimationFrame(animate);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [followPointer, position, prefersReducedMotion]);

  const filterId = `liquid-glass-${Math.random().toString(36).substr(2, 9)}`;
  const displacementId = `displacement-${filterId}`;
  const chromaticRedId = `chromatic-red-${filterId}`;
  const chromaticCyanId = `chromatic-cyan-${filterId}`;

  return (
    <div
      ref={containerRef}
      className="liquid-glass-container relative w-full h-full overflow-hidden"
      style={{ minHeight: '600px' }}
    >
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0 pointer-events-none">
        <defs>
          {/* Radial displacement map for bulge effect */}
          <radialGradient id={displacementId}>
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#cccccc" />
            <stop offset="70%" stopColor="#808080" />
            <stop offset="100%" stopColor="#404040" />
          </radialGradient>

          {/* Main refraction filter with displacement */}
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            {/* Create displacement map */}
            <feImage
              xlinkHref={`#${displacementId}`}
              result="displacementMap"
              x="0"
              y="0"
              width="100%"
              height="100%"
            />
            <feGaussianBlur in="displacementMap" stdDeviation="8" result="blurredMap" />
            
            {/* Apply displacement to create refraction */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="blurredMap"
              scale={refractionStrength}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />

            {/* Add specular highlight */}
            <feSpecularLighting
              in="blurredMap"
              surfaceScale="8"
              specularConstant="1.5"
              specularExponent="20"
              lightingColor="#ffffff"
              result="specular"
            >
              <fePointLight x="50" y="30" z="200" />
            </feSpecularLighting>

            {/* Composite everything */}
            <feComposite in="displaced" in2="specular" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="final" />
            
            {/* Subtle blur for glass effect */}
            <feGaussianBlur in="final" stdDeviation="0.5" result="finalBlur" />
          </filter>

          {/* Chromatic aberration - Red channel */}
          <filter id={chromaticRedId} x="-50%" y="-50%" width="200%" height="200%">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />
            <feOffset dx={chromaticStrength} dy="0" result="redShift" />
          </filter>

          {/* Chromatic aberration - Cyan channel */}
          <filter id={chromaticCyanId} x="-50%" y="-50%" width="200%" height="200%">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="cyan"
            />
            <feOffset dx={-chromaticStrength} dy="0" result="cyanShift" />
          </filter>
        </defs>

        {/* Displacement gradient circle (used by feImage) */}
        <circle
          id={displacementId}
          cx="50%"
          cy="50%"
          r={size / 2}
          fill={`url(#${displacementId})`}
          opacity="0"
        />
      </svg>

      {/* Background layer (to be refracted) */}
      <div className="absolute inset-0 blueprint-background">
        {children || <BlueprintGrid />}
      </div>

      {/* Duplicated background for refraction layer */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          clipPath: `circle(${size / 2}px at calc(50% + ${position.x}px) calc(50% + ${position.y}px))`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            willChange: 'transform',
          }}
        >
          {/* Red channel layer */}
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              filter: `url(#${chromaticRedId}) url(#${filterId})`,
              opacity: 0.7,
            }}
          >
            {children || <BlueprintGrid />}
          </div>

          {/* Cyan channel layer */}
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              filter: `url(#${chromaticCyanId}) url(#${filterId})`,
              opacity: 0.7,
            }}
          >
            {children || <BlueprintGrid />}
          </div>
        </div>
      </div>

      {/* Lens glass overlay with specular highlights */}
      <div
        ref={lensRef}
        className={`liquid-lens absolute pointer-events-none ${!prefersReducedMotion && !isHovering ? 'idle-float' : ''}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
          willChange: 'transform',
          transition: prefersReducedMotion ? 'none' : undefined,
        }}
      >
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%)',
            filter: 'blur(20px)',
          }}
        />

        {/* Main glass surface */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), rgba(255,255,255,0.05) 50%, transparent 70%)',
            backdropFilter: 'blur(2px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: `
              inset 0 2px 20px rgba(255,255,255,0.3),
              inset 0 -2px 20px rgba(0,0,0,0.1),
              0 10px 40px rgba(0,0,0,0.3),
              0 0 80px rgba(100,200,255,0.2)
            `,
          }}
        />

        {/* Specular highlight */}
        <div
          className="absolute rounded-full"
          style={{
            width: '40%',
            height: '40%',
            top: '15%',
            left: '20%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent 60%)',
            filter: 'blur(10px)',
          }}
        />

        {/* Inner rim highlight */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid rgba(255,255,255,0.4)',
            boxShadow: 'inset 0 0 30px rgba(255,255,255,0.2)',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes idle-float {
          0%, 100% {
            transform: translate(calc(-50%), calc(-50%)) translateY(0px);
          }
          50% {
            transform: translate(calc(-50%), calc(-50%)) translateY(-10px);
          }
        }

        .idle-float {
          animation: idle-float 4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .idle-float {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

// Technical blueprint grid background component
const BlueprintGrid: React.FC = () => {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden">
      {/* Fine grid */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <pattern id="grid-small" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
          </pattern>
          <pattern id="grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#grid-small)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-large)" />
      </svg>

      {/* Structural elements */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <line x1="10%" y1="20%" x2="90%" y2="20%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="10 5" />
        <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="10 5" />
        <line x1="10%" y1="80%" x2="90%" y2="80%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="10 5" />
        
        <line x1="20%" y1="10%" x2="20%" y2="90%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="10 5" />
        <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="10 5" />
        <line x1="80%" y1="10%" x2="80%" y2="90%" stroke="#3b82f6" strokeWidth="2" strokeDasharray="10 5" />

        {/* Corner brackets */}
        <path d="M 15 15 L 15 35 M 15 15 L 35 15" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
        <path d="M 85 15 L 85 35 M 85 15 L 65 15" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" transform="translate(850, 0) scale(-1, 1)" />
        <path d="M 15 85 L 15 65 M 15 85 L 35 85" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" transform="translate(0, 850) scale(1, -1)" />
        <path d="M 85 85 L 85 65 M 85 85 L 65 85" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" transform="translate(850, 850) scale(-1, -1)" />
      </svg>

      {/* Scanning line animation */}
      <div className="scan-line absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30" />

      {/* Technical annotations */}
      <div className="absolute top-8 left-8 text-cyan-400 font-mono text-xs opacity-40">
        <div>GRID: 100MM × 100MM</div>
        <div className="mt-1">SCALE: 1:50</div>
      </div>

      <div className="absolute bottom-8 right-8 text-cyan-400 font-mono text-xs opacity-40 text-right">
        <div>STATUS: AI ACTIVE</div>
        <div className="mt-1">MODE: INSPECTION</div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: -10%;
            opacity: 0;
          }
          5% {
            opacity: 0.3;
          }
          95% {
            opacity: 0.3;
          }
          100% {
            top: 110%;
            opacity: 0;
          }
        }

        .scan-line {
          animation: scan 8s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .scan-line {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default LiquidGlassLens;
