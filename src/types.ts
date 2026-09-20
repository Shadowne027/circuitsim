export type ComponentType = 
  // Essentials
  | 'wire' 
  | 'ground'
  | 'voltage_label'
  // DC Sources
  | 'battery'
  | 'voltage_source' 
  | 'current_source'
  // Passive Elements
  | 'resistor' 
  | 'capacitor' 
  | 'inductor'
  | 'potentiometer'
  // Diodes
  | 'diode'
  | 'zener_diode'
  | 'schottky_diode'
  | 'led'
  | 'photodiode'
  // Transistors
  | 'npn'
  | 'pnp'
  | 'nmos'
  | 'pmos'
  // Op-Amps
  | 'opamp'
  // Switches
  | 'switch_spst'
  | 'switch_spdt'
  | 'push_button'
  // Transformers
  | 'transformer'
  // Sources AC
  | 'ac_voltage'
  | 'ac_current'
  // Controlled Sources
  | 'vcvs'
  | 'vccs'
  | 'ccvs'
  | 'cccs'
  // Probes / Meters
  | 'voltmeter'
  | 'ammeter'
  | 'ohmmeter'
  // Lamps
  | 'lamp';

export interface Point {
  x: number;
  y: number;
}

export interface Terminal {
  id: string;
  position: Point;
  label?: string;
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

export interface CircuitData {
  version: string;
  name: string;
  description: string;
  author: string;
  date: string;
  components: CircuitComponent[];
  wires: Wire[];
  nodes: { id: string; position: Point; connections: string[] }[];
  gridSize: number;
  canvasWidth: number;
  canvasHeight: number;
}

export type Tool = 'select' | 'wire' | ComponentType;

export const GRID_SIZE = 20;

export const COMPONENT_DEFAULTS: Record<ComponentType, { value: number; unit: string; label: string }> = {
  // Essentials
  wire: { value: 0, unit: '', label: '' },
  ground: { value: 0, unit: 'V', label: 'GND' },
  voltage_label: { value: 0, unit: 'V', label: 'NET' },
  // DC Sources
  battery: { value: 9, unit: 'V', label: 'BAT' },
  voltage_source: { value: 12, unit: 'V', label: 'V' },
  current_source: { value: 0.01, unit: 'A', label: 'I' },
  // Passive
  resistor: { value: 1000, unit: 'Ω', label: 'R' },
  capacitor: { value: 0.000001, unit: 'F', label: 'C' },
  inductor: { value: 0.001, unit: 'H', label: 'L' },
  potentiometer: { value: 10000, unit: 'Ω', label: 'VR' },
  // Diodes
  diode: { value: 0.7, unit: 'V', label: 'D' },
  zener_diode: { value: 5.1, unit: 'V', label: 'DZ' },
  schottky_diode: { value: 0.3, unit: 'V', label: 'DS' },
  led: { value: 2, unit: 'V', label: 'LED' },
  photodiode: { value: 0.5, unit: 'V', label: 'PD' },
  // Transistors
  npn: { value: 100, unit: 'β', label: 'Q' },
  pnp: { value: 100, unit: 'β', label: 'Q' },
  nmos: { value: 2, unit: 'V', label: 'M' },
  pmos: { value: 2, unit: 'V', label: 'M' },
  // Op-Amp
  opamp: { value: 100000, unit: 'A/V', label: 'U' },
  // Switches
  switch_spst: { value: 0, unit: '', label: 'SW' },
  switch_spdt: { value: 0, unit: '', label: 'SW' },
  push_button: { value: 0, unit: '', label: 'PB' },
  // Transformer
  transformer: { value: 1, unit: ':1', label: 'T' },
  // AC Sources
  ac_voltage: { value: 120, unit: 'V', label: 'VS' },
  ac_current: { value: 0.01, unit: 'A', label: 'IS' },
  // Controlled Sources
  vcvs: { value: 1, unit: 'V/V', label: 'E' },
  vccs: { value: 0.001, unit: 'A/V', label: 'G' },
  ccvs: { value: 1, unit: 'V/A', label: 'H' },
  cccs: { value: 1, unit: 'A/A', label: 'F' },
  // Probes
  voltmeter: { value: 0, unit: 'V', label: 'VM' },
  ammeter: { value: 0, unit: 'A', label: 'AM' },
  ohmmeter: { value: 0, unit: 'Ω', label: 'OM' },
  // Lamp
  lamp: { value: 100, unit: 'Ω', label: 'LP' },
};
