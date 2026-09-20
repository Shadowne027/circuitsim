import { CircuitData, CircuitComponent, Wire, Point, ComponentType } from '../types';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function getTerminals(type: string, position: Point, rotation: number): { id: string; position: Point }[] {
  if (type === 'ground') {
    return [{ id: 't1', position: { x: position.x, y: position.y - 20 } }];
  }
  const rad = (rotation * Math.PI) / 180;
  return [
    { id: 't1', position: { x: position.x + Math.round(-30 * Math.cos(rad)), y: position.y + Math.round(-30 * Math.sin(rad)) } },
    { id: 't2', position: { x: position.x + Math.round(30 * Math.cos(rad)), y: position.y + Math.round(30 * Math.sin(rad)) } },
  ];
}

function makeComponent(type: string, position: Point, value: number, unit: string, label: string, rotation = 0, properties: Record<string, any> = {}): CircuitComponent {
  return {
    id: generateId(),
    type: type as any,
    position,
    rotation,
    value,
    unit,
    label,
    terminals: getTerminals(type, position, rotation),
    properties,
  };
}

function makeWire(points: Point[]): Wire {
  return { id: generateId(), points };
}

// Helper: get terminal positions for a component
function t(comp: CircuitComponent, idx: number): Point {
  return comp.terminals[idx].position;
}

export function getOhmLawExample(): CircuitData {
  // Simple circuit: Battery 12V -> Resistor 1kΩ -> Ground
  // V1 at (200, 200), horizontal: t1=(170,200) positivo, t2=(230,200) negativo
  // R1 at (300, 300), vertical (90°): t1=(300,270), t2=(300,330)
  // GND at (200, 400): t1=(200,380)
  const v1 = makeComponent('voltage_source', { x: 200, y: 200 }, 12, 'V', 'V1');
  const r1 = makeComponent('resistor', { x: 300, y: 300 }, 1000, 'Ω', 'R1', 90);
  const g1 = makeComponent('ground', { x: 200, y: 400 }, 0, 'V', 'GND');

  return {
    version: '1.0.0',
    name: 'Ley de Ohm - Ejemplo Básico',
    description: 'Circuito simple: V=12V, R=1kΩ → I=12mA. V = I × R',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [v1, r1, g1],
    wires: [
      // V1 t1 (170,200) positivo -> R1 t1 (300,270)
      makeWire([t(v1, 0), { x: 170, y: 270 }, t(r1, 0)]),
      // R1 t2 (300,330) -> GND t1 (200,380)
      makeWire([t(r1, 1), { x: 300, y: 380 }, t(g1, 0)]),
      // GND t1 (200,380) -> V1 t2 (230,200) negativo
      makeWire([t(g1, 0), { x: 100, y: 380 }, { x: 100, y: 200 }, t(v1, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}

export function getSeriesCircuitExample(): CircuitData {
  // Series: V1(24V) -> R1(100Ω) -> R2(220Ω) -> R3(330Ω) -> GND
  // V1 at (150, 150), horizontal: t1=(120,150), t2=(180,150)
  // R1 at (150, 260), vertical: t1=(150,230), t2=(150,290)
  // R2 at (150, 360), vertical: t1=(150,330), t2=(150,390)
  // R3 at (150, 460), vertical: t1=(150,430), t2=(150,490)
  // GND at (150, 560): t1=(150,540)
  const v1 = makeComponent('voltage_source', { x: 150, y: 150 }, 24, 'V', 'V1');
  const r1 = makeComponent('resistor', { x: 150, y: 260 }, 100, 'Ω', 'R1', 90);
  const r2 = makeComponent('resistor', { x: 150, y: 360 }, 220, 'Ω', 'R2', 90);
  const r3 = makeComponent('resistor', { x: 150, y: 460 }, 330, 'Ω', 'R3', 90);
  const g1 = makeComponent('ground', { x: 150, y: 560 }, 0, 'V', 'GND');

  return {
    version: '1.0.0',
    name: 'Circuito Serie',
    description: 'R_total = R1+R2+R3 = 650Ω. I = V/R = 24/650 = 36.9mA',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [v1, r1, r2, r3, g1],
    wires: [
      // V1 t1 (120,150) positivo -> R1 t1 (150,230)
      makeWire([t(v1, 0), { x: 60, y: 150 }, { x: 60, y: 260 }, t(r1, 0)]),
      // R1 t2 (150,290) -> R2 t1 (150,330)
      makeWire([t(r1, 1), t(r2, 0)]),
      // R2 t2 (150,390) -> R3 t1 (150,430)
      makeWire([t(r2, 1), t(r3, 0)]),
      // R3 t2 (150,490) -> GND t1 (150,540)
      makeWire([t(r3, 1), t(g1, 0)]),
      // GND -> V1 t2 (180,150) negativo
      makeWire([t(g1, 0), { x: 300, y: 540 }, { x: 300, y: 150 }, t(v1, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}

export function getParallelCircuitExample(): CircuitData {
  // Parallel: V1(12V) with R1(1kΩ) and R2(2kΩ) in parallel
  // V1 at (100, 300), vertical (90°): t1=(100,270), t2=(100,330)
  // R1 at (250, 200), horizontal: t1=(220,200), t2=(280,200)
  // R2 at (250, 400), horizontal: t1=(220,400), t2=(280,400)
  // GND at (100, 450): t1=(100,430)
  const v1 = makeComponent('voltage_source', { x: 100, y: 300 }, 12, 'V', 'V1', 90);
  const r1 = makeComponent('resistor', { x: 250, y: 200 }, 1000, 'Ω', 'R1');
  const r2 = makeComponent('resistor', { x: 250, y: 400 }, 2000, 'Ω', 'R2');
  const g1 = makeComponent('ground', { x: 100, y: 450 }, 0, 'V', 'GND');

  return {
    version: '1.0.0',
    name: 'Circuito Paralelo',
    description: 'R_total = (R1×R2)/(R1+R2) = 666.7Ω. Cada rama tiene su propia corriente.',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [v1, r1, r2, g1],
    wires: [
      // V1 t1 (100,270) positivo -> R1 t1 (220,200) and R2 t1 (220,400)
      makeWire([t(v1, 0), { x: 100, y: 200 }, t(r1, 0)]),
      makeWire([{ x: 100, y: 200 }, { x: 100, y: 400 }, t(r2, 0)]),
      // R1 t2 (280,200) -> R2 t2 (280,400) -> GND
      makeWire([t(r1, 1), { x: 400, y: 200 }, { x: 400, y: 400 }, t(r2, 1)]),
      makeWire([{ x: 400, y: 400 }, { x: 400, y: 450 }, { x: 100, y: 450 }, t(g1, 0)]),
      // GND -> V1 t2 (100,330) negativo
      makeWire([t(g1, 0), t(v1, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}

export function getLEDExample(): CircuitData {
  // LED circuit: V1(9V) -> R1(330Ω) -> LED(2V) -> GND
  // V1 at (150, 150), horizontal: t1=(120,150), t2=(180,150)
  // R1 at (150, 260), vertical: t1=(150,230), t2=(150,290)
  // LED at (150, 370), vertical: t1=(150,340), t2=(150,400)
  // GND at (150, 470): t1=(150,450)
  const v1 = makeComponent('voltage_source', { x: 150, y: 150 }, 9, 'V', 'V1');
  const r1 = makeComponent('resistor', { x: 150, y: 260 }, 330, 'Ω', 'R1', 90);
  const led1 = makeComponent('led', { x: 150, y: 370 }, 2, 'V', 'LED1', 90);
  const g1 = makeComponent('ground', { x: 150, y: 470 }, 0, 'V', 'GND');

  return {
    version: '1.0.0',
    name: 'Circuito con LED',
    description: 'LED con resistencia limitadora. I = (9V-2V)/330Ω ≈ 21mA',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [v1, r1, led1, g1],
    wires: [
      // V1 t1 (120,150) positivo -> R1 t1 (150,230)
      makeWire([t(v1, 0), { x: 60, y: 150 }, { x: 60, y: 260 }, t(r1, 0)]),
      // R1 t2 (150,290) -> LED t1 (150,340)
      makeWire([t(r1, 1), t(led1, 0)]),
      // LED t2 (150,400) -> GND t1 (150,450)
      makeWire([t(led1, 1), t(g1, 0)]),
      // GND -> V1 t2 (180,150) negativo
      makeWire([t(g1, 0), { x: 300, y: 450 }, { x: 300, y: 150 }, t(v1, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}

export function getSwitchExample(): CircuitData {
  // Switch + Lamp: V1(12V) -> Switch -> Lamp -> GND
  // V1 at (150, 150), horizontal: t1=(120,150), t2=(180,150)
  // Switch at (150, 260), horizontal: t1=(120,260), t2=(180,260)
  // Lamp at (150, 370), vertical: t1=(150,340), t2=(150,400)
  // GND at (150, 470): t1=(150,450)
  const v1 = makeComponent('voltage_source', { x: 150, y: 150 }, 12, 'V', 'V1');
  const s1 = makeComponent('switch_spst', { x: 150, y: 260 }, 0, '', 'S1', 0, { closed: false });
  const lamp = makeComponent('lamp', { x: 150, y: 370 }, 100, 'Ω', 'L1', 90);
  const g1 = makeComponent('ground', { x: 150, y: 470 }, 0, 'V', 'GND');

  return {
    version: '1.0.0',
    name: 'Interruptor y Lámpara',
    description: 'Control de lámpara con interruptor. ¡Cambia el estado del switch y simula!',
    author: 'CircuitSim',
    date: new Date().toISOString(),
    components: [v1, s1, lamp, g1],
    wires: [
      // V1 t1 (120,150) positivo -> Switch t1 (120,260)
      makeWire([t(v1, 0), { x: 60, y: 150 }, { x: 60, y: 260 }, t(s1, 0)]),
      // Switch t2 (180,260) -> Lamp t1 (150,340)
      makeWire([t(s1, 1), { x: 250, y: 260 }, { x: 250, y: 370 }, t(lamp, 0)]),
      // Lamp t2 (150,400) -> GND t1 (150,450)
      makeWire([t(lamp, 1), t(g1, 0)]),
      // GND -> V1 t2 (180,150) negativo
      makeWire([t(g1, 0), { x: 300, y: 450 }, { x: 300, y: 150 }, t(v1, 1)]),
    ],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}
