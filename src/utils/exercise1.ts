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
  // Layout CUADRADO como en la imagen
  // Lado izquierdo: V0 (vertical)
  // Lado superior: R1 y R2 (horizontales, en serie)
  // Lado derecho: R3 (vertical)
  // Lado inferior: cable de conexión
  
  const v0 = makeComponent('voltage_source', { x: 150, y: 200 }, 100, 'V', 'V0', 90); // Vertical
  const r1 = makeComponent('resistor', { x: 250, y: 100 }, 70, 'Ω', 'R1'); // Horizontal arriba
  const r2 = makeComponent('resistor', { x: 370, y: 100 }, 35, 'Ω', 'R2'); // Horizontal arriba
  const r3 = makeComponent('resistor', { x: 490, y: 200 }, 100, 'Ω', 'R3', 90); // Vertical derecha
  const g1 = makeComponent('ground', { x: 490, y: 320 }, 0, 'V', 'GND');

  // V0 vertical (90°): t1=(150,170) arriba (+), t2=(150,230) abajo (-)
  // R1 horizontal en (250,100): t1=(220,100) izq, t2=(280,100) der
  // R2 horizontal en (370,100): t1=(340,100) izq, t2=(400,100) der
  // R3 vertical en (490,200): t1=(490,170) arriba, t2=(490,230) abajo
  // GND en (490,320): t1=(490,300)

  return {
    version: '1.0.0',
    name: 'EJERCICIO 1: Leyes de Ohm',
    description: 'V=100V, R1=70Ω, R2=35Ω, R3=100Ω. Io=487.8mA',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [v0, r1, r2, r3, g1],
    wires: [
      // V0 t1 (150,170) -> esquina sup izq (150,100) -> R1 izq (220,100)
      makeWire([t(v0, 0), { x: 150, y: 100 }, t(r1, 0)]),
      
      // R1 der (280,100) -> R2 izq (340,100)
      makeWire([t(r1, 1), t(r2, 0)]),
      
      // R2 der (400,100) -> esquina sup der (490,100) -> R3 arriba (490,170)
      makeWire([t(r2, 1), { x: 490, y: 100 }, t(r3, 0)]),
      
      // R3 abajo (490,230) -> GND (490,300)
      makeWire([t(r3, 1), t(g1, 0)]),
      
      // GND -> esquina inf izq (150,300) -> V0 t2 (150,230)
      makeWire([t(g1, 0), { x: 490, y: 300 }, { x: 150, y: 300 }, t(v0, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
