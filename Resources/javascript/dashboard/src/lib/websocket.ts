// src/lib/websocket.ts
import { create } from 'zustand';
import { SensorData, ActuatorData } from '@/types';
import { v4 as uuidv4 } from 'uuid'

interface WebSocketStore {
  sensors: Map<string, SensorData>;
  actuators: Map<string, ActuatorData>;
  personLocations: Map<string, string>; 
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
  clearOldData: () => void;
  getLastUpdate: (sensorId: string) => Date | null;
}

const STALE_DATA_THRESHOLD = 30000; // 30 segundos

export const useWebSocketStore = create<WebSocketStore>((set, get) => ({
  sensors: new Map(),
  actuators: new Map(),
  personLocations: new Map(),
  isConnected: false,

  connect: () => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000');

    ws.onopen = () => {
      console.log('Connected to server');
      set({ isConnected: true });
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch(message.type) {
        case 'sensor_update': {
          const sensorData = message.data;
          
          set((state) => {
            const newSensors = new Map(state.sensors);
            const newPersonLocations = new Map(state.personLocations);

            // Actualizar el sensor
            newSensors.set(sensorData.sensorId, sensorData);

            // Si el sensor tiene una persona asociada, actualizar su ubicación
            if (sensorData.person) {
              newPersonLocations.set(sensorData.person.id, sensorData.sensorId);
            }

            // Limpiar sensores antiguos de la misma persona
            if (sensorData.person) {
              const oldSensorId = newPersonLocations.get(sensorData.person.id);
              if (oldSensorId && oldSensorId !== sensorData.sensorId) {
                newSensors.delete(oldSensorId);
              }
            }

            return { 
              sensors: newSensors,
              personLocations: newPersonLocations
            };
          });
          break;
        }
        case 'actuator_update': {
          const actuatorData = message.data;
          set((state) => {
            const newActuators = new Map(state.actuators);
            newActuators.set(actuatorData.actuatorId, actuatorData);
            return { actuators: newActuators };
          });
          break;
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from server');
      set({ isConnected: false });
      // Reconectar después de 5 segundos
      setTimeout(() => get().connect(), 5000);
    };
  },

  disconnect: () => {
    set({ isConnected: false });
  },

  clearOldData: () => {
    set((state) => {
      const now = Date.now();
      const newSensors = new Map(state.sensors);
      const newActuators = new Map(state.actuators);

      // Limpiar sensores viejos
      for (const [key, sensor] of newSensors.entries()) {
        const lastUpdate = new Date(sensor.timestamp).getTime();
        if (now - lastUpdate > STALE_DATA_THRESHOLD) {
          newSensors.delete(key);
        }
      }

      // Limpiar actuadores viejos
      for (const [key, actuator] of newActuators.entries()) {
        const lastUpdate = new Date(actuator.timestamp).getTime();
        if (now - lastUpdate > STALE_DATA_THRESHOLD) {
          newActuators.delete(key);
        }
      }

      return {
        sensors: newSensors,
        actuators: newActuators
      };
    });
  },

  getLastUpdate: (sensorId: string) => {
    const sensor = get().sensors.get(sensorId);
    return sensor ? new Date(sensor.timestamp) : null;
  }
}));