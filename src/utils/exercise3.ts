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

// EJERCICIO 3 - Análisis de Ramas
// I2 = 2A (fuente de corriente)
// Rama derecha: 5Ω + 5Ω en serie = 10Ω
// R1 = 10Ω en paralelo con rama derecha
// Resistencia de 20Ω en serie con todo
// V total = 100V (80V en 20Ω + 20V en paralelo)

export function getExercise3(): CircuitData {
  // Fuente de corriente I2 = 2A
  const i2 = makeComponent('current_source', { x: 600, y: 100 }, 2, 'A', 'I2', 90);
  
  // Rama derecha: dos resistencias de 5Ω en serie
  const r5a = makeComponent('resistor', { x: 600, y: 160 }, 5, 'Ω', 'R5a', 90);
  const r5b = makeComponent('resistor', { x: 600, y: 220 }, 5, 'Ω', 'R5b', 90);
  
  // R1 = 10Ω en paralelo (izquierda)
  const r1 = makeComponent('resistor', { x: 500, y: 190 }, 10, 'Ω', 'R1', 90);
  
  // Resistencia de 20Ω en serie (abajo)
  const r20 = makeComponent('resistor', { x: 550, y: 300 }, 20, 'Ω', 'R20');
  
  // Fuente de voltaje para completar el circuito (100V total)
  const vSource = makeComponent('voltage_source', { x: 400, y: 300 }, 100, 'V', 'V1');
  
  const g1 = makeComponent('ground', { x: 400, y: 380 }, 0, 'V', 'GND');

  return {
    version: '1.0.0',
    name: 'EJERCICIO 3: Análisis de Ramas',
    description: 'I2=2A, R1=10Ω, R5a=5Ω, R5b=5Ω, R20=20Ω. Vtotal=100V',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [i2, r5a, r5b, r1, r20, vSource, g1],
    wires: [
      // I2+ (arriba) -> R5a
      makeWire([t(i2, 0), { x: 600, y: 70 }, { x: 600, y: 130 }]),
      
      // R5a -> R5b en serie (rama derecha)
      makeWire([t(r5a, 1), t(r5b, 0)]),
      
      // R5b -> nodo inferior derecho
      makeWire([t(r5b, 1), { x: 600, y: 250 }, { x: 600, y: 300 }]),
      
      // R1 en paralelo (conecta arriba y abajo)
      makeWire([t(r1, 0), { x: 500, y: 160 }, { x: 600, y: 160 }]),
      makeWire([t(r1, 1), { x: 500, y: 220 }, { x: 600, y: 220 }]),
      
      // Nodo inferior -> R20
      makeWire([{ x: 600, y: 300 }, { x: 580, y: 300 }, t(r20, 1)]),
      
      // R20 -> V1
      makeWire([t(r20, 0), t(vSource, 1)]),
      
      // V1+ -> I2- (completar circuito)
      makeWire([t(vSource, 0), { x: 430, y: 300 }, { x: 430, y: 100 }, { x: 600, y: 100 }, t(i2, 1)]),
      
      // GND en V1-
      makeWire([t(vSource, 1), { x: 400, y: 300 }, { x: 400, y: 360 }, t(g1, 0)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
