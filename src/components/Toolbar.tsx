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
  onExportImage: () => void;
  showValues: boolean;
  onToggleValues: () => void;
  isSimulating: boolean;
}

const tools: { id: Tool; label: string; icon: string; category: string }[] = [
  { id: 'select', label: 'Seleccionar', icon: '⊹', category: 'tools' },
  { id: 'wire', label: 'Cable', icon: '╱', category: 'tools' },
  { id: 'voltage_source', label: 'Fuente V', icon: '⊕', category: 'sources' },
  { id: 'current_source', label: 'Fuente I', icon: '⊙', category: 'sources' },
  { id: 'resistor', label: 'Resistencia', icon: '⏦', category: 'passive' },
  { id: 'capacitor', label: 'Capacitor', icon: '⊣⊢', category: 'passive' },
  { id: 'inductor', label: 'Inductor', icon: '⌇', category: 'passive' },
  { id: 'led', label: 'LED', icon: '◁▷', category: 'passive' },
  { id: 'lamp', label: 'Lámpara', icon: '⊛', category: 'passive' },
  { id: 'switch', label: 'Interruptor', icon: '⎓', category: 'switches' },
  { id: 'ground', label: 'Tierra', icon: '⏚', category: 'passive' },
  { id: 'ammeter', label: 'Amperímetro', icon: 'Ⓐ', category: 'measure' },
  { id: 'voltmeter', label: 'Voltímetro', icon: 'Ⓥ', category: 'measure' },
];

export default function Toolbar({ 
  activeTool, onToolSelect, onSimulate, onClear, onSave, onLoad, onNew, onExportImage,
  showValues, onToggleValues, isSimulating 
}: Props) {
  const categories = [
    { id: 'tools', label: 'Herramientas' },
    { id: 'sources', label: 'Fuentes' },
    { id: 'passive', label: 'Pasivos' },
    { id: 'switches', label: 'Interruptores' },
    { id: 'measure', label: 'Medición' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200 overflow-y-auto">
      {/* File operations */}
      <div className="p-2 border-b border-gray-200">
        <div className="text-xs font-semibold text-gray-500 mb-1 px-1">ARCHIVO</div>
        <div className="grid grid-cols-2 gap-1">
          <button onClick={onNew} className="text-xs px-2 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-1" title="Nuevo circuito">
            📄 Nuevo
          </button>
          <button onClick={onSave} className="text-xs px-2 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-1" title="Guardar archivo">
            💾 Guardar
          </button>
          <button onClick={onLoad} className="text-xs px-2 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-1" title="Abrir archivo">
            📂 Abrir
          </button>
          <button onClick={onExportImage} className="text-xs px-2 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-100 flex items-center gap-1" title="Exportar imagen">
            🖼️ Imagen
          </button>
        </div>
      </div>

      {/* Simulation */}
      <div className="p-2 border-b border-gray-200">
        <div className="text-xs font-semibold text-gray-500 mb-1 px-1">SIMULACIÓN</div>
        <div className="flex gap-1">
          <button 
            onClick={onSimulate} 
            disabled={isSimulating}
            className={`flex-1 text-xs px-2 py-1.5 rounded flex items-center justify-center gap-1 ${
              isSimulating ? 'bg-yellow-100 text-yellow-700' : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isSimulating ? '⏳...' : '▶ Simular'}
          </button>
          <button onClick={onClear} className="text-xs px-2 py-1.5 bg-red-50 border border-red-200 text-red-600 rounded hover:bg-red-100" title="Limpiar">
            🗑️
          </button>
        </div>
        <button 
          onClick={onToggleValues} 
          className={`w-full mt-1 text-xs px-2 py-1.5 rounded border ${showValues ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-300'}`}
        >
          {showValues ? '👁️ Ocultar valores' : '👁️ Mostrar valores'}
        </button>
      </div>

      {/* Components */}
      <div className="p-2 flex-1">
        <div className="text-xs font-semibold text-gray-500 mb-1 px-1">COMPONENTES</div>
        {categories.map(cat => {
          const catTools = tools.filter(t => t.category === cat.id);
          if (catTools.length === 0) return null;
          return (
            <div key={cat.id} className="mb-2">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide px-1 mb-1">{cat.label}</div>
              <div className="grid grid-cols-2 gap-1">
                {catTools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => onToolSelect(tool.id)}
                    className={`text-xs px-2 py-2 rounded border transition-all flex flex-col items-center gap-0.5 ${
                      activeTool === tool.id 
                        ? 'bg-blue-500 text-white border-blue-600 shadow-sm' 
                        : 'bg-white border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    title={tool.label}
                  >
                    <span className="text-base leading-none">{tool.icon}</span>
                    <span className="text-[9px] leading-tight">{tool.label}</span>
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
