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
          <button onClick={() => onDeleteComponent(selectedWire.id)}
            className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100">✕ Eliminar</button>
        </div>
        <div className="text-xs text-gray-500">Puntos: {selectedWire.points.length}</div>
      </div>
    );
  }

  if (!selectedComponent) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        <div className="text-3xl mb-2">⊕</div>
        <p className="text-xs">Selecciona un componente</p>
        <div className="mt-4 text-left text-[10px] text-gray-500 space-y-1">
          <p className="font-semibold text-gray-600">Atajos:</p>
          <p>• <kbd className="bg-gray-100 px-1 rounded">Del</kbd> Eliminar</p>
          <p>• <kbd className="bg-gray-100 px-1 rounded">R</kbd> Rotar</p>
          <p>• <kbd className="bg-gray-100 px-1 rounded">Esc</kbd> Deseleccionar</p>
          <p>• <kbd className="bg-gray-100 px-1 rounded">W</kbd> Cable</p>
          <p>• <kbd className="bg-gray-100 px-1 rounded">Ctrl+S</kbd> Guardar</p>
          <p>• <kbd className="bg-gray-100 px-1 rounded">Ctrl+Z</kbd> Deshacer</p>
        </div>
      </div>
    );
  }

  const comp = selectedComponent;
  const simResult = simulationData?.branchCurrents.find(b => b.componentId === comp.id);

  const handleValueChange = (value: number) => { onUpdateComponent(comp.id, { value }); };
  const handleLabelChange = (label: string) => { onUpdateComponent(comp.id, { label }); };

  const isSwitch = comp.type === 'switch_spst' || comp.type === 'switch_spdt' || comp.type === 'push_button';
  const isPassive = ['resistor', 'potentiometer', 'lamp'].includes(comp.type);
  const isSource = ['voltage_source', 'battery', 'current_source', 'ac_voltage', 'ac_current'].includes(comp.type);
  const isDiode = ['diode', 'zener_diode', 'schottky_diode', 'led', 'photodiode'].includes(comp.type);
  const isMeter = ['voltmeter', 'ammeter', 'ohmmeter'].includes(comp.type);
  const noValue = ['ground', 'voltage_label', 'wire'].includes(comp.type);

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700 capitalize">{comp.type.replace(/_/g, ' ')}</h3>
        <div className="flex gap-1">
          <button onClick={() => onRotateComponent(comp.id)} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200" title="Rotar (R)">↻</button>
          <button onClick={() => onDeleteComponent(comp.id)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Eliminar">✕</button>
        </div>
      </div>

      {/* Label */}
      <div>
        <label className="text-[10px] text-gray-500 block mb-0.5">Etiqueta</label>
        <input type="text" value={comp.label} onChange={(e) => handleLabelChange(e.target.value)}
          className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:border-blue-400 focus:outline-none"/>
      </div>

      {/* Value */}
      {!noValue && !isSwitch && !isMeter && (
        <div>
          <label className="text-[10px] text-gray-500 block mb-0.5">Valor ({comp.unit})</label>
          <input type="number" value={comp.value} onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
            className="w-full text-sm px-2 py-1 border border-gray-300 rounded focus:border-blue-400 focus:outline-none" step="any"/>
          {isPassive && (
            <div className="flex flex-wrap gap-0.5 mt-1">
              {[{v:1,l:'Ω'},{v:1000,l:'kΩ'},{v:1e6,l:'MΩ'}].map(o => (
                <button key={o.l} onClick={() => { onUpdateComponent(comp.id, { unit: o.l }); }}
                  className={`text-[9px] px-1.5 py-0.5 rounded border ${comp.unit===o.l?'bg-blue-100 border-blue-300':'bg-gray-50 border-gray-200'}`}>{o.l}</button>
              ))}
            </div>
          )}
          {isSource && comp.unit === 'V' && (
            <div className="flex flex-wrap gap-0.5 mt-1">
              {[{v:1,l:'V'},{v:0.001,l:'mV'}].map(o => (
                <button key={o.l} onClick={() => { onUpdateComponent(comp.id, { unit: o.l }); }}
                  className={`text-[9px] px-1.5 py-0.5 rounded border ${comp.unit===o.l?'bg-blue-100 border-blue-300':'bg-gray-50 border-gray-200'}`}>{o.l}</button>
              ))}
            </div>
          )}
          {isSource && comp.unit === 'A' && (
            <div className="flex flex-wrap gap-0.5 mt-1">
              {[{v:1,l:'A'},{v:0.001,l:'mA'}].map(o => (
                <button key={o.l} onClick={() => { onUpdateComponent(comp.id, { unit: o.l }); }}
                  className={`text-[9px] px-1.5 py-0.5 rounded border ${comp.unit===o.l?'bg-blue-100 border-blue-300':'bg-gray-50 border-gray-200'}`}>{o.l}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Switch toggle */}
      {isSwitch && (
        <div>
          <label className="text-[10px] text-gray-500 block mb-0.5">Estado</label>
          <button onClick={() => onUpdateComponent(comp.id, { properties: { ...comp.properties, closed: !comp.properties.closed } })}
            className={`w-full text-sm px-3 py-2 rounded border font-medium ${
              comp.properties.closed ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'
            }`}>
            {comp.properties.closed ? '🟢 CERRADO' : '🔴 ABIERTO'}
          </button>
          {comp.type === 'switch_spdt' && (
            <button onClick={() => onUpdateComponent(comp.id, { properties: { ...comp.properties, position: comp.properties.position === 0 ? 1 : 0 } })}
              className="w-full mt-1 text-xs px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded">
              Posición: {comp.properties.position === 0 ? 'Arriba' : 'Abajo'}
            </button>
          )}
        </div>
      )}

      {/* Rotation */}
      <div>
        <label className="text-[10px] text-gray-500 block mb-0.5">Rotación</label>
        <div className="flex gap-1">
          {[0, 90, 180, 270].map(deg => (
            <button key={deg} onClick={() => onUpdateComponent(comp.id, { rotation: deg })}
              className={`flex-1 text-[10px] py-1 rounded border ${comp.rotation===deg?'bg-blue-100 border-blue-300 text-blue-700':'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>
              {deg}°
            </button>
          ))}
        </div>
      </div>

      {/* Position */}
      <div>
        <label className="text-[10px] text-gray-500 block mb-0.5">Posición</label>
        <div className="flex gap-2 text-xs text-gray-600">
          <span>X: {comp.position.x}</span>
          <span>Y: {comp.position.y}</span>
        </div>
      </div>

      {/* Simulation Results */}
      {simResult && simulationData?.success && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="text-[10px] font-bold text-gray-500 mb-1">📊 RESULTADOS</div>
          <div className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Voltaje:</span>
              <span className="font-mono text-blue-700">{formatValue(Math.abs(simResult.voltage), 'V')}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Corriente:</span>
              <span className="font-mono text-green-700">{formatValue(Math.abs(simResult.current), 'A')}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Potencia:</span>
              <span className="font-mono text-orange-700">{formatValue(simResult.power, 'W')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
