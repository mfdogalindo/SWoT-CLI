'use client';

import { useEffect } from 'react';
import { useWebSocketStore } from '@/lib/websocket';

export function WebSocketProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { connect } = useWebSocketStore();

  useEffect(() => {
    connect();

    return () => {
      useWebSocketStore.getState().disconnect();
    };
  }, [connect]);

  return <>{children}</>;
}