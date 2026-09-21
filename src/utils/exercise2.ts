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

// EJERCICIO 2 - Resistencia Equivalente entre A y B
// Layout tipo escalera (ladder network) más claro
// R1=10Ω, R2=20Ω, R3=10Ω, R4=20Ω, R5=10Ω, R6=10Ω
// RAB = 20Ω

export function getExercise2(): CircuitData {
  // Layout EXACTO como en el diagrama:
  // Arriba: R1 y R3 en serie
  // Izquierda: R2 vertical
  // Centro-derecha: R4 arriba, R5 y R6 abajo en serie
  // R4 en paralelo con (R5+R6)
  
  const vTest = makeComponent('voltage_source', { x: 100, y: 200 }, 1, 'V', 'Vtest', 90);
  
  // R1 = 10Ω (arriba, horizontal)
  const r1 = makeComponent('resistor', { x: 250, y: 100 }, 10, 'Ω', 'R1');
  
  // R2 = 20Ω (izquierda, vertical)
  const r2 = makeComponent('resistor', { x: 150, y: 200 }, 20, 'Ω', 'R2', 90);
  
  // R3 = 10Ω (arriba, horizontal, después de R1)
  const r3 = makeComponent('resistor', { x: 450, y: 100 }, 10, 'Ω', 'R3');
  
  // R4 = 20Ω (centro, horizontal arriba)
  const r4 = makeComponent('resistor', { x: 550, y: 150 }, 20, 'Ω', 'R4');
  
  // R5 = 10Ω (centro, horizontal abajo)
  const r5 = makeComponent('resistor', { x: 550, y: 250 }, 10, 'Ω', 'R5');
  
  // R6 = 10Ω (centro, horizontal abajo, después de R5)
  const r6 = makeComponent('resistor', { x: 670, y: 250 }, 10, 'Ω', 'R6');
  
  const g1 = makeComponent('ground', { x: 100, y: 320 }, 0, 'V', 'GND');

  return {
    version: '1.0.0',
    name: 'EJERCICIO 2: Resistencia Equivalente',
    description: 'R1=10Ω, R2=20Ω, R3=10Ω, R4=20Ω, R5=10Ω, R6=10Ω. RAB=20Ω',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [vTest, r1, r2, r3, r4, r5, r6, g1],
    wires: [
      // Vtest+ -> R1 izq
      makeWire([t(vTest, 0), { x: 100, y: 100 }, { x: 220, y: 100 }, t(r1, 0)]),
      
      // R1 der -> R3 izq
      makeWire([t(r1, 1), { x: 280, y: 100 }, { x: 420, y: 100 }, t(r3, 0)]),
      
      // R3 der -> B (derecha)
      makeWire([t(r3, 1), { x: 480, y: 100 }, { x: 750, y: 100 }, { x: 750, y: 200 }]),
      
      // R2 vertical: arriba -> nodo entre R1 y R3
      makeWire([{ x: 150, y: 170 }, { x: 150, y: 100 }, { x: 280, y: 100 }]),
      
      // R2 vertical: abajo -> línea inferior
      makeWire([t(r2, 1), { x: 150, y: 230 }, { x: 150, y: 300 }, { x: 100, y: 300 }]),
      
      // R4 izq -> nodo superior derecho
      makeWire([t(r4, 0), { x: 520, y: 150 }, { x: 520, y: 100 }, { x: 480, y: 100 }]),
      
      // R4 der -> B
      makeWire([t(r4, 1), { x: 580, y: 150 }, { x: 750, y: 150 }, { x: 750, y: 200 }]),
      
      // R5 izq -> nodo inferior izquierdo
      makeWire([t(r5, 0), { x: 520, y: 250 }, { x: 520, y: 300 }, { x: 150, y: 300 }]),
      
      // R5 der -> R6 izq
      makeWire([t(r5, 1), t(r6, 0)]),
      
      // R6 der -> B
      makeWire([t(r6, 1), { x: 700, y: 250 }, { x: 750, y: 250 }, { x: 750, y: 200 }]),
      
      // GND -> Vtest-
      makeWire([t(g1, 0), { x: 100, y: 300 }, t(vTest, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
