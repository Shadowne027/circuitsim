import React from 'react';
import { CircuitComponent, Wire, SimulationData } from '../types';
import { formatValue } from '../utils/fileHandler';

interface Props {
  selectedComponent: CircuitComponent | null;
  selectedWire: Wire | null;
  onUpdateComponent: (id: string, updates: Partial<CircuitComponent>) => void;
  onDeleteComponent: (id: string) => void;
  onRotateComponent: (id: string) => void;
  simulationData: SimulationData | null;
}

export default function PropertiesPanel({ 
  selectedComponent, selectedWire, onUpdateComponent, onDeleteComponent, onRotateComponent, simulationData 
}: Props) {
  if (selectedWire && !selectedComponent) {
    return (
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700">🔌 Cable</h3>
          <button 
            onClick={() => onDeleteComponent(selectedWire.id)}
            className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
          >
            ✕ Eliminar
          </button>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Puntos</label>
          <div className="text-xs text-gray-600 space-y-0.5">
            {selectedWire.points.map((p, i) => (
              <div key={i} className="font-mono">P{i+1}: ({p.x}, {p.y})</div>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Longitud</label>
          <div className="text-xs text-gray-600 font-mono">
            {selectedWire.points.length - 1} segmentos
          </div>
        </div>
        <div className="border-t border-gray-100 pt-2 mt-2">
          <span className="text-[9px] text-gray-300">ID: {selectedWire.id}</span>
        </div>
      </div>
    );
  }

  if (!selectedComponent) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        <div className="text-3xl mb-2">⊕</div>
        <p>Selecciona un componente para ver sus propiedades</p>
        <div className="mt-4 text-left text-xs text-gray-500 space-y-2">
          <p className="font-semibold text-gray-600">Atajos de teclado:</p>
          <p>• <kbd className="bg-gray-100 px-1 rounded">Del</kbd> - Eliminar</p>
          <p>• <kbd className="bg-gray-100 px-1 rounded">R</kbd> - Rotar</p>
          <p>• <kbd className="bg-gray-100 px-1 rounded">Esc</kbd> - Deseleccionar</p>
          <p>• <kbd className="bg-gray-100 px-1 rounded">Ctrl+S</kbd> - Guardar</p>
          <p>• <kbd className="bg-gray-100 px-1 rounded">Ctrl+Z</kbd> - Deshacer</p>
        </div>
      </div>
    );
  }

  const comp = selectedComponent;
  const simResult = simulationData?.branchCurrents.find(b => b.componentId === comp.id);

  const handleValueChange = (value: number) => {
    onUpdateComponent(comp.id, { value });
  };

  const handleLabelChange = (label: string) => {
    onUpdateComponent(comp.id, { label });
  };

  const getUnitOptions = (type: string) => {
    switch (type) {
      case 'resistor':
      case 'lamp':
        return [
          { value: 1, label: 'Ω' },
          { value: 1000, label: 'kΩ' },
          { value: 1000000, label: 'MΩ' },
        ];
      case 'voltage_source':
      case 'led':
        return [
          { value: 1, label: 'V' },
          { value: 0.001, label: 'mV' },
        ];
      case 'current_source':
        return [
          { value: 1, label: 'A' },
          { value: 0.001, label: 'mA' },
        ];
      case 'capacitor':
        return [
          { value: 1, label: 'F' },
          { value: 0.001, label: 'mF' },
          { value: 0.000001, label: 'µF' },
          { value: 0.000000001, label: 'nF' },
          { value: 0.000000000001, label: 'pF' },
        ];
      case 'inductor':
        return [
          { value: 1, label: 'H' },
          { value: 0.001, label: 'mH' },
          { value: 0.000001, label: 'µH' },
        ];
      default:
        return [];
    }
  };

  const unitOptions = getUnitOptions(comp.type);

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 capitalize">
          {comp.type.replace('_', ' ')}
        </h3>
        <div className="flex gap-1">
          <button 
            onClick={() => onRotateComponent(comp.id)}
            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
            title="Rotar (R)"
          >
            ↻
          </button>
          <button 
            onClick={() => onDeleteComponent(comp.id)}
            className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
            title="Eliminar (Del)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Label */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">Etiqueta</label>
        <input 
          type="text" 
          value={comp.label}
          onChange={(e) => handleLabelChange(e.target.value)}
          className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/* Value */}
      {comp.type !== 'ground' && comp.type !== 'switch' && (
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Valor ({comp.unit})
          </label>
          <input 
            type="number" 
            value={comp.value}
            onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
            className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:border-blue-400 focus:outline-none"
            step="any"
          />
          {unitOptions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {unitOptions.map(opt => (
                <button 
                  key={opt.label}
                  onClick={() => {
                    // Convert current value to base unit then to new unit
                    const baseValue = comp.value * getBaseMultiplier(comp.type, comp.unit);
                    handleValueChange(baseValue / opt.value);
                    onUpdateComponent(comp.id, { unit: opt.label });
                  }}
                  className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    comp.unit === opt.label ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Switch toggle */}
      {comp.type === 'switch' && (
        <div>
          <label className="text-xs text-gray-500 block mb-1">Estado</label>
          <button 
            onClick={() => onUpdateComponent(comp.id, { properties: { ...comp.properties, closed: !comp.properties.closed } })}
            className={`w-full text-sm px-3 py-2 rounded border font-medium ${
              comp.properties.closed 
                ? 'bg-green-50 border-green-300 text-green-700' 
                : 'bg-red-50 border-red-300 text-red-700'
            }`}
          >
            {comp.properties.closed ? '🟢 CERRADO (conduce)' : '🔴 ABIERTO (no conduce)'}
          </button>
        </div>
      )}

      {/* Rotation */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">Rotación</label>
        <div className="flex gap-1">
          {[0, 90, 180, 270].map(deg => (
            <button 
              key={deg}
              onClick={() => onUpdateComponent(comp.id, { rotation: deg })}
              className={`flex-1 text-xs py-1 rounded border ${
                comp.rotation === deg ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>

      {/* Position */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">Posición</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <span className="text-[10px] text-gray-400">X:</span>
            <span className="text-xs text-gray-600 ml-1">{comp.position.x}</span>
          </div>
          <div className="flex-1">
            <span className="text-[10px] text-gray-400">Y:</span>
            <span className="text-xs text-gray-600 ml-1">{comp.position.y}</span>
          </div>
        </div>
      </div>

      {/* Simulation Results */}
      {simResult && simulationData?.success && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="text-xs font-semibold text-gray-500 mb-2">📊 RESULTADOS</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Voltaje:</span>
              <span className="font-mono text-blue-700">{formatValue(Math.abs(simResult.voltage), 'V')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Corriente:</span>
              <span className="font-mono text-green-700">{formatValue(Math.abs(simResult.current), 'A')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Potencia:</span>
              <span className="font-mono text-orange-700">{formatValue(simResult.power, 'W')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Component ID (debug) */}
      <div className="border-t border-gray-100 pt-2 mt-2">
        <span className="text-[9px] text-gray-300">ID: {comp.id}</span>
      </div>
    </div>
  );
}

function getBaseMultiplier(type: string, unit: string): number {
  switch (type) {
    case 'resistor':
    case 'lamp':
      if (unit === 'kΩ') return 1000;
      if (unit === 'MΩ') return 1000000;
      return 1;
    case 'voltage_source':
    case 'led':
      if (unit === 'mV') return 0.001;
      return 1;
    case 'current_source':
      if (unit === 'mA') return 0.001;
      return 1;
    case 'capacitor':
      if (unit === 'mF') return 0.001;
      if (unit === 'µF') return 0.000001;
      if (unit === 'nF') return 0.000000001;
      if (unit === 'pF') return 0.000000000001;
      return 1;
    case 'inductor':
      if (unit === 'mH') return 0.001;
      if (unit === 'µH') return 0.000001;
      return 1;
    default:
      return 1;
  }
}
