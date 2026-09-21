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

export function getSimpleSeriesExample(): CircuitData {
  // Circuito MUY SIMPLE: V=10V, R1=100Ω, R2=200Ω en serie
  // Cálculo manual: R_total = 300Ω, I = 10/300 = 33.3mA
  
  const v1 = makeComponent('voltage_source', { x: 200, y: 200 }, 10, 'V', 'V1');
  const r1 = makeComponent('resistor', { x: 300, y: 200 }, 100, 'Ω', 'R1');
  const r2 = makeComponent('resistor', { x: 400, y: 200 }, 200, 'Ω', 'R2');
  const g1 = makeComponent('ground', { x: 200, y: 300 }, 0, 'V', 'GND');

  return {
    version: '1.0.0',
    name: 'Ejercicio Simple: Serie',
    description: 'V=10V, R1=100Ω, R2=200Ω. I=33.3mA',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [v1, r1, r2, g1],
    wires: [
      // V1+ (170,200) -> R1 izq (270,200)
      makeWire([t(v1, 0), t(r1, 0)]),
      // R1 der (330,200) -> R2 izq (370,200)
      makeWire([t(r1, 1), t(r2, 0)]),
      // R2 der (430,200) -> bajar -> GND (200,280)
      makeWire([t(r2, 1), { x: 430, y: 300 }, t(g1, 0)]),
      // GND (200,280) -> V1- (230,200)
      makeWire([t(g1, 0), { x: 200, y: 200 }, t(v1, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
