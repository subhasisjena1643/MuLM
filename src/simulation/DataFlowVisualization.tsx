// @ts-nocheck
// Canvas-based Data Flow Visualization
// Provides smooth animations for data particles flowing through workflow connections

import React, { useRef, useEffect, useCallback } from 'react';
import { SimulationConnection, DataFlowParticle, SimulationNode } from './RealTimeSimulationEngine';

interface DataFlowVisualizationProps {
  nodes: Map<string, SimulationNode>;
  connections: Map<string, SimulationConnection>;
  canvasWidth: number;
  canvasHeight: number;
  simulationSpeed: number;
  onParticleClick?: (particle: DataFlowParticle, connection: SimulationConnection) => void;
}

export const DataFlowVisualization: React.FC<DataFlowVisualizationProps> = ({
  nodes,
  connections,
  canvasWidth,
  canvasHeight,
  simulationSpeed,
  onParticleClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastFrameTime = useRef<number>(0);

  const drawConnection = useCallback((
    ctx: CanvasRenderingContext2D,
    sourceNode: SimulationNode,
    targetNode: SimulationNode,
    connection: SimulationConnection
  ) => {
    const startX = sourceNode.position.x + 100; // Node width
    const startY = sourceNode.position.y + 40; // Node height / 2
    const endX = targetNode.position.x;
    const endY = targetNode.position.y + 40;

    // Draw connection line
    ctx.strokeStyle = connection.active ? '#3b82f6' : '#6b7280';
    ctx.lineWidth = connection.active ? 3 : 2;
    ctx.setLineDash(connection.active ? [] : [5, 5]);
    
    ctx.beginPath();
    
    // Curved connection (Bezier curve)
    const controlPoint1X = startX + (endX - startX) * 0.5;
    const controlPoint1Y = startY;
    const controlPoint2X = startX + (endX - startX) * 0.5;
    const controlPoint2Y = endY;
    
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y, endX, endY);
    ctx.stroke();
    
    // Draw arrow at the end
    if (connection.active) {
      drawArrow(ctx, endX, endY, Math.atan2(endY - controlPoint2Y, endX - controlPoint2X));
    }
  }, []);

  const drawArrow = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number
  ) => {
    const arrowLength = 12;
    const arrowAngle = Math.PI / 6;
    
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x - arrowLength * Math.cos(angle - arrowAngle),
      y - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
      x - arrowLength * Math.cos(angle + arrowAngle),
      y - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
  }, []);

  const getPositionOnCurve = useCallback((
    sourceNode: SimulationNode,
    targetNode: SimulationNode,
    t: number
  ): { x: number; y: number } => {
    const startX = sourceNode.position.x + 100;
    const startY = sourceNode.position.y + 40;
    const endX = targetNode.position.x;
    const endY = targetNode.position.y + 40;
    
    const controlPoint1X = startX + (endX - startX) * 0.5;
    const controlPoint1Y = startY;
    const controlPoint2X = startX + (endX - startX) * 0.5;
    const controlPoint2Y = endY;
    
    // Cubic Bezier curve formula
    const x = Math.pow(1 - t, 3) * startX +
              3 * Math.pow(1 - t, 2) * t * controlPoint1X +
              3 * (1 - t) * Math.pow(t, 2) * controlPoint2X +
              Math.pow(t, 3) * endX;
              
    const y = Math.pow(1 - t, 3) * startY +
              3 * Math.pow(1 - t, 2) * t * controlPoint1Y +
              3 * (1 - t) * Math.pow(t, 2) * controlPoint2Y +
              Math.pow(t, 3) * endY;
    
    return { x, y };
  }, []);

  const drawParticle = useCallback((
    ctx: CanvasRenderingContext2D,
    particle: DataFlowParticle,
    connection: SimulationConnection
  ) => {
    const sourceNode = nodes.get(connection.source);
    const targetNode = nodes.get(connection.target);
    
    if (!sourceNode || !targetNode) return;
    
    const position = getPositionOnCurve(sourceNode, targetNode, particle.position);
    
    // Draw particle glow effect
    const gradient = ctx.createRadialGradient(
      position.x, position.y, 0,
      position.x, position.y, particle.size * 2
    );
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(0.7, particle.color + '80'); // 50% opacity
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(position.x, position.y, particle.size * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw particle core
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(position.x, position.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add sparkle effect for large data packets
    if (particle.size > 10) {
      drawSparkles(ctx, position.x, position.y, particle.size);
    }
  }, [nodes, getPositionOnCurve]);

  const drawSparkles = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) => {
    const sparkleCount = 4;
    const time = Date.now() * 0.005;
    
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2 + time;
      const sparkleX = x + Math.cos(angle) * (size + 5);
      const sparkleY = y + Math.sin(angle) * (size + 5);
      
      ctx.save();
      ctx.translate(sparkleX, sparkleY);
      ctx.rotate(angle);
      
      // Draw star shape
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(1, -1);
      ctx.lineTo(3, 0);
      ctx.lineTo(1, 1);
      ctx.lineTo(0, 3);
      ctx.lineTo(-1, 1);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-1, -1);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
  }, []);

  const drawNodeHighlight = useCallback((
    ctx: CanvasRenderingContext2D,
    node: SimulationNode
  ) => {
    if (node.status !== 'running') return;
    
    const time = Date.now() * 0.01;
    const pulseIntensity = (Math.sin(time) + 1) * 0.5; // 0 to 1
    
    // Draw pulsing border
    ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 + pulseIntensity * 0.5})`;
    ctx.lineWidth = 3 + pulseIntensity * 3;
    ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.roundRect(
      node.position.x - 5,
      node.position.y - 5,
      110,
      90,
      8
    );
    ctx.stroke();
    
    // Draw glow effect
    const gradient = ctx.createRadialGradient(
      node.position.x + 50, node.position.y + 40, 0,
      node.position.x + 50, node.position.y + 40, 60
    );
    gradient.addColorStop(0, `rgba(59, 130, 246, ${pulseIntensity * 0.3})`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(
      node.position.x - 10,
      node.position.y - 10,
      120,
      100,
      12
    );
    ctx.fill();
  }, []);

  const drawErrorIndicator = useCallback((
    ctx: CanvasRenderingContext2D,
    node: SimulationNode
  ) => {
    if (node.status !== 'error') return;
    
    const x = node.position.x + 85;
    const y = node.position.y + 15;
    
    // Draw error icon background
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw exclamation mark
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', x, y);
  }, []);

  const drawBreakpointIndicator = useCallback((
    ctx: CanvasRenderingContext2D,
    node: SimulationNode
  ) => {
    if (!node.breakpoint) return;
    
    const x = node.position.x + 15;
    const y = node.position.y + 15;
    
    // Draw breakpoint circle
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw inner dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const animate = useCallback((currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw connections
    connections.forEach((connection) => {
      const sourceNode = nodes.get(connection.source);
      const targetNode = nodes.get(connection.target);
      
      if (sourceNode && targetNode) {
        drawConnection(ctx, sourceNode, targetNode, connection);
        
        // Draw data flow particles
        connection.dataFlow.forEach((particle) => {
          drawParticle(ctx, particle, connection);
        });
      }
    });
    
    // Draw node highlights and indicators
    nodes.forEach((node) => {
      drawNodeHighlight(ctx, node);
      drawErrorIndicator(ctx, node);
      drawBreakpointIndicator(ctx, node);
    });
    
    lastFrameTime.current = currentTime;
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [canvasWidth, canvasHeight, nodes, connections, drawConnection, drawParticle, drawNodeHighlight, drawErrorIndicator, drawBreakpointIndicator]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onParticleClick) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if click is on a particle
    connections.forEach((connection) => {
      const sourceNode = nodes.get(connection.source);
      const targetNode = nodes.get(connection.target);
      
      if (!sourceNode || !targetNode) return;
      
      connection.dataFlow.forEach((particle) => {
        const position = getPositionOnCurve(sourceNode, targetNode, particle.position);
        const distance = Math.sqrt(
          Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2)
        );
        
        if (distance <= particle.size) {
          onParticleClick(particle, connection);
        }
      });
    });
  }, [connections, nodes, getPositionOnCurve, onParticleClick]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onClick={handleCanvasClick}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'auto',
        zIndex: 10
      }}
    />
  );
};
