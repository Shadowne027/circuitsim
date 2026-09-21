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

// EJERCICIO 3 - ANÁLISIS DE RAMAS
// Layout EXACTO como en el diagrama:
// Izquierda: A con 20Ω en serie
// Centro: R1=10Ω arriba, R2=5Ω + R=5Ω abajo
// I2=2A en la rama de R2+R

export function getExercise3(): CircuitData {
  // Resistencia de 20Ω a la entrada
  const r20 = makeComponent('resistor', { x: 150, y: 200 }, 20, 'Ω', 'R20');
  
  // R1 = 10Ω (arriba, horizontal)
  const r1 = makeComponent('resistor', { x: 350, y: 100 }, 10, 'Ω', 'R1');
  
  // R2 = 5Ω (abajo, horizontal)
  const r2 = makeComponent('resistor', { x: 350, y: 250 }, 5, 'Ω', 'R2');
  
  // R = 5Ω (abajo, después de R2)
  const r = makeComponent('resistor', { x: 470, y: 250 }, 5, 'Ω', 'R');
  
  // Fuente de corriente I2 = 2A
  const i2 = makeComponent('current_source', { x: 550, y: 250 }, 2, 'A', 'I2');
  
  const g1 = makeComponent('ground', { x: 100, y: 320 }, 0, 'V', 'GND');

  return {
    version: '1.0.0',
    name: 'EJERCICIO 3: Análisis de Ramas',
    description: 'I2=2A, R20=20Ω, R1=10Ω, R2=5Ω, R=5Ω',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [r20, r1, r2, r, i2, g1],
    wires: [
      // A -> R20 izq
      makeWire([{ x: 100, y: 200 }, t(r20, 0)]),
      
      // R20 der -> nodo superior
      makeWire([t(r20, 1), { x: 180, y: 200 }, { x: 180, y: 100 }, { x: 320, y: 100 }, t(r1, 0)]),
      
      // R20 der -> nodo inferior
      makeWire([{ x: 180, y: 200 }, { x: 180, y: 250 }, { x: 320, y: 250 }, t(r2, 0)]),
      
      // R1 der -> B (derecha)
      makeWire([t(r1, 1), { x: 380, y: 100 }, { x: 600, y: 100 }, { x: 600, y: 200 }]),
      
      // R2 der -> R izq
      makeWire([t(r2, 1), t(r, 0)]),
      
      // R der -> I2 izq
      makeWire([t(r, 1), t(i2, 0)]),
      
      // I2 der -> B
      makeWire([t(i2, 1), { x: 580, y: 250 }, { x: 600, y: 250 }, { x: 600, y: 200 }]),
      
      // GND
      makeWire([{ x: 100, y: 200 }, { x: 100, y: 300 }, t(g1, 0)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
