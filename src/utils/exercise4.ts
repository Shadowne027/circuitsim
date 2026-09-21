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

// EJERCICIO 4 - RED MIXTA
// Layout EXACTO como en el diagrama:
// R1=55Ω en serie a la entrada
// R2=340Ω abajo en paralelo
// R4=600Ω arriba en serie con bloque paralelo
// Bloque paralelo: R5=1800Ω, R6=1400Ω, R7=400Ω+R8=500Ω
// R3=50Ω en serie al final

export function getExercise4(): CircuitData {
  const vSource = makeComponent('voltage_source', { x: 100, y: 250 }, 24, 'V', 'V', 90);
  
  // R1 = 55Ω (entrada, horizontal)
  const r1 = makeComponent('resistor', { x: 200, y: 200 }, 55, 'Ω', 'R1');
  
  // R2 = 340Ω (abajo, horizontal)
  const r2 = makeComponent('resistor', { x: 350, y: 350 }, 340, 'Ω', 'R2');
  
  // R4 = 600Ω (arriba, horizontal)
  const r4 = makeComponent('resistor', { x: 450, y: 100 }, 600, 'Ω', 'R4');
  
  // R5 = 1800Ω (bloque paralelo, vertical)
  const r5 = makeComponent('resistor', { x: 550, y: 180 }, 1800, 'Ω', 'R5', 90);
  
  // R6 = 1400Ω (bloque paralelo, vertical)
  const r6 = makeComponent('resistor', { x: 620, y: 180 }, 1400, 'Ω', 'R6', 90);
  
  // R7 = 400Ω (bloque paralelo, vertical)
  const r7 = makeComponent('resistor', { x: 690, y: 160 }, 400, 'Ω', 'R7', 90);
  
  // R8 = 500Ω (bloque paralelo, vertical, después de R7)
  const r8 = makeComponent('resistor', { x: 690, y: 240 }, 500, 'Ω', 'R8', 90);
  
  // R3 = 50Ω (salida, horizontal)
  const r3 = makeComponent('resistor', { x: 800, y: 200 }, 50, 'Ω', 'R3');
  
  const g1 = makeComponent('ground', { x: 100, y: 370 }, 0, 'V', 'GND');

  return {
    version: '1.0.0',
    name: 'EJERCICIO 4: Red Mixta',
    description: 'R1=55Ω, R2=340Ω, R3=50Ω, R4=600Ω, R5=1800Ω, R6=1400Ω, R7=400Ω, R8=500Ω. V=24V',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [vSource, r1, r2, r4, r5, r6, r7, r8, r3, g1],
    wires: [
      // V+ -> R1 izq
      makeWire([t(vSource, 0), { x: 100, y: 200 }, t(r1, 0)]),
      
      // R1 der -> nodo superior
      makeWire([t(r1, 1), { x: 230, y: 200 }, { x: 230, y: 100 }, { x: 420, y: 100 }, t(r4, 0)]),
      
      // R1 der -> nodo inferior (para R2)
      makeWire([{ x: 230, y: 200 }, { x: 230, y: 350 }, { x: 320, y: 350 }, t(r2, 0)]),
      
      // R4 der -> nodo derecho superior
      makeWire([t(r4, 1), { x: 480, y: 100 }, { x: 480, y: 150 }]),
      
      // Nodo superior -> R5 arriba
      makeWire([{ x: 480, y: 150 }, { x: 550, y: 150 }, t(r5, 0)]),
      
      // Nodo superior -> R6 arriba
      makeWire([{ x: 480, y: 150 }, { x: 620, y: 150 }, t(r6, 0)]),
      
      // Nodo superior -> R7 arriba
      makeWire([{ x: 480, y: 150 }, { x: 690, y: 150 }, { x: 690, y: 130 }, t(r7, 0)]),
      
      // R5 abajo -> nodo inferior
      makeWire([t(r5, 1), { x: 550, y: 210 }, { x: 550, y: 300 }]),
      
      // R6 abajo -> nodo inferior
      makeWire([t(r6, 1), { x: 620, y: 210 }, { x: 620, y: 300 }]),
      
      // R7 abajo -> R8 arriba
      makeWire([t(r7, 1), t(r8, 0)]),
      
      // R8 abajo -> nodo inferior
      makeWire([t(r8, 1), { x: 690, y: 270 }, { x: 690, y: 300 }]),
      
      // Nodo inferior -> R2 der
      makeWire([{ x: 550, y: 300 }, { x: 620, y: 300 }, { x: 690, y: 300 }, { x: 690, y: 350 }, { x: 380, y: 350 }]),
      
      // Nodo inferior -> R3 izq
      makeWire([{ x: 690, y: 300 }, { x: 770, y: 300 }, { x: 770, y: 200 }, t(r3, 0)]),
      
      // R3 der -> B
      makeWire([t(r3, 1), { x: 830, y: 200 }, { x: 900, y: 200 }]),
      
      // B -> V- (retorno)
      makeWire([{ x: 900, y: 200 }, { x: 900, y: 300 }, { x: 100, y: 300 }, { x: 100, y: 280 }, t(vSource, 1)]),
      
      // GND
      makeWire([{ x: 100, y: 300 }, { x: 100, y: 350 }, t(g1, 0)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
