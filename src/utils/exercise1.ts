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
  // Layout EXACTO como en la imagen:
  // Arriba: R1, R2, R3 en serie (horizontales)
  // Abajo: V0 en el centro
  // Lados: cables verticales
  
  const v0 = makeComponent('voltage_source', { x: 300, y: 250 }, 100, 'V', 'V0'); // Horizontal abajo
  const r1 = makeComponent('resistor', { x: 200, y: 100 }, 70, 'Ω', 'R1'); // Horizontal arriba izq
  const r2 = makeComponent('resistor', { x: 320, y: 100 }, 35, 'Ω', 'R2'); // Horizontal arriba centro
  const r3 = makeComponent('resistor', { x: 440, y: 100 }, 100, 'Ω', 'R3'); // Horizontal arriba der
  const g1 = makeComponent('ground', { x: 300, y: 320 }, 0, 'V', 'GND');

  // V0 horizontal: t1=(270,250) izq (+), t2=(330,250) der (-)
  // R1 horizontal en (200,100): t1=(170,100) izq, t2=(230,100) der
  // R2 horizontal en (320,100): t1=(290,100) izq, t2=(350,100) der
  // R3 horizontal en (440,100): t1=(410,100) izq, t2=(470,100) der
  // GND en (300,320): t1=(300,300)

  return {
    version: '1.0.0',
    name: 'EJERCICIO 1: Leyes de Ohm',
    description: 'V=100V, R1=70Ω, R2=35Ω, R3=100Ω. Io=487.8mA',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [v0, r1, r2, r3, g1],
    wires: [
      // Lado izquierdo: V0 izq (270,250) -> subir -> esquina sup izq (170,100) -> R1 izq
      makeWire([t(v0, 0), { x: 270, y: 250 }, { x: 170, y: 250 }, { x: 170, y: 100 }, t(r1, 0)]),
      
      // R1 der (230,100) -> R2 izq (290,100)
      makeWire([t(r1, 1), t(r2, 0)]),
      
      // R2 der (350,100) -> R3 izq (410,100)
      makeWire([t(r2, 1), t(r3, 0)]),
      
      // Lado derecho: R3 der (470,100) -> bajar -> esquina inf der (470,250) -> V0 der
      makeWire([t(r3, 1), { x: 470, y: 100 }, { x: 470, y: 250 }, { x: 330, y: 250 }, t(v0, 1)]),
      
      // GND en el centro abajo
      makeWire([{ x: 300, y: 250 }, { x: 300, y: 300 }, t(g1, 0)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
