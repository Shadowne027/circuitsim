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

// EJERCICIO 4 - Reducción de Red Mixta
// R1=55Ω, R2=340Ω, R3=50Ω, R4=600Ω, R5=1800Ω, R6=1400Ω, R7=400Ω, R8=500Ω
// V = 24V
// RT = 360Ω, IT = 66.67mA

export function getExercise4(): CircuitData {
  // Layout: R1 y R3 en serie con el bloque central
  // Bloque central: R2 en paralelo con (R4 + (R5||R6||R78))
  // R78 = R7+R8 en serie
  
  const vSource = makeComponent('voltage_source', { x: 100, y: 200 }, 24, 'V', 'V1', 90);
  
  // R1 = 55Ω (izquierda, en serie)
  const r1 = makeComponent('resistor', { x: 200, y: 100 }, 55, 'Ω', 'R1');
  
  // R2 = 340Ω (en paralelo con el bloque central, arriba)
  const r2 = makeComponent('resistor', { x: 350, y: 60 }, 340, 'Ω', 'R2');
  
  // R3 = 50Ω (derecha, en serie)
  const r3 = makeComponent('resistor', { x: 500, y: 100 }, 50, 'Ω', 'R3');
  
  // R4 = 600Ω (en serie con el paralelo final)
  const r4 = makeComponent('resistor', { x: 350, y: 140 }, 600, 'Ω', 'R4');
  
  // R5 = 1800Ω (primer paralelo)
  const r5 = makeComponent('resistor', { x: 500, y: 180 }, 1800, 'Ω', 'R5');
  
  // R6 = 1400Ω (segundo paralelo)
  const r6 = makeComponent('resistor', { x: 500, y: 220 }, 1400, 'Ω', 'R6');
  
  // R7 = 400Ω y R8 = 500Ω en serie (tercer paralelo)
  const r7 = makeComponent('resistor', { x: 500, y: 260 }, 400, 'Ω', 'R7');
  const r8 = makeComponent('resistor', { x: 560, y: 260 }, 500, 'Ω', 'R8');
  
  const g1 = makeComponent('ground', { x: 100, y: 320 }, 0, 'V', 'GND');

  return {
    version: '1.0.0',
    name: 'EJERCICIO 4: Red Mixta',
    description: 'R1=55Ω, R2=340Ω, R3=50Ω, R4=600Ω, R5=1800Ω, R6=1400Ω, R7=400Ω, R8=500Ω. V=24V',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [vSource, r1, r2, r3, r4, r5, r6, r7, r8, g1],
    wires: [
      // V1+ -> R1
      makeWire([t(vSource, 0), { x: 100, y: 100 }, t(r1, 0)]),
      
      // R1 -> nodo A -> R2 (arriba) y R4 (abajo)
      makeWire([t(r1, 1), { x: 230, y: 100 }, { x: 230, y: 60 }, t(r2, 0)]),
      makeWire([{ x: 230, y: 100 }, { x: 230, y: 140 }, t(r4, 0)]),
      
      // R2 -> nodo B -> R3
      makeWire([t(r2, 1), { x: 380, y: 60 }, { x: 380, y: 100 }, t(r3, 0)]),
      
      // R4 -> nodo C -> R5, R6, R7 (paralelo triple)
      makeWire([t(r4, 1), { x: 380, y: 140 }, { x: 380, y: 180 }, t(r5, 0)]),
      makeWire([{ x: 380, y: 180 }, { x: 380, y: 220 }, t(r6, 0)]),
      makeWire([{ x: 380, y: 220 }, { x: 380, y: 260 }, t(r7, 0)]),
      
      // R5, R6 -> nodo D
      makeWire([t(r5, 1), { x: 530, y: 180 }, { x: 530, y: 100 }, t(r3, 0)]),
      makeWire([t(r6, 1), { x: 530, y: 220 }, { x: 530, y: 100 }]),
      
      // R7 -> R8 en serie
      makeWire([t(r7, 1), t(r8, 0)]),
      
      // R8 -> nodo D
      makeWire([t(r8, 1), { x: 590, y: 260 }, { x: 590, y: 100 }, { x: 530, y: 100 }]),
      
      // R3 -> esquina derecha -> bajar -> GND
      makeWire([t(r3, 1), { x: 530, y: 100 }, { x: 650, y: 100 }, { x: 650, y: 300 }, { x: 100, y: 300 }, t(g1, 0)]),
      
      // GND -> V1-
      makeWire([t(g1, 0), t(vSource, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
