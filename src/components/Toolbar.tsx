import React from 'react';
import { Tool } from '../types';

interface Props {
  activeTool: Tool;
  onToolSelect: (tool: Tool) => void;
  onSimulate: () => void;
  onClear: () => void;
  onSave: () => void;
  onLoad: () => void;
  onNew: () => void;
  showValues: boolean;
  onToggleValues: () => void;
  showNodes: boolean;
  onToggleNodes: () => void;
  isSimulating: boolean;
}

const tools: { id: Tool; label: string; icon: string; category: string }[] = [
  // Essentials
  { id: 'select', label: 'Seleccionar', icon: '⊹', category: 'essentials' },
  { id: 'wire', label: 'Cable', icon: '╱', category: 'essentials' },
  { id: 'ground', label: 'Tierra', icon: '⏚', category: 'essentials' },
  { id: 'voltage_label', label: 'Etiqueta', icon: '⊙', category: 'essentials' },
  // DC Sources
  { id: 'battery', label: 'Batería', icon: '🔋', category: 'dc_sources' },
  { id: 'voltage_source', label: 'Fuente V', icon: '⊕', category: 'dc_sources' },
  { id: 'current_source', label: 'Fuente I', icon: '⊙', category: 'dc_sources' },
  // AC Sources
  { id: 'ac_voltage', label: 'AC Voltaje', icon: '∿', category: 'ac_sources' },
  { id: 'ac_current', label: 'AC Corriente', icon: '∿', category: 'ac_sources' },
  // Passive
  { id: 'resistor', label: 'Resistencia', icon: '⏦', category: 'passive' },
  { id: 'potentiometer', label: 'Potenciómetro', icon: '⏺', category: 'passive' },
  { id: 'capacitor', label: 'Capacitor', icon: '⊣⊢', category: 'passive' },
  { id: 'inductor', label: 'Inductor', icon: '⌇', category: 'passive' },
  // Diodes
  { id: 'diode', label: 'Diodo', icon: '▷|', category: 'diodes' },
  { id: 'zener_diode', label: 'Zener', icon: '▷⫝', category: 'diodes' },
  { id: 'schottky_diode', label: 'Schottky', icon: '▷⊢', category: 'diodes' },
  { id: 'led', label: 'LED', icon: '💡', category: 'diodes' },
  { id: 'photodiode', label: 'Fotodiodo', icon: '☀', category: 'diodes' },
  // Transistors
  { id: 'npn', label: 'NPN', icon: '▷', category: 'transistors' },
  { id: 'pnp', label: 'PNP', icon: '◁', category: 'transistors' },
  { id: 'nmos', label: 'N-MOSFET', icon: '⊏', category: 'transistors' },
  { id: 'pmos', label: 'P-MOSFET', icon: '⊐', category: 'transistors' },
  // Op-Amp
  { id: 'opamp', label: 'Op-Amp', icon: '△', category: 'opamp' },
  // Switches
  { id: 'switch_spst', label: 'SPST', icon: '⎓', category: 'switches' },
  { id: 'switch_spdt', label: 'SPDT', icon: '⎔', category: 'switches' },
  { id: 'push_button', label: 'Pulsador', icon: '⏃', category: 'switches' },
  // Transformer
  { id: 'transformer', label: 'Transformador', icon: '⊜', category: 'transformers' },
  // Probes
  { id: 'voltmeter', label: 'Voltímetro', icon: 'Ⓥ', category: 'probes' },
  { id: 'ammeter', label: 'Amperímetro', icon: 'Ⓐ', category: 'probes' },
  { id: 'ohmmeter', label: 'Ohmímetro', icon: 'Ω', category: 'probes' },
  // Lamp
  { id: 'lamp', label: 'Lámpara', icon: '⊛', category: 'lamps' },
  // Logic Gates
  { id: 'logic_input', label: 'Entrada', icon: '🔲', category: 'logic' },
  { id: 'logic_output', label: 'Salida', icon: '🔵', category: 'logic' },
  { id: 'logic_and', label: 'AND', icon: '&', category: 'logic' },
  { id: 'logic_or', label: 'OR', icon: '≥1', category: 'logic' },
  { id: 'logic_not', label: 'NOT', icon: '1', category: 'logic' },
  { id: 'logic_nand', label: 'NAND', icon: '&̄', category: 'logic' },
  { id: 'logic_nor', label: 'NOR', icon: '≥̄1', category: 'logic' },
  { id: 'logic_xor', label: 'XOR', icon: '=1', category: 'logic' },
];

const categories = [
  { id: 'essentials', label: 'Esenciales' },
  { id: 'dc_sources', label: 'Fuentes DC' },
  { id: 'ac_sources', label: 'Fuentes AC' },
  { id: 'passive', label: 'Pasivos' },
  { id: 'diodes', label: 'Diodos' },
  { id: 'transistors', label: 'Transistores' },
  { id: 'opamp', label: 'Amplificadores' },
  { id: 'switches', label: 'Interruptores' },
  { id: 'transformers', label: 'Transformadores' },
  { id: 'probes', label: 'Instrumentos' },
  { id: 'lamps', label: 'Lámparas' },
  { id: 'logic', label: 'Lógica Digital' },
];

export default function Toolbar({ 
  activeTool, onToolSelect, onSimulate, onClear, onSave, onLoad, onNew,
  showValues, onToggleValues, showNodes, onToggleNodes, isSimulating 
}: Props) {
  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200 overflow-y-auto">
      {/* File operations */}
      <div className="p-2 border-b border-gray-200">
        <div className="text-[10px] font-bold text-gray-500 mb-1 px-1 uppercase tracking-wide">Archivo</div>
        <div className="grid grid-cols-3 gap-1">
          <button onClick={onNew} className="text-[11px] px-2 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100" title="Nuevo">📄 Nuevo</button>
          <button onClick={onSave} className="text-[11px] px-2 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100" title="Guardar">💾 Guardar</button>
          <button onClick={onLoad} className="text-[11px] px-2 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100" title="Abrir">📂 Abrir</button>
        </div>
      </div>

      {/* Simulation */}
      <div className="p-2 border-b border-gray-200">
        <div className="text-[10px] font-bold text-gray-500 mb-1 px-1 uppercase tracking-wide">Simulación DC</div>
        <div className="flex gap-1">
          <button onClick={onSimulate} disabled={isSimulating}
            className={`flex-1 text-[11px] px-2 py-1.5 rounded flex items-center justify-center gap-1 font-medium ${
              isSimulating ? 'bg-yellow-100 text-yellow-700' : 'bg-green-500 text-white hover:bg-green-600'
            }`}>
            {isSimulating ? '⏳...' : '▶ Simular DC'}
          </button>
          <button onClick={onClear} className="text-[11px] px-2 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded hover:bg-red-100" title="Limpiar">🗑️</button>
        </div>
        <button onClick={onToggleValues}
          className={`w-full mt-1 text-[11px] px-2 py-1.5 rounded border ${showValues ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300'}`}>
          {showValues ? '👁️ Valores ON' : '👁️ Valores OFF'}
        </button>
        <button onClick={onToggleNodes}
          className={`w-full mt-1 text-[11px] px-2 py-1.5 rounded border ${showNodes ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-300'}`}>
          {showNodes ? '🔴 Nodos ON (debug)' : '🔴 Nodos OFF (debug)'}
        </button>
      </div>

      {/* Components */}
      <div className="p-2 flex-1">
        <div className="text-[10px] font-bold text-gray-500 mb-1 px-1 uppercase tracking-wide">Componentes</div>
        {categories.map(cat => {
          const catTools = tools.filter(t => t.category === cat.id);
          if (catTools.length === 0) return null;
          return (
            <div key={cat.id} className="mb-2">
              <div className="text-[9px] text-gray-400 uppercase tracking-wider px-1 mb-1 font-semibold">{cat.label}</div>
              <div className="grid grid-cols-2 gap-0.5">
                {catTools.map(tool => (
                  <button key={tool.id} onClick={() => onToolSelect(tool.id)}
                    className={`text-[10px] px-1.5 py-1.5 rounded border transition-all flex flex-col items-center gap-0 ${
                      activeTool === tool.id 
                        ? 'bg-blue-500 text-white border-blue-600 shadow-sm' 
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`} title={tool.label}>
                    <span className="text-sm leading-none">{tool.icon}</span>
                    <span className="leading-tight text-center" style={{fontSize: '8px'}}>{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
