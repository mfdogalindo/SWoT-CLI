// src/lib/drawing.ts
import { SensorData, ActuatorData } from '@/types';

const COLORS = {
   wall: '#2c3e50',
   room: '#ecf0f1',
   bathroom: '#bdc3c7',
   livingRoom: '#e8f5e9',
   diningRoom: '#fff3e0',
   yard: '#e0f2f1',
   person: {
      resident: '#e74c3c',
      nurse: '#3498db',
      staff: '#2ecc71'
   },
   actuator: {
      TEMPERATURE: '#f39c12',
      LIGHT: '#f1c40f',
      ALARM: '#e74c3c'
   }
};

const LAYOUT = {
   width: 1000,
   height: 600,
   roomSize: 200,
   bathroomSize: 60,
   commonAreaSize: 300,
   wallThickness: 4
};

interface Point {
   x: number;
   y: number;
}

const PERSON_SPACING = 20; // Espaciado vertical entre personas
const PERSON_RADIUS = 8; // Radio del círculo que representa a la persona
const TEXT_OFFSET = 20; // Distancia para el texto del nombre


export function drawFloorPlan(ctx: CanvasRenderingContext2D) {
   ctx.save();

   // Rooms and bathrooms (5 sets)
   for (let i = 0; i < 5; i++) {
      const x = 20 + (LAYOUT.roomSize + LAYOUT.bathroomSize) * i;
      const y = 20;

      // Room
      ctx.fillStyle = COLORS.room;
      ctx.strokeStyle = COLORS.wall;
      ctx.lineWidth = LAYOUT.wallThickness;
      ctx.beginPath();
      ctx.rect(x, y, LAYOUT.roomSize, LAYOUT.roomSize);
      ctx.fill();
      ctx.stroke();

      // Bathroom
      ctx.fillStyle = COLORS.bathroom;
      ctx.beginPath();
      ctx.rect(x + LAYOUT.roomSize, y, LAYOUT.bathroomSize, LAYOUT.bathroomSize);
      ctx.fill();
      ctx.stroke();

      // Room label
      ctx.fillStyle = COLORS.wall;
      ctx.font = '14px Arial';
      ctx.fillText(`Room ${i + 1}`, x + LAYOUT.roomSize - 60, y + 20);
   }

   // Common areas
   const commonAreaY = 20 + LAYOUT.roomSize + 40;

   // Living room
   ctx.fillStyle = COLORS.livingRoom;
   ctx.beginPath();
   ctx.rect(20, commonAreaY, LAYOUT.commonAreaSize, LAYOUT.commonAreaSize);
   ctx.fill();
   ctx.stroke();
   ctx.fillStyle = COLORS.wall;
   ctx.fillText('Living Room', LAYOUT.commonAreaSize - 70, commonAreaY + 20);

   // Dining room
   ctx.fillStyle = COLORS.diningRoom;
   ctx.beginPath();
   ctx.rect(LAYOUT.commonAreaSize + 40, commonAreaY, LAYOUT.commonAreaSize, LAYOUT.commonAreaSize);
   ctx.fill();
   ctx.stroke();
   ctx.fillStyle = COLORS.wall;
   ctx.fillText('Dining Room', LAYOUT.commonAreaSize * 2 - 55, commonAreaY + 20);

   // Yard
   ctx.fillStyle = COLORS.yard;
   ctx.beginPath();
   ctx.rect(LAYOUT.commonAreaSize * 2 + 60, commonAreaY, LAYOUT.commonAreaSize, LAYOUT.commonAreaSize);
   ctx.fill();
   ctx.stroke();
   ctx.fillStyle = COLORS.wall;
   ctx.fillText('Yard', LAYOUT.commonAreaSize * 3 + 20, commonAreaY + 20);

   ctx.restore();
}

export function drawPeople(ctx: CanvasRenderingContext2D, sensors: SensorData[]) {
   ctx.save();

   // Agrupar personas por zona
   const peopleByZone = new Map<string, SensorData[]>();

   sensors.forEach(sensor => {
      // Solo procesar sensores de tipo LOCATION
      if (sensor.person && sensor.sensorId.match(/location/)) {
         const zoneId = sensor.location.zoneId;
         if (!peopleByZone.has(zoneId)) {
            peopleByZone.set(zoneId, []);
         }
         peopleByZone.get(zoneId)!.push(sensor);
      }
   });

   // Dibujar personas por zona
   peopleByZone.forEach((zonePersons, zoneId) => {
      const basePosition = getPositionForZone(zoneId);
      const totalInZone = zonePersons.length;

      zonePersons.forEach((sensor, index) => {
         if (!sensor.person) return;

         const position = calculatePersonPosition(
            basePosition,
            index,
            totalInZone,
            getZoneSize(zoneId).height
         );

         const color = COLORS.person[sensor.person.type];

         // Dibujar círculo para representar a la persona
         ctx.fillStyle = color;
         ctx.beginPath();
         ctx.arc(position.x, position.y, PERSON_RADIUS, 0, Math.PI * 2);
         ctx.fill();

         // Nombre de la persona
         ctx.fillStyle = COLORS.wall;
         ctx.font = '12px Arial';
         ctx.textAlign = 'left';
         ctx.fillText(
            sensor.person.name,
            position.x + TEXT_OFFSET,
            position.y + 4 // +4 para centrar verticalmente con el círculo
         );
      });
   });

   ctx.restore();
}

export function drawActuators(ctx: CanvasRenderingContext2D, actuators: ActuatorData[]) {
   ctx.save();

   actuators.forEach(actuator => {
      const position = getPositionForZone(actuator.location.zoneId);
      const color = COLORS.actuator[actuator.type as keyof typeof COLORS.actuator];

      position.x += 20;

      position.y += (actuator.type === 'TEMPERATURE') ? 15 : 0;
      position.y += (actuator.type === 'ALARM') ? 30 : 0;

      // Dibujar cuadrado para representar el actuador
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.rect(position.x - 5, position.y - 25, 10, 10);
      ctx.fill();

      // Valor del actuador
      ctx.fillStyle = COLORS.wall;
      ctx.font = '12px Arial';
      ctx.fillText(
         `${actuator.type.charAt(0)}: ${actuator.value}`,
         position.x + 20,
         position.y - 15
      );
   });

   ctx.restore();
}

// Función auxiliar para obtener el tamaño de una zona
function getZoneSize(zoneId: string): { width: number; height: number } {
   if (zoneId.startsWith('room')) {
      return { width: LAYOUT.roomSize, height: LAYOUT.roomSize };
   }
   if (zoneId.startsWith('bathroom')) {
      return { width: LAYOUT.bathroomSize, height: LAYOUT.bathroomSize };
   }
   if (['living-room', 'dining-room', 'yard'].includes(zoneId)) {
      return { width: LAYOUT.commonAreaSize, height: LAYOUT.commonAreaSize };
   }
   return { width: 0, height: 0 };
}

// Funcion auxiliar para calcular la posición de la persona
function calculatePersonPosition(
   basePosition: Point,
   index: number,
   totalInZone: number,
   roomSize: number
): Point {
   // Calcular la altura total que ocuparán todas las personas
   const totalHeight = totalInZone * PERSON_SPACING;

   // Calcular la posición Y inicial para centrar el grupo verticalmente en la habitación
   const startY = basePosition.y + 30

   return {
      x: basePosition.x + 20, // Alineado a la izquierda con un pequeño margen
      y: startY + (index * PERSON_SPACING)
   };
}

// Función auxiliar para obtener la posición de dibujo según la zona
function getPositionForZone(zoneId: string): Point {
   // Posiciones base para cada zona (esquina superior izquierda)
   const positions: { [key: string]: Point } = {
      'room1': { x: 20, y: 60 },
      'room2': { x: 20 + (LAYOUT.roomSize + LAYOUT.bathroomSize), y: 60 },
      'room3': { x: 20 + 2 * (LAYOUT.roomSize + LAYOUT.bathroomSize), y: 60 },
      'room4': { x: 20 + 3 * (LAYOUT.roomSize + LAYOUT.bathroomSize), y: 60 },
      'room5': { x: 20 + 4 * (LAYOUT.roomSize + LAYOUT.bathroomSize), y: 60 },
      'bathroom1': { x: 10 + LAYOUT.roomSize, y: 60 },
      'bathroom2': { x: 10 + 2 * LAYOUT.roomSize + LAYOUT.bathroomSize, y: 60 },
      'bathroom3': { x: 10 + 3 * LAYOUT.roomSize + 2 * LAYOUT.bathroomSize, y: 60 },
      'bathroom4': { x: 10 + 4 * LAYOUT.roomSize + 3 * LAYOUT.bathroomSize, y: 60 },
      'bathroom5': { x: 10 + 5 * LAYOUT.roomSize + 4 * LAYOUT.bathroomSize, y: 60 },
      'living_room': { x: 20, y: LAYOUT.roomSize + 100 },
      'dining_room': { x: LAYOUT.commonAreaSize + 40, y: LAYOUT.roomSize + 100 },
      'yard': { x: LAYOUT.commonAreaSize * 2 + 60, y: LAYOUT.roomSize + 100 }
   };


   return positions[zoneId] || { x: 0, y: 0 };
}