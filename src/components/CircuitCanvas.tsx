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
  isDraggingComponent?: boolean;
}

function snapToGrid(point: Point): Point {
  return {
    x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(point.y / GRID_SIZE) * GRID_SIZE,
  };
}

function getComponentPath(type: string, rotation: number): string {
  const paths: Record<string, string> = {
    resistor: 'M-30,0 L-20,0 L-16,-8 L-8,8 L0,-8 L8,8 L16,-8 L20,0 L30,0',
    voltage_source: 'M-30,0 L-15,0 M15,0 L30,0',
    current_source: 'M-30,0 L-15,0 M15,0 L30,0',
    capacitor: 'M-30,0 L-5,0 M-5,-12 L-5,12 M5,-12 L5,12 M5,0 L30,0',
    inductor: 'M-30,0 L-20,0 Q-16,-12 -12,0 Q-8,-12 -4,0 Q0,-12 4,0 Q8,-12 12,0 Q16,-12 20,0 L30,0',
    switch_open: 'M-30,0 L-10,0 M-10,0 L15,-15 M10,0 L30,0',
    switch_closed: 'M-30,0 L-10,0 M-10,0 L15,0 M10,0 L30,0',
    led: 'M-30,0 L-10,0 M-10,-10 L-10,10 L10,0 L-10,-10 M10,0 L30,0',
    ground: 'M0,-15 L0,0 M-15,0 L15,0 M-10,5 L10,5 M-5,10 L5,10',
    lamp: 'M-30,0 L-12,0 M12,0 L30,0',
    ammeter: 'M-30,0 L-15,0 M15,0 L30,0',
    voltmeter: 'M-30,0 L-15,0 M15,0 L30,0',
  };
  return paths[type] || paths.resistor;
}

function renderComponentSymbol(comp: CircuitComponent, isSelected: boolean, showValues: boolean, simResult?: { current: number; voltage: number }) {
  const { type, rotation, position } = comp;
  const transform = `translate(${position.x}, ${position.y}) rotate(${rotation})`;
  
  let symbol: React.ReactNode;
  
  switch (type) {
    case 'resistor':
      symbol = (
        <g>
          <path d="M-30,0 L-20,0 L-16,-8 L-8,8 L0,-8 L8,8 L16,-8 L20,0 L30,0" 
            fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="-30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
          <circle cx="30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
        </g>
      );
      break;
    case 'voltage_source':
      symbol = (
        <g>
          <path d="M-30,0 L-15,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="0" cy="0" r="15" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <text x="-5" y="1" fontSize="10" fontWeight="bold" fill={isSelected ? '#3b82f6' : '#1f2937'}>+</text>
          <text x="3" y="1" fontSize="10" fill={isSelected ? '#3b82f6' : '#1f2937'}>−</text>
          <path d="M15,0 L30,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="-30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
          <circle cx="30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
        </g>
      );
      break;
    case 'current_source':
      symbol = (
        <g>
          <path d="M-30,0 L-15,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="0" cy="0" r="15" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <path d="M-5,0 L5,0 M2,-3 L5,0 L2,3" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="1.5" />
          <path d="M15,0 L30,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="-30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
          <circle cx="30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
        </g>
      );
      break;
    case 'capacitor':
      symbol = (
        <g>
          <path d="M-30,0 L-5,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <line x1="-5" y1="-12" x2="-5" y2="12" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <line x1="5" y1="-12" x2="5" y2="12" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <path d="M5,0 L30,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="-30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
          <circle cx="30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
        </g>
      );
      break;
    case 'inductor':
      symbol = (
        <g>
          <path d="M-30,0 L-20,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <path d="M-20,0 Q-16,-12 -12,0 Q-8,-12 -4,0 Q0,-12 4,0 Q8,-12 12,0 Q16,-12 20,0" 
            fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <path d="M20,0 L30,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="-30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
          <circle cx="30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
        </g>
      );
      break;
    case 'switch':
      const closed = comp.properties.closed;
      symbol = (
        <g>
          <path d="M-30,0 L-10,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          {closed ? (
            <path d="M-10,0 L15,0" fill="none" stroke="#22c55e" strokeWidth="2" />
          ) : (
            <path d="M-10,0 L15,-15" fill="none" stroke="#ef4444" strokeWidth="2" />
          )}
          <path d="M10,0 L30,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="-10" cy="0" r="2" fill={isSelected ? '#3b82f6' : '#1f2937'} />
          <circle cx="10" cy="0" r="2" fill={isSelected ? '#3b82f6' : '#1f2937'} />
          <circle cx="-30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
          <circle cx="30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
        </g>
      );
      break;
    case 'led':
      symbol = (
        <g>
          <path d="M-30,0 L-10,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <polygon points="-10,-10 -10,10 10,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <line x1="10" y1="-10" x2="10" y2="10" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <path d="M10,0 L30,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          {/* Light arrows */}
          <path d="M5,-15 L10,-20 M8,-18 L10,-20 L7,-20" fill="none" stroke="#eab308" strokeWidth="1" />
          <path d="M10,-13 L15,-18 M13,-16 L15,-18 L12,-18" fill="none" stroke="#eab308" strokeWidth="1" />
          <circle cx="-30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
          <circle cx="30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
        </g>
      );
      break;
    case 'ground':
      symbol = (
        <g>
          <line x1="0" y1="-20" x2="0" y2="0" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <line x1="-15" y1="0" x2="15" y2="0" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <line x1="-10" y1="5" x2="10" y2="5" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <line x1="-5" y1="10" x2="5" y2="10" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="0" cy="-20" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
        </g>
      );
      break;
    case 'lamp':
      symbol = (
        <g>
          <path d="M-30,0 L-12,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="0" cy="0" r="12" fill={simResult && simResult.current > 0 ? '#fef08a' : 'none'} 
            stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <line x1="-8" y1="-8" x2="8" y2="8" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="1.5" />
          <line x1="8" y1="-8" x2="-8" y2="8" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="1.5" />
          <path d="M12,0 L30,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="-30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
          <circle cx="30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
        </g>
      );
      break;
    case 'ammeter':
      symbol = (
        <g>
          <path d="M-30,0 L-15,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="0" cy="0" r="15" fill="#fff" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <text x="-4" y="5" fontSize="14" fontWeight="bold" fill={isSelected ? '#3b82f6' : '#1f2937'}>A</text>
          <path d="M15,0 L30,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="-30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
          <circle cx="30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
        </g>
      );
      break;
    case 'voltmeter':
      symbol = (
        <g>
          <path d="M-30,0 L-15,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="0" cy="0" r="15" fill="#fff" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <text x="-5" y="5" fontSize="14" fontWeight="bold" fill={isSelected ? '#3b82f6' : '#1f2937'}>V</text>
          <path d="M15,0 L30,0" fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="-30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
          <circle cx="30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
        </g>
      );
      break;
    default:
      symbol = (
        <g>
          <rect x="-15" y="-10" width="30" height="20" fill="none" 
            stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2" />
          <circle cx="-30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
          <circle cx="30" cy="0" r="3" fill={isSelected ? '#3b82f6' : '#1f2937'} />
        </g>
      );
  }

  return (
    <g transform={transform}>
      {symbol}
      {showValues && type !== 'ground' && (
        <g transform={`rotate(${-rotation})`}>
          <text x="0" y="-20" textAnchor="middle" fontSize="10" fill="#6b7280" 
            transform={`rotate(${rotation})`}>
            {comp.label}{comp.value ? ` ${comp.value}${comp.unit}` : ''}
          </text>
        </g>
      )}
      {simResult && (
        <g transform={`rotate(${-rotation})`}>
          <text x="0" y="25" textAnchor="middle" fontSize="9" fill="#059669"
            transform={`rotate(${rotation})`}>
            {simResult.voltage !== 0 ? `${simResult.voltage.toFixed(2)}V` : ''}
            {simResult.current !== 0 ? ` ${simResult.current.toFixed(4)}A` : ''}
          </text>
        </g>
      )}
    </g>
  );
}

function renderWire(wire: Wire, isSelected: boolean) {
  if (wire.points.length < 2) return null;
  const d = wire.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  return (
    <g>
      <path d={d} fill="none" stroke={isSelected ? '#3b82f6' : '#1f2937'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Junction dots at corners */}
      {wire.points.map((p, i) => (
        i > 0 && i < wire.points.length - 1 ? 
        <circle key={i} cx={p.x} cy={p.y} r="2" fill={isSelected ? '#3b82f6' : '#1f2937'} /> : null
      ))}
    </g>
  );
}

export default function CircuitCanvas({ 
  components, wires, selectedId, showValues, simulationResults,
  onMouseDown, onMouseMove, onMouseUp, onComponentClick, onWireClick,
  panOffset, zoom, currentWirePoints = [], isDrawing = false
}: Props) {
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const point = snapToGrid({
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom,
    });
    onMouseDown(e, point);
  }, [onMouseDown, panOffset, zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const point = snapToGrid({
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom,
    });
    onMouseMove(e, point);
  }, [onMouseMove, panOffset, zoom]);

  const handleMouseUp = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const point = snapToGrid({
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom,
    });
    onMouseUp(e, point);
  }, [onMouseUp, panOffset, zoom]);

  return (
    <svg 
      className="w-full h-full bg-white cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <defs>
        <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse"
          patternTransform={`translate(${panOffset.x % (GRID_SIZE * zoom)}, ${panOffset.y % (GRID_SIZE * zoom)}) scale(${zoom})`}>
          <circle cx={GRID_SIZE/2} cy={GRID_SIZE/2} r="0.5" fill="#d1d5db" />
        </pattern>
        <pattern id="gridLarge" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse"
          patternTransform={`translate(${panOffset.x % (GRID_SIZE * 5 * zoom)}, ${panOffset.y % (GRID_SIZE * 5 * zoom)}) scale(${zoom})`}>
          <circle cx={GRID_SIZE*5/2} cy={GRID_SIZE*5/2} r="1" fill="#9ca3af" />
        </pattern>
      </defs>
      
      {/* Grid background */}
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="url(#gridLarge)" />
      
      <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
        {/* Wires */}
        {wires.map(wire => (
          <g key={wire.id} onClick={(e) => { e.stopPropagation(); onWireClick(wire.id); }}
            className="cursor-pointer">
            {renderWire(wire, selectedId === wire.id)}
          </g>
        ))}
        
        {/* Components */}
        {components.map(comp => (
          <g key={comp.id} onClick={(e) => { e.stopPropagation(); onComponentClick(comp.id); }}
            className="cursor-pointer">
            {renderComponentSymbol(
              comp, 
              selectedId === comp.id, 
              showValues,
              simulationResults.get(comp.id)
            )}
          </g>
        ))}

        {/* Wire being drawn */}
        {isDrawing && currentWirePoints.length > 0 && (
          <g>
            <path 
              d={currentWirePoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')}
              fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" 
              strokeLinecap="round" strokeLinejoin="round"
            />
            {currentWirePoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6" opacity="0.7" />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}
