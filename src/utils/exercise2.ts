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

// EJERCICIO 2 - Resistencia equivalente entre A y B
// R1=10Ω, R2=20Ω, R3=10Ω, R4=20Ω, R5=10Ω, R6=10Ω
// RAB = 20Ω
// Configuración: R5+R6 en serie (20Ω), paralelo con R4 (10Ω), serie con R3 (20Ω), paralelo con R2 (10Ω), serie con R1 (20Ω)

export function getExercise2(): CircuitData {
  // Layout: Fuente de prueba 1V para medir RAB
  const vTest = makeComponent('voltage_source', { x: 100, y: 200 }, 1, 'V', 'Vtest', 90);
  
  // R1 en serie con todo (izquierda)
  const r1 = makeComponent('resistor', { x: 220, y: 100 }, 10, 'Ω', 'R1');
  
  // R2 en paralelo con el bloque (arriba)
  const r2 = makeComponent('resistor', { x: 340, y: 60 }, 20, 'Ω', 'R2');
  
  // R3 en serie después del primer paralelo
  const r3 = makeComponent('resistor', { x: 460, y: 100 }, 10, 'Ω', 'R3');
  
  // R4 en paralelo con R5+R6
  const r4 = makeComponent('resistor', { x: 580, y: 60 }, 20, 'Ω', 'R4');
  
  // R5 y R6 en serie (derecha)
  const r5 = makeComponent('resistor', { x: 700, y: 100 }, 10, 'Ω', 'R5');
  const r6 = makeComponent('resistor', { x: 760, y: 100 }, 10, 'Ω', 'R6');
  
  const g1 = makeComponent('ground', { x: 100, y: 320 }, 0, 'V', 'GND');

  return {
    version: '1.0.0',
    name: 'EJERCICIO 2: Resistencia Equivalente',
    description: 'R1=10Ω, R2=20Ω, R3=10Ω, R4=20Ω, R5=10Ω, R6=10Ω. RAB=20Ω',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [vTest, r1, r2, r3, r4, r5, r6, g1],
    wires: [
      // Vtest+ -> R1
      makeWire([t(vTest, 0), { x: 100, y: 100 }, t(r1, 0)]),
      
      // R1 -> nodo A -> R2 (arriba) y R3 (continúa)
      makeWire([t(r1, 1), { x: 280, y: 100 }, { x: 280, y: 60 }, t(r2, 0)]),
      makeWire([{ x: 280, y: 100 }, t(r3, 0)]),
      
      // R2 -> nodo intermedio -> R3
      makeWire([t(r2, 1), { x: 400, y: 60 }, { x: 400, y: 100 }, t(r3, 0)]),
      
      // R3 -> nodo -> R4 (arriba) y R5 (continúa)
      makeWire([t(r3, 1), { x: 520, y: 100 }, { x: 520, y: 60 }, t(r4, 0)]),
      makeWire([{ x: 520, y: 100 }, t(r5, 0)]),
      
      // R4 -> R5+R6 (abajo)
      makeWire([t(r4, 1), { x: 640, y: 60 }, { x: 640, y: 100 }, t(r5, 0)]),
      
      // R5 -> R6 en serie
      makeWire([t(r5, 1), t(r6, 0)]),
      
      // R6 -> esquina derecha -> bajar -> GND
      makeWire([t(r6, 1), { x: 790, y: 100 }, { x: 790, y: 300 }, { x: 100, y: 300 }, t(g1, 0)]),
      
      // GND -> Vtest-
      makeWire([t(g1, 0), t(vTest, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
