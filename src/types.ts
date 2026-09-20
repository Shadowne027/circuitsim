export type ComponentType = 
  | 'resistor' 
  | 'voltage_source' 
  | 'current_source'
  | 'capacitor' 
  | 'inductor'
  | 'switch'
  | 'led'
  | 'ground'
  | 'wire'
  | 'lamp'
  | 'ammeter'
  | 'voltmeter';

export interface Point {
  x: number;
  y: number;
}

export interface Terminal {
  id: string;
  position: Point;
  nodeId?: string;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  position: Point;
  rotation: number; // 0, 90, 180, 270
  value: number;
  unit: string;
  label: string;
  terminals: Terminal[];
  properties: Record<string, any>;
}

export interface Wire {
  id: string;
  points: Point[];
  startNodeId?: string;
  endNodeId?: string;
}

export interface Node {
  id: string;
  position: Point;
  connections: string[]; // component/terminal ids
}

export interface CircuitData {
  version: string;
  name: string;
  description: string;
  author: string;
  date: string;
  components: CircuitComponent[];
  wires: Wire[];
  nodes: Node[];
  gridSize: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface SimulationResult {
  nodeId: string;
  voltage: number;
}

export interface BranchCurrent {
  componentId: string;
  current: number;
  voltage: number;
  power: number;
}

export interface SimulationData {
  nodeVoltages: SimulationResult[];
  branchCurrents: BranchCurrent[];
  totalPower: number;
  success: boolean;
  error?: string;
}

export type Tool = 'select' | 'wire' | ComponentType;

export const GRID_SIZE = 20;
export const COMPONENT_WIDTH = 60;
export const COMPONENT_HEIGHT = 30;

export const COMPONENT_DEFAULTS: Record<ComponentType, { value: number; unit: string; label: string }> = {
  resistor: { value: 1000, unit: 'Ω', label: 'R' },
  voltage_source: { value: 12, unit: 'V', label: 'V' },
  current_source: { value: 1, unit: 'A', label: 'I' },
  capacitor: { value: 0.000001, unit: 'F', label: 'C' },
  inductor: { value: 0.001, unit: 'H', label: 'L' },
  switch: { value: 0, unit: '', label: 'S' },
  led: { value: 2, unit: 'V', label: 'LED' },
  ground: { value: 0, unit: 'V', label: 'GND' },
  wire: { value: 0, unit: '', label: '' },
  lamp: { value: 100, unit: 'Ω', label: 'LAMP' },
  ammeter: { value: 0, unit: 'A', label: 'A' },
  voltmeter: { value: 0, unit: 'V', label: 'V' },
};
