// src/components/ui/connection-status.tsx
'use client';

import { useWebSocketStore } from '@/lib/websocket';

export function ConnectionStatus() {
  const isConnected = useWebSocketStore((state) => state.isConnected);

  return (
    <div className="fixed bottom-4 right-4">
      <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm ${
        isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        {isConnected ? 'Conectado' : 'Desconectado'}
      </div>
    </div>
  );
}