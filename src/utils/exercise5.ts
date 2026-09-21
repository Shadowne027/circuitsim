import { CircuitData } from '../types';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function getTerminals(type: string, position: { x: number; y: number }, rotation: number): { id: string; position: { x: number; y: number } }[] {
  const rad = (rotation * Math.PI) / 180;
  
  switch (type) {
    case 'logic_input':
      // Input: 1 output terminal (right)
      return [
        { id: 'out', position: { x: position.x + 30, y: position.y } }
      ];
    case 'logic_output':
      // Output: 1 input terminal (left)
      return [
        { id: 'in', position: { x: position.x - 30, y: position.y } }
      ];
    case 'logic_not':
      // NOT: 1 input (left), 1 output (right)
      return [
        { id: 'in', position: { x: position.x - 30, y: position.y } },
        { id: 'out', position: { x: position.x + 30, y: position.y } }
      ];
    case 'logic_and':
    case 'logic_or':
    case 'logic_nand':
    case 'logic_nor':
    case 'logic_xor':
      // 2-input gates: 2 inputs (left-top, left-bottom), 1 output (right)
      return [
        { id: 'in1', position: { x: position.x - 30, y: position.y - 10 } },
        { id: 'in2', position: { x: position.x - 30, y: position.y + 10 } },
        { id: 'out', position: { x: position.x + 30, y: position.y } }
      ];
    default:
      return [
        { id: 't1', position: { x: position.x + Math.round(-30 * Math.cos(rad)), y: position.y + Math.round(-30 * Math.sin(rad)) } },
        { id: 't2', position: { x: position.x + Math.round(30 * Math.cos(rad)), y: position.y + Math.round(30 * Math.sin(rad)) } },
      ];
  }
}

function makeComponent(type: string, position: { x: number; y: number }, label: string, properties: Record<string, any> = {}): any {
  return {
    id: generateId(),
    type,
    position,
    rotation: 0,
    value: 0,
    unit: '',
    label,
    terminals: getTerminals(type, position, 0),
    properties,
  };
}

function makeWire(points: { x: number; y: number }[]): any {
  return { id: generateId(), points };
}

function t(comp: any, idx: number): { x: number; y: number } {
  return comp.terminals[idx].position;
}

// EJERCICIO 5 - Compuertas Lógicas
// Entradas: A=1, B=0
// Rama superior: NOR(AND(A,B), AND(NOT(A),B)) = NOR(0,0) = 1
// Rama inferior: NOT(NOR(AND(NOT(A),B), AND(NOT(A),B))) = NOT(NOR(0,0)) = NOT(1) = 0
// Salida final: OR(rama_superior, rama_inferior) = OR(1,0) = 1

export function getExercise5(): CircuitData {
  // Entradas
  const inputA = makeComponent('logic_input', { x: 100, y: 200 }, 'A', { value: 1 });
  const inputB = makeComponent('logic_input', { x: 100, y: 300 }, 'B', { value: 0 });
  
  // Rama superior
  const and1 = makeComponent('logic_and', { x: 200, y: 150 }, 'AND1'); // AND(A,B)
  const not1 = makeComponent('logic_not', { x: 200, y: 250 }, 'NOT1'); // NOT(A)
  const and2 = makeComponent('logic_and', { x: 300, y: 250 }, 'AND2'); // AND(NOT(A),B)
  const nor1 = makeComponent('logic_nor', { x: 400, y: 200 }, 'NOR1'); // NOR(AND1,AND2)
  
  // Rama inferior
  const not2 = makeComponent('logic_not', { x: 200, y: 350 }, 'NOT2'); // NOT(A)
  const and3 = makeComponent('logic_and', { x: 300, y: 350 }, 'AND3'); // AND(NOT(A),B)
  const and4 = makeComponent('logic_and', { x: 300, y: 450 }, 'AND4'); // AND(NOT(A),B)
  const nor2 = makeComponent('logic_nor', { x: 400, y: 400 }, 'NOR2'); // NOR(AND3,AND4)
  const not3 = makeComponent('logic_not', { x: 500, y: 400 }, 'NOT3'); // NOT(NOR2)
  
  // Salida final
  const or1 = makeComponent('logic_or', { x: 600, y: 300 }, 'OR1'); // OR(NOR1,NOT3)
  const output = makeComponent('logic_output', { x: 700, y: 300 }, 'OUT');
  
  return {
    version: '1.0.0',
    name: 'EJERCICIO 5: Compuertas Lógicas',
    description: 'A=1, B=0. Resultado esperado: 1',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [inputA, inputB, and1, not1, and2, nor1, not2, and3, and4, nor2, not3, or1, output],
    wires: [
      // Rama superior
      // A -> AND1 input1
      makeWire([t(inputA, 0), { x: 150, y: 200 }, { x: 150, y: 140 }, t(and1, 0)]),
      // B -> AND1 input2
      makeWire([t(inputB, 0), { x: 150, y: 300 }, { x: 150, y: 160 }, t(and1, 1)]),
      
      // A -> NOT1
      makeWire([t(inputA, 0), { x: 170, y: 200 }, { x: 170, y: 250 }, t(not1, 0)]),
      // NOT1 -> AND2 input1
      makeWire([t(not1, 1), t(and2, 0)]),
      // B -> AND2 input2
      makeWire([t(inputB, 0), { x: 170, y: 300 }, { x: 170, y: 260 }, t(and2, 1)]),
      
      // AND1 -> NOR1 input1
      makeWire([t(and1, 2), { x: 230, y: 150 }, { x: 230, y: 190 }, t(nor1, 0)]),
      // AND2 -> NOR1 input2
      makeWire([t(and2, 2), { x: 330, y: 250 }, { x: 330, y: 210 }, t(nor1, 1)]),
      
      // Rama inferior
      // A -> NOT2
      makeWire([t(inputA, 0), { x: 180, y: 200 }, { x: 180, y: 350 }, t(not2, 0)]),
      // NOT2 -> AND3 input1
      makeWire([t(not2, 1), t(and3, 0)]),
      // B -> AND3 input2
      makeWire([t(inputB, 0), { x: 190, y: 300 }, { x: 190, y: 360 }, t(and3, 1)]),
      
      // A -> AND4 input1 (a través de NOT)
      makeWire([t(inputA, 0), { x: 160, y: 200 }, { x: 160, y: 450 }, t(and4, 0)]),
      // B -> AND4 input2
      makeWire([t(inputB, 0), { x: 160, y: 300 }, { x: 160, y: 460 }, t(and4, 1)]),
      
      // AND3 -> NOR2 input1
      makeWire([t(and3, 2), { x: 330, y: 350 }, { x: 330, y: 390 }, t(nor2, 0)]),
      // AND4 -> NOR2 input2
      makeWire([t(and4, 2), { x: 330, y: 450 }, { x: 330, y: 410 }, t(nor2, 1)]),
      
      // NOR2 -> NOT3
      makeWire([t(nor2, 2), t(not3, 0)]),
      
      // Salida final
      // NOR1 -> OR1 input1
      makeWire([t(nor1, 2), { x: 430, y: 200 }, { x: 430, y: 290 }, t(or1, 0)]),
      // NOT3 -> OR1 input2
      makeWire([t(not3, 1), { x: 530, y: 400 }, { x: 530, y: 310 }, t(or1, 1)]),
      
      // OR1 -> Output
      makeWire([t(or1, 2), t(output, 0)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
