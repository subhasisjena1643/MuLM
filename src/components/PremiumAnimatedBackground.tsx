import React, { useEffect, useRef } from 'react';

interface FloatingOrb {
  id: number;
  element: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export const PremiumAnimatedBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const orbsRef = useRef<FloatingOrb[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const elements: HTMLDivElement[] = [];
    const orbs: FloatingOrb[] = [];

    // Create static floating geometric elements
    for (let i = 0; i < 15; i++) {
      const element = document.createElement('div');
      const size = Math.random() * 60 + 20;
      
      element.style.position = 'absolute';
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.left = `${Math.random() * 100}%`;
      element.style.top = `${Math.random() * 100}%`;
      element.style.pointerEvents = 'none';
      element.style.opacity = '0.15';
      
      // More subtle shapes and styles inspired by Lovable
      if (i % 3 === 0) {
        element.style.borderRadius = '50%';
        element.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)';
        element.style.animation = `float 12s ease-in-out infinite ${Math.random() * 3}s`;
      } else if (i % 3 === 1) {
        element.style.borderRadius = '20%';
        element.style.background = 'linear-gradient(45deg, rgba(236, 72, 153, 0.06) 0%, rgba(239, 68, 68, 0.06) 100%)';
        element.style.transform = 'rotate(45deg)';
        element.style.animation = `breathe 8s ease-in-out infinite ${Math.random() * 3}s`;
      } else {
        element.style.borderRadius = '25%';
        element.style.background = 'linear-gradient(90deg, rgba(34, 197, 94, 0.06) 0%, rgba(59, 130, 246, 0.06) 100%)';
        element.style.animation = `pulse-slow 15s ease-in-out infinite ${Math.random() * 4}s`;
      }
      
      element.style.backdropFilter = 'blur(8px)';
      element.style.border = '1px solid rgba(255, 255, 255, 0.05)';
      
      container.appendChild(element);
      elements.push(element);
    }

    // Create dynamic floating orbs with physics
    for (let i = 0; i < 8; i++) {
      const element = document.createElement('div');
      const size = Math.random() * 40 + 15;
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      
      element.style.position = 'fixed';
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      element.style.pointerEvents = 'none';
      element.style.borderRadius = '50%';
      element.style.zIndex = '1';
      
      // Gradient orbs with different colors
      const gradients = [
        'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 100%)',
        'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.1) 50%, transparent 100%)',
        'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.1) 50%, transparent 100%)',
        'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%)',
      ];
      
      element.style.background = gradients[i % gradients.length];
      element.style.filter = 'blur(1px)';
      element.style.transition = 'all 0.3s ease-out';
      
      container.appendChild(element);
      elements.push(element);
      
      orbs.push({
        id: i,
        element,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size
      });
    }

    orbsRef.current = orbs;

    // Animation loop for floating orbs
    const animate = () => {
      orbs.forEach(orb => {
        // Update position
        orb.x += orb.vx;
        orb.y += orb.vy;
        
        // Bounce off edges
        if (orb.x <= 0 || orb.x >= window.innerWidth - orb.size) {
          orb.vx *= -1;
        }
        if (orb.y <= 0 || orb.y >= window.innerHeight - orb.size) {
          orb.vy *= -1;
        }
        
        // Keep in bounds
        orb.x = Math.max(0, Math.min(window.innerWidth - orb.size, orb.x));
        orb.y = Math.max(0, Math.min(window.innerHeight - orb.size, orb.y));
        
        // Apply position
        orb.element.style.left = `${orb.x}px`;
        orb.element.style.top = `${orb.y}px`;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      elements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Lovable-inspired gradient background with animations */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950/80">
        {/* Animated mesh gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30 dark:opacity-40 animate-gradient"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 50%)
            `,
            backgroundSize: '400% 400%'
          }} 
        />
        
        {/* Multiple ambient light effects with staggered animations */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-gradient-to-r from-indigo-400/10 to-transparent rounded-full blur-3xl animate-breathe" />
        
        {/* Additional ambient orbs */}
        <div className="absolute top-3/4 left-1/6 w-64 h-64 bg-gradient-to-r from-pink-400/10 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/6 right-1/3 w-80 h-80 bg-gradient-to-r from-cyan-400/8 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }} />
      </div>
      
      {/* Animated floating elements container */}
      <div ref={containerRef} className="relative w-full h-full" />
      
      {/* Animated grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] animate-shimmer"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.3) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Floating light particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
