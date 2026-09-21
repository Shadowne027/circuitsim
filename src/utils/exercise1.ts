import { CircuitData } from '../types';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function getTerminals(type: string, position: { x: number; y: number }, rotation: number): { id: string; position: { x: number; y: number } }[] {
  if (type === 'ground') {
    return [{ id: 't1', position: { x: position.x, y: position.y - 20 } }];
  }
  const rad = (rotation * Math.PI) / 180;
  return [
    { id: 't1', position: { x: position.x + Math.round(-30 * Math.cos(rad)), y: position.y + Math.round(-30 * Math.sin(rad)) } },
    { id: 't2', position: { x: position.x + Math.round(30 * Math.cos(rad)), y: position.y + Math.round(30 * Math.sin(rad)) } },
  ];
}

function makeComponent(type: string, position: { x: number; y: number }, value: number, unit: string, label: string, rotation = 0, properties: Record<string, any> = {}): any {
  return {
    id: generateId(),
    type,
    position,
    rotation,
    value,
    unit,
    label,
    terminals: getTerminals(type, position, rotation),
    properties,
  };
}

function makeWire(points: { x: number; y: number }[]): any {
  return { id: generateId(), points };
}

function t(comp: any, idx: number): { x: number; y: number } {
  return comp.terminals[idx].position;
}

// EJERCICIO 1: Layout rectangular clásico
// V1 vertical en lado izquierdo, R1-R2-R3 horizontales arriba
// Cálculos: R_total=600Ω, Io=20mA, V1=2V, V2=4V, V3=6V

export function getExercise1(): CircuitData {
  // Layout rectangular con terminales conectados exactamente
  // V1 vertical en lado izquierdo, R1-R2-R3 horizontales arriba (conectados)
  
  const v1 = makeComponent('voltage_source', { x: 100, y: 200 }, 12, 'V', 'V1', 90); // Vertical
  const r1 = makeComponent('resistor', { x: 200, y: 100 }, 100, 'Ω', 'R1'); // Horizontal
  const r2 = makeComponent('resistor', { x: 260, y: 100 }, 200, 'Ω', 'R2'); // Horizontal - pegada a R1
  const r3 = makeComponent('resistor', { x: 320, y: 100 }, 300, 'Ω', 'R3'); // Horizontal - pegada a R2
  const g1 = makeComponent('ground', { x: 100, y: 320 }, 0, 'V', 'GND');

  // V1 vertical (90°): t1=(100,170) arriba, t2=(100,230) abajo
  // R1 horizontal en (200,100): t1=(170,100) izq, t2=(230,100) der
  // R2 horizontal en (260,100): t1=(230,100) izq, t2=(290,100) der
  // R3 horizontal en (320,100): t1=(290,100) izq, t2=(350,100) der
  // GND en (100,320): t1=(100,300)

  return {
    version: '1.0.0',
    name: 'EJERCICIO 1: Leyes de Ohm',
    description: 'V=12V, R1=100Ω, R2=200Ω, R3=300Ω. Io=20mA',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [v1, r1, r2, r3, g1],
    wires: [
      // V1 t1 (100,170) -> subir -> esquina sup izq (100,100) -> R1 izq (170,100)
      makeWire([t(v1, 0), { x: 100, y: 100 }, t(r1, 0)]),
      
      // R1 der (230,100) -> R2 izq (230,100) - CONECTADOS
      makeWire([t(r1, 1), t(r2, 0)]),
      
      // R2 der (290,100) -> R3 izq (290,100) - CONECTADOS
      makeWire([t(r2, 1), t(r3, 0)]),
      
      // R3 der (350,100) -> esquina sup der (400,100) -> bajar -> esquina inf der (400,300)
      makeWire([t(r3, 1), { x: 400, y: 100 }, { x: 400, y: 300 }]),
      
      // Esquina inf der (400,300) -> esquina inf izq (100,300) -> GND t1 (100,300)
      makeWire([{ x: 400, y: 300 }, { x: 100, y: 300 }, t(g1, 0)]),
      
      // GND t1 (100,300) -> V1 t2 (100,230)
      makeWire([t(g1, 0), t(v1, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
