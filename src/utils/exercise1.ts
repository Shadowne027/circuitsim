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
  // Layout rectangular con valores correctos del ejercicio
  // V=100V, R1=70Ω, R2=35Ω, R3=100Ω
  // Resistencias más separadas + GND
  
  const v1 = makeComponent('voltage_source', { x: 100, y: 200 }, 100, 'V', 'V1', 90); // Vertical
  const r1 = makeComponent('resistor', { x: 220, y: 100 }, 70, 'Ω', 'R1'); // Horizontal
  const r2 = makeComponent('resistor', { x: 340, y: 100 }, 35, 'Ω', 'R2'); // Horizontal - más separada
  const r3 = makeComponent('resistor', { x: 460, y: 100 }, 100, 'Ω', 'R3'); // Horizontal - más separada
  const g1 = makeComponent('ground', { x: 550, y: 320 }, 0, 'V', 'GND');

  // V1 vertical (90°): t1=(100,170) arriba (+), t2=(100,230) abajo (-)
  // R1 horizontal en (220,100): t1=(190,100) izq, t2=(250,100) der
  // R2 horizontal en (340,100): t1=(310,100) izq, t2=(370,100) der
  // R3 horizontal en (460,100): t1=(430,100) izq, t2=(490,100) der
  // GND en (550,320): t1=(550,300)

  return {
    version: '1.0.0',
    name: 'EJERCICIO 1: Leyes de Ohm',
    description: 'V=100V, R1=70Ω, R2=35Ω, R3=100Ω. Io=487.8mA',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [v1, r1, r2, r3, g1],
    wires: [
      // V1 t1 (100,170) -> subir -> esquina sup izq (100,100) -> R1 izq (190,100)
      makeWire([t(v1, 0), { x: 100, y: 100 }, t(r1, 0)]),
      
      // R1 der (250,100) -> R2 izq (310,100)
      makeWire([t(r1, 1), t(r2, 0)]),
      
      // R2 der (370,100) -> R3 izq (430,100)
      makeWire([t(r2, 1), t(r3, 0)]),
      
      // R3 der (490,100) -> esquina sup der (550,100) -> bajar -> GND (550,300)
      makeWire([t(r3, 1), { x: 550, y: 100 }, { x: 550, y: 300 }, t(g1, 0)]),
      
      // GND (550,300) -> esquina inf izq (100,300) -> V1 t2 (100,230)
      makeWire([t(g1, 0), { x: 550, y: 300 }, { x: 100, y: 300 }, t(v1, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
