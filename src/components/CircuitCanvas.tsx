import React, { useCallback } from 'react';
import { CircuitComponent, Wire, Point, GRID_SIZE } from '../types';

interface Props {
  components: CircuitComponent[];
  wires: Wire[];
  selectedId: string | null;
  showValues: boolean;
  simulationResults: Map<string, { current: number; voltage: number }>;
  onMouseDown: (e: React.MouseEvent, point: Point) => void;
  onMouseMove: (e: React.MouseEvent, point: Point) => void;
  onMouseUp: (e: React.MouseEvent, point: Point) => void;
  onComponentClick: (id: string) => void;
  onWireClick: (id: string) => void;
  panOffset: Point;
  zoom: number;
  currentWirePoints?: Point[];
  isDrawing?: boolean;
  mousePoint?: Point | null;
}

function snapToGrid(point: Point): Point {
  return { x: Math.round(point.x / GRID_SIZE) * GRID_SIZE, y: Math.round(point.y / GRID_SIZE) * GRID_SIZE };
}

const STROKE = '#1f2937';
const STROKE_SEL = '#2563eb';
const FILL_LAMP = '#fef08a';

function color(sel: boolean) { return sel ? STROKE_SEL : STROKE; }

function renderComponent(comp: CircuitComponent, isSelected: boolean, showValues: boolean, sim?: { current: number; voltage: number }) {
  const { type, rotation, position } = comp;
  const c = color(isSelected);
  const sw = 2;

  let symbol: React.ReactNode;

  switch (type) {
    case 'resistor':
      symbol = <path d="M-30,0 L-18,0 L-14,-7 L-6,7 L2,-7 L10,7 L18,-7 L22,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>;
      break;
    case 'potentiometer':
      symbol = <g>
        <path d="M-30,0 L-18,0 L-14,-7 L-6,7 L2,-7 L10,7 L18,-7 L22,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M0,12 L0,-12 M-4,-10 L0,-14 L4,-10" fill="none" stroke={c} strokeWidth={1.5}/>
      </g>;
      break;
    case 'battery':
      symbol = <g>
        <path d="M-30,0 L-10,0" fill="none" stroke={c} strokeWidth={sw}/>
        <line x1="-10" y1="-14" x2="-10" y2="14" stroke={c} strokeWidth={3}/>
        <line x1="-4" y1="-8" x2="-4" y2="8" stroke={c} strokeWidth={sw}/>
        <line x1="2" y1="-14" x2="2" y2="14" stroke={c} strokeWidth={3}/>
        <line x1="8" y1="-8" x2="8" y2="8" stroke={c} strokeWidth={sw}/>
        <path d="M8,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
        <text x="-14" y="-16" fontSize="8" fill={c}>+</text>
      </g>;
      break;
    case 'voltage_source':
      symbol = <g>
        <path d="M-30,0 L-15,0" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="0" cy="0" r="15" fill="none" stroke={c} strokeWidth={sw}/>
        <text x="-6" y="4" fontSize="12" fontWeight="bold" fill={c}>+</text>
        <text x="2" y="4" fontSize="12" fill={c}>−</text>
        <path d="M15,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'current_source':
      symbol = <g>
        <path d="M-30,0 L-15,0" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="0" cy="0" r="15" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-6,0 L6,0 M3,-3 L6,0 L3,3" fill="none" stroke={c} strokeWidth={1.5}/>
        <path d="M15,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'ac_voltage':
      symbol = <g>
        <path d="M-30,0 L-15,0" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="0" cy="0" r="15" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-8,0 Q-4,-8 0,0 Q4,8 8,0" fill="none" stroke={c} strokeWidth={1.5}/>
        <path d="M15,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'ac_current':
      symbol = <g>
        <path d="M-30,0 L-15,0" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="0" cy="0" r="15" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-8,0 Q-4,-8 0,0 Q4,8 8,0" fill="none" stroke={c} strokeWidth={1.5}/>
        <circle cx="0" cy="0" r="3" fill={c}/>
        <path d="M15,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'capacitor':
      symbol = <g>
        <path d="M-30,0 L-5,0" fill="none" stroke={c} strokeWidth={sw}/>
        <line x1="-5" y1="-12" x2="-5" y2="12" stroke={c} strokeWidth={sw}/>
        <line x1="5" y1="-12" x2="5" y2="12" stroke={c} strokeWidth={sw}/>
        <path d="M5,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'inductor':
      symbol = <g>
        <path d="M-30,0 L-20,0" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-20,0 Q-16,-12 -12,0 Q-8,-12 -4,0 Q0,-12 4,0 Q8,-12 12,0 Q16,-12 20,0" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M20,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'diode':
      symbol = <g>
        <path d="M-30,0 L-10,0" fill="none" stroke={c} strokeWidth={sw}/>
        <polygon points="-10,-10 -10,10 10,0" fill="none" stroke={c} strokeWidth={sw}/>
        <line x1="10" y1="-10" x2="10" y2="10" stroke={c} strokeWidth={sw}/>
        <path d="M10,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'zener_diode':
      symbol = <g>
        <path d="M-30,0 L-10,0" fill="none" stroke={c} strokeWidth={sw}/>
        <polygon points="-10,-10 -10,10 10,0" fill="none" stroke={c} strokeWidth={sw}/>
        <line x1="10" y1="-10" x2="10" y2="10" stroke={c} strokeWidth={sw}/>
        <path d="M7,-10 L10,-13" fill="none" stroke={c} strokeWidth={1.5}/>
        <path d="M13,10 L10,13" fill="none" stroke={c} strokeWidth={1.5}/>
        <path d="M10,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'schottky_diode':
      symbol = <g>
        <path d="M-30,0 L-10,0" fill="none" stroke={c} strokeWidth={sw}/>
        <polygon points="-10,-10 -10,10 10,0" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M10,-10 L10,-7 L7,-7 M10,10 L10,7 L13,7" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M10,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'led':
      symbol = <g>
        <path d="M-30,0 L-10,0" fill="none" stroke={c} strokeWidth={sw}/>
        <polygon points="-10,-10 -10,10 10,0" fill={sim && sim.current > 0 ? '#fef08a' : 'none'} stroke={c} strokeWidth={sw}/>
        <line x1="10" y1="-10" x2="10" y2="10" stroke={c} strokeWidth={sw}/>
        <path d="M10,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M3,-16 L8,-21 M6,-19 L8,-21 L5,-21" fill="none" stroke="#eab308" strokeWidth={1}/>
        <path d="M8,-14 L13,-19 M11,-17 L13,-19 L10,-19" fill="none" stroke="#eab308" strokeWidth={1}/>
      </g>;
      break;
    case 'photodiode':
      symbol = <g>
        <path d="M-30,0 L-10,0" fill="none" stroke={c} strokeWidth={sw}/>
        <polygon points="-10,-10 -10,10 10,0" fill="none" stroke={c} strokeWidth={sw}/>
        <line x1="10" y1="-10" x2="10" y2="10" stroke={c} strokeWidth={sw}/>
        <path d="M10,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-15,-18 L-10,-13 M-12,-16 L-10,-13 M-13,-16 L-10,-16" fill="none" stroke="#6b7280" strokeWidth={1}/>
      </g>;
      break;
    case 'npn':
      symbol = <g>
        <path d="M-30,0 L-5,0" fill="none" stroke={c} strokeWidth={sw}/>
        <line x1="-5" y1="-15" x2="-5" y2="15" stroke={c} strokeWidth={sw}/>
        <path d="M-5,-10 L15,-20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-5,10 L15,20" fill="none" stroke={c} strokeWidth={sw}/>
        <polygon points="12,17 15,20 11,20" fill={c}/>
        <path d="M15,-20 L20,-20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M15,20 L20,20" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'pnp':
      symbol = <g>
        <path d="M-30,0 L-5,0" fill="none" stroke={c} strokeWidth={sw}/>
        <line x1="-5" y1="-15" x2="-5" y2="15" stroke={c} strokeWidth={sw}/>
        <path d="M-5,-10 L15,-20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-5,10 L15,20" fill="none" stroke={c} strokeWidth={sw}/>
        <polygon points="-2,-7 -5,-10 -1,-10" fill={c}/>
        <path d="M15,-20 L20,-20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M15,20 L20,20" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'nmos':
      symbol = <g>
        <path d="M-30,0 L-8,0" fill="none" stroke={c} strokeWidth={sw}/>
        <line x1="-5" y1="-15" x2="-5" y2="15" stroke={c} strokeWidth={1} strokeDasharray="3,2"/>
        <path d="M-2,-15 L-2,-5 M-2,-2 L-2,5 M-2,8 L-2,15" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-2,-10 L15,-10 L15,-20 L20,-20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-2,10 L15,10 L15,20 L20,20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-2,0 L-2,10" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'pmos':
      symbol = <g>
        <path d="M-30,0 L-8,0" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="-6" cy="0" r="2" fill="none" stroke={c} strokeWidth={1}/>
        <line x1="-5" y1="-15" x2="-5" y2="15" stroke={c} strokeWidth={1} strokeDasharray="3,2"/>
        <path d="M-2,-15 L-2,-5 M-2,-2 L-2,5 M-2,8 L-2,15" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-2,-10 L15,-10 L15,-20 L20,-20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-2,10 L15,10 L15,20 L20,20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-2,0 L-2,10" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'opamp':
      symbol = <g>
        <polygon points="-20,-25 -20,25 25,0" fill="white" stroke={c} strokeWidth={sw}/>
        <text x="-16" y="-10" fontSize="8" fill={c}>+</text>
        <text x="-16" y="16" fontSize="10" fill={c}>−</text>
        <path d="M-30,-15 L-20,-15" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-30,15 L-20,15" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M25,0 L35,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'switch_spst':
      const closed = comp.properties.closed;
      symbol = <g>
        <path d="M-30,0 L-10,0" fill="none" stroke={c} strokeWidth={sw}/>
        {closed ? <path d="M-10,0 L15,0" fill="none" stroke="#22c55e" strokeWidth={sw}/>
          : <path d="M-10,0 L15,-15" fill="none" stroke="#ef4444" strokeWidth={sw}/>}
        <path d="M10,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="-10" cy="0" r="2" fill={c}/>
        <circle cx="10" cy="0" r="2" fill={c}/>
      </g>;
      break;
    case 'switch_spdt':
      const pos = comp.properties.position || 0;
      symbol = <g>
        <path d="M-30,0 L-10,0" fill="none" stroke={c} strokeWidth={sw}/>
        <path d={`M-10,0 L${pos === 0 ? '15,-15' : '15,15'}`} fill="none" stroke={pos === 0 ? '#22c55e' : '#3b82f6'} strokeWidth={sw}/>
        <path d="M10,-15 L30,-15" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M10,15 L30,15" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="-10" cy="0" r="2" fill={c}/>
        <circle cx="10" cy="-15" r="2" fill={c}/>
        <circle cx="10" cy="15" r="2" fill={c}/>
      </g>;
      break;
    case 'push_button':
      const pressed = comp.properties.closed;
      symbol = <g>
        <path d="M-30,0 L-10,0" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M10,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="-10" cy="0" r="2" fill={c}/>
        <circle cx="10" cy="0" r="2" fill={c}/>
        {pressed ? <line x1="-10" y1="0" x2="10" y2="0" stroke="#22c55e" strokeWidth={sw}/>
          : <g>
            <line x1="-10" y1="-3" x2="10" y2="-3" stroke="#ef4444" strokeWidth={sw}/>
            <line x1="0" y1="-3" x2="0" y2="-12" stroke={c} strokeWidth={1.5}/>
            <rect x="-5" y="-15" width="10" height="3" fill={c}/>
          </g>}
      </g>;
      break;
    case 'transformer':
      symbol = <g>
        <path d="M-25,-20 L-25,-20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-25,-20 L-15,-20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-15,-20 Q-11,-28 -7,-20 Q-3,-28 1,-20 Q5,-28 9,-20 Q13,-28 15,-20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M15,-20 L25,-20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-25,20 L-15,20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M-15,20 Q-11,12 -7,20 Q-3,12 1,20 Q5,12 9,20 Q13,12 15,20" fill="none" stroke={c} strokeWidth={sw}/>
        <path d="M15,20 L25,20" fill="none" stroke={c} strokeWidth={sw}/>
        <line x1="-3" y1="-15" x2="-3" y2="15" stroke={c} strokeWidth={1}/>
        <line x1="0" y1="-15" x2="0" y2="15" stroke={c} strokeWidth={1}/>
      </g>;
      break;
    case 'lamp':
      symbol = <g>
        <path d="M-30,0 L-12,0" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="0" cy="0" r="12" fill={sim && sim.current > 0 ? FILL_LAMP : 'none'} stroke={c} strokeWidth={sw}/>
        <line x1="-8" y1="-8" x2="8" y2="8" stroke={c} strokeWidth={1.5}/>
        <line x1="8" y1="-8" x2="-8" y2="8" stroke={c} strokeWidth={1.5}/>
        <path d="M12,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'ground':
      symbol = <g>
        <line x1="0" y1="-20" x2="0" y2="0" stroke={c} strokeWidth={sw}/>
        <line x1="-15" y1="0" x2="15" y2="0" stroke={c} strokeWidth={sw}/>
        <line x1="-10" y1="5" x2="10" y2="5" stroke={c} strokeWidth={sw}/>
        <line x1="-5" y1="10" x2="5" y2="10" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'voltage_label':
      symbol = <g>
        <circle cx="0" cy="0" r="3" fill={c}/>
        <text x="5" y="-5" fontSize="9" fill={c} fontWeight="bold">{comp.label}</text>
      </g>;
      break;
    case 'voltmeter':
      symbol = <g>
        <path d="M-30,0 L-15,0" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="0" cy="0" r="15" fill="white" stroke={c} strokeWidth={sw}/>
        <text x="-5" y="5" fontSize="14" fontWeight="bold" fill={c}>V</text>
        <path d="M15,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'ammeter':
      symbol = <g>
        <path d="M-30,0 L-15,0" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="0" cy="0" r="15" fill="white" stroke={c} strokeWidth={sw}/>
        <text x="-5" y="5" fontSize="14" fontWeight="bold" fill={c}>A</text>
        <path d="M15,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'ohmmeter':
      symbol = <g>
        <path d="M-30,0 L-15,0" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="0" cy="0" r="15" fill="white" stroke={c} strokeWidth={sw}/>
        <text x="-6" y="5" fontSize="12" fontWeight="bold" fill={c}>Ω</text>
        <path d="M15,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'vcvs':
      symbol = <g>
        <path d="M-30,0 L-15,0" fill="none" stroke={c} strokeWidth={sw}/>
        <polygon points="-15,-15 -15,15 15,0" fill="white" stroke={c} strokeWidth={sw}/>
        <text x="-5" y="4" fontSize="8" fill={c}>E</text>
        <path d="M15,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'vccs':
      symbol = <g>
        <path d="M-30,0 L-15,0" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="0" cy="0" r="15" fill="white" stroke={c} strokeWidth={sw}/>
        <text x="-5" y="4" fontSize="8" fill={c}>G</text>
        <path d="M15,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'ccvs':
      symbol = <g>
        <path d="M-30,0 L-15,0" fill="none" stroke={c} strokeWidth={sw}/>
        <polygon points="-15,-15 -15,15 15,0" fill="white" stroke={c} strokeWidth={sw}/>
        <text x="-5" y="4" fontSize="8" fill={c}>H</text>
        <path d="M15,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    case 'cccs':
      symbol = <g>
        <path d="M-30,0 L-15,0" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="0" cy="0" r="15" fill="white" stroke={c} strokeWidth={sw}/>
        <text x="-5" y="4" fontSize="8" fill={c}>F</text>
        <path d="M15,0 L30,0" fill="none" stroke={c} strokeWidth={sw}/>
      </g>;
      break;
    default:
      symbol = <rect x="-15" y="-10" width="30" height="20" fill="none" stroke={c} strokeWidth={sw}/>;
  }

  // Terminal dots
  const terminals = comp.terminals.map((t, i) => (
    <circle key={i} cx={t.position.x - position.x} cy={t.position.y - position.y} r="3" fill={c}/>
  ));

  return (
    <g transform={`translate(${position.x}, ${position.y}) rotate(${rotation})`}>
      {symbol}
      {terminals}
      {showValues && type !== 'ground' && type !== 'voltage_label' && (
        <g transform={`rotate(${-rotation})`}>
          <text x="0" y="-22" textAnchor="middle" fontSize="9" fill="#6b7280"
            transform={`rotate(${rotation})`}>
            {comp.label} {comp.value ? `${comp.value}${comp.unit}` : ''}
          </text>
        </g>
      )}
      {sim && (
        <g transform={`rotate(${-rotation})`}>
          <text x="0" y="28" textAnchor="middle" fontSize="8" fill="#059669"
            transform={`rotate(${rotation})`}>
            {sim.voltage !== 0 ? `${sim.voltage.toFixed(2)}V` : ''}
            {sim.current !== 0 ? ` ${(sim.current * 1000).toFixed(2)}mA` : ''}
          </text>
        </g>
      )}
    </g>
  );
}

function renderWire(wire: Wire, isSelected: boolean) {
  if (wire.points.length < 2) return null;
  const d = wire.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const c = isSelected ? STROKE_SEL : STROKE;
  return (
    <g>
      <path d={d} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  );
}

export default function CircuitCanvas({ 
  components, wires, selectedId, showValues, simulationResults,
  onMouseDown, onMouseMove, onMouseUp, onComponentClick, onWireClick,
  panOffset, zoom, currentWirePoints = [], isDrawing = false, mousePoint = null
}: Props) {
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const point = snapToGrid({ x: (e.clientX - rect.left - panOffset.x) / zoom, y: (e.clientY - rect.top - panOffset.y) / zoom });
    onMouseDown(e, point);
  }, [onMouseDown, panOffset, zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    // Punto sin snap para seguimiento suave del mouse
    const rawPoint = { x: (e.clientX - rect.left - panOffset.x) / zoom, y: (e.clientY - rect.top - panOffset.y) / zoom };
    onMouseMove(e, rawPoint);
  }, [onMouseMove, panOffset, zoom]);

  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const point = snapToGrid({ x: (e.clientX - rect.left - panOffset.x) / zoom, y: (e.clientY - rect.top - panOffset.y) / zoom });
    onMouseUp(e, point);
  }, [onMouseUp, panOffset, zoom]);

  return (
    <svg className="w-full h-full cursor-crosshair" style={{ background: '#f8f9fa' }}
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}>
      <defs>
        {/* Grid pattern - visible gray lines like CircuitLab */}
        <pattern id="smallGrid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse"
          patternTransform={`translate(${panOffset.x % (GRID_SIZE * zoom)}, ${panOffset.y % (GRID_SIZE * zoom)}) scale(${zoom})`}>
          <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#d1d5db" strokeWidth="0.5"/>
        </pattern>
        <pattern id="grid" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse"
          patternTransform={`translate(${panOffset.x % (GRID_SIZE * 5 * zoom)}, ${panOffset.y % (GRID_SIZE * 5 * zoom)}) scale(${zoom})`}>
          <rect width={GRID_SIZE * 5} height={GRID_SIZE * 5} fill="url(#smallGrid)"/>
          <path d={`M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}`} fill="none" stroke="#9ca3af" strokeWidth="0.8"/>
        </pattern>
      </defs>
      
      <rect width="100%" height="100%" fill="#f8f9fa"/>
      <rect width="100%" height="100%" fill="url(#grid)"/>
      
      <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
        {wires.map(wire => (
          <g key={wire.id} onClick={(e) => { e.stopPropagation(); onWireClick(wire.id); }} className="cursor-pointer">
            {renderWire(wire, selectedId === wire.id)}
          </g>
        ))}
        {components.map(comp => (
          <g key={comp.id} onClick={(e) => { e.stopPropagation(); onComponentClick(comp.id); }} className="cursor-pointer">
            {renderComponent(comp, selectedId === comp.id, showValues, simulationResults.get(comp.id))}
          </g>
        ))}
        {isDrawing && (
          <g>
            {/* Puntos fijos ya colocados */}
            {currentWirePoints.length > 0 && (
              <>
                <path d={currentWirePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')}
                  fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                {currentWirePoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6"/>
                ))}
              </>
            )}
            {/* Línea suave siguiendo el mouse */}
            {mousePoint && currentWirePoints.length > 0 && (
              <path 
                d={`M${currentWirePoints[currentWirePoints.length - 1].x},${currentWirePoints[currentWirePoints.length - 1].y} L${mousePoint.x},${mousePoint.y}`}
                fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4,4" strokeLinecap="round" opacity="0.6"/>
            )}
            {/* Punto inicial si aún no hay puntos fijos */}
            {mousePoint && currentWirePoints.length === 0 && (
              <circle cx={mousePoint.x} cy={mousePoint.y} r="4" fill="#3b82f6" opacity="0.5"/>
            )}
          </g>
        )}
      </g>
    </svg>
  );
}
