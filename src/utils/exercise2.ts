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
  // Layout escalera horizontal:
  // Línea superior: R1 - nodo1 - R3 - nodo2 - R5 - R6
  // Línea inferior: conexiones directas
  // R2 entre línea superior e inferior en nodo1
  // R4 entre línea superior e inferior en nodo2
  
  const vTest = makeComponent('voltage_source', { x: 100, y: 200 }, 1, 'V', 'Vtest', 90);
  
  // R1 = 10Ω (primera, en serie)
  const r1 = makeComponent('resistor', { x: 200, y: 150 }, 10, 'Ω', 'R1');
  
  // R2 = 20Ω (primera en paralelo, vertical)
  const r2 = makeComponent('resistor', { x: 300, y: 200 }, 20, 'Ω', 'R2', 90);
  
  // R3 = 10Ω (segunda en serie)
  const r3 = makeComponent('resistor', { x: 400, y: 150 }, 10, 'Ω', 'R3');
  
  // R4 = 20Ω (segunda en paralelo, vertical)
  const r4 = makeComponent('resistor', { x: 500, y: 200 }, 20, 'Ω', 'R4', 90);
  
  // R5 = 10Ω (tercera en serie)
  const r5 = makeComponent('resistor', { x: 600, y: 150 }, 10, 'Ω', 'R5');
  
  // R6 = 10Ω (cuarta en serie, final)
  const r6 = makeComponent('resistor', { x: 700, y: 150 }, 10, 'Ω', 'R6');
  
  const g1 = makeComponent('ground', { x: 100, y: 320 }, 0, 'V', 'GND');

  // Terminales:
  // Vtest: t1=(100,170), t2=(100,230)
  // R1: t1=(170,150), t2=(230,150)
  // R2: t1=(300,170), t2=(300,230) - vertical
  // R3: t1=(370,150), t2=(430,150)
  // R4: t1=(500,170), t2=(500,230) - vertical
  // R5: t1=(570,150), t2=(630,150)
  // R6: t1=(670,150), t2=(730,150)
  // GND: t1=(100,300)

  return {
    version: '1.0.0',
    name: 'EJERCICIO 2: Resistencia Equivalente',
    description: 'R1=10Ω, R2=20Ω, R3=10Ω, R4=20Ω, R5=10Ω, R6=10Ω. RAB=20Ω',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [vTest, r1, r2, r3, r4, r5, r6, g1],
    wires: [
      // Vtest+ -> R1
      makeWire([t(vTest, 0), { x: 100, y: 150 }, t(r1, 0)]),
      
      // R1 -> nodo1 (230,150)
      // R2 conecta desde nodo1 hacia abajo
      makeWire([t(r1, 1), { x: 300, y: 150 }, t(r2, 0)]),
      
      // nodo1 -> R3
      makeWire([{ x: 300, y: 150 }, t(r3, 0)]),
      
      // R3 -> nodo2 (430,150)
      // R4 conecta desde nodo2 hacia abajo
      makeWire([t(r3, 1), { x: 500, y: 150 }, t(r4, 0)]),
      
      // nodo2 -> R5
      makeWire([{ x: 500, y: 150 }, t(r5, 0)]),
      
      // R5 -> R6 en serie
      makeWire([t(r5, 1), t(r6, 0)]),
      
      // R6 -> esquina derecha -> bajar -> línea inferior
      makeWire([t(r6, 1), { x: 730, y: 150 }, { x: 730, y: 250 }, { x: 100, y: 250 }]),
      
      // Línea inferior -> R2 bottom
      makeWire([{ x: 300, y: 250 }, { x: 300, y: 230 }, t(r2, 1)]),
      
      // Línea inferior -> R4 bottom
      makeWire([{ x: 500, y: 250 }, { x: 500, y: 230 }, t(r4, 1)]),
      
      // Línea inferior -> GND
      makeWire([{ x: 100, y: 250 }, { x: 100, y: 300 }, t(g1, 0)]),
      
      // GND -> Vtest-
      makeWire([t(g1, 0), t(vTest, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
