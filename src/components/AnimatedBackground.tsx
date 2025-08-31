import React from 'react';

interface ParticleProps {
  delay?: number;
  duration?: number;
  size?: number;
  color?: string;
}

const Particle: React.FC<ParticleProps> = ({ 
  delay = 0, 
  duration = 20, 
  size = 4, 
  color = 'rgba(59, 130, 246, 0.5)' 
}) => {
  const style = {
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    left: `${Math.random() * 100}%`,
  };

  return (
    <div
      className="absolute rounded-full animate-particle"
      style={style}
    />
  );
};

export const AnimatedBackground: React.FC = () => {
  const particles = Array.from({ length: 50 }, (_, i) => (
    <Particle
      key={i}
      delay={Math.random() * 20}
      duration={15 + Math.random() * 10}
      size={2 + Math.random() * 4}
      color={`rgba(${59 + Math.random() * 100}, ${130 + Math.random() * 100}, 246, ${0.2 + Math.random() * 0.3})`}
    />
  ));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_50%)]" />
      </div>
      <div className="relative h-full">
        {particles}
      </div>
    </div>
  );
};
