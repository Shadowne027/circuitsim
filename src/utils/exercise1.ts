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

// EJERCICIO 1: Circuito serie con 3 resistencias
// Valores típicos: V=12V, R1=100Ω, R2=200Ω, R3=300Ω
// Cálculos esperados:
// R_total = 100 + 200 + 300 = 600Ω
// Io = V/R_total = 12/600 = 0.02A = 20mA
// V1 = Io × R1 = 0.02 × 100 = 2V
// V2 = Io × R2 = 0.02 × 200 = 4V
// V3 = Io × R3 = 0.02 × 300 = 6V
// P1 = V1 × Io = 2 × 0.02 = 0.04W = 40mW
// P2 = V2 × Io = 4 × 0.02 = 0.08W = 80mW
// P3 = V3 × Io = 6 × 0.02 = 0.12W = 120mW

export function getExercise1(): CircuitData {
  const v1 = makeComponent('voltage_source', { x: 150, y: 200 }, 12, 'V', 'V1');
  const r1 = makeComponent('resistor', { x: 250, y: 200 }, 100, 'Ω', 'R1');
  const r2 = makeComponent('resistor', { x: 350, y: 200 }, 200, 'Ω', 'R2');
  const r3 = makeComponent('resistor', { x: 450, y: 200 }, 300, 'Ω', 'R3');
  const g1 = makeComponent('ground', { x: 150, y: 300 }, 0, 'V', 'GND');

  return {
    version: '1.0.0',
    name: 'EJERCICIO 1: Leyes de Ohm',
    description: 'Encontrar Io, V1, V2, V3 y potencias. R_total=600Ω, Io=20mA',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [v1, r1, r2, r3, g1],
    wires: [
      // V1+ (120,200) -> R1 izq (220,200)
      makeWire([t(v1, 0), t(r1, 0)]),
      // R1 der (280,200) -> R2 izq (320,200)
      makeWire([t(r1, 1), t(r2, 0)]),
      // R2 der (380,200) -> R3 izq (420,200)
      makeWire([t(r2, 1), t(r3, 0)]),
      // R3 der (480,200) -> bajar -> GND (150,280)
      makeWire([t(r3, 1), { x: 480, y: 300 }, t(g1, 0)]),
      // GND (150,280) -> V1- (180,200)
      makeWire([t(g1, 0), { x: 150, y: 200 }, t(v1, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
