// src/components/ui/floor-plan.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useWebSocketStore } from '@/lib/websocket';
import { drawFloorPlan, drawPeople, drawActuators } from '@/lib/drawing';

interface FloorPlanProps {
  className?: string;
}

export function FloorPlan({ className }: FloorPlanProps) {
  const { sensors, actuators, connect } = useWebSocketStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar todo el plano
    drawFloorPlan(ctx);
    drawPeople(ctx, Array.from(sensors.values()));
    drawActuators(ctx, Array.from(actuators.values()));
  }, [sensors, actuators]);

  return (
    <div className={className}>
      <canvas 
        ref={canvasRef}
        width={1340}
        height={580}
        className="border border-gray-300 rounded-lg shadow-lg"
      />
    </div>
  );
}