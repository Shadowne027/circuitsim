import React from 'react';
import { CircuitData } from '../types';

interface Props {
  onClose: () => void;
  onLoadExample: (data: CircuitData) => void;
  onLoadFile: () => void;
}

export default function WelcomeModal({ onClose, onLoadExample, onLoadFile }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center gap-3">
            <span className="text-4xl">⚡</span>
            <div>
              <h1 className="text-2xl font-bold">CircuitSim</h1>
              <p className="text-blue-100 text-sm">Editor y Simulador de Circuitos Eléctricos</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Quick start */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">🚀 Inicio Rápido</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded-lg">
                <span className="font-semibold">🖱️ Click</span> - Colocar componente
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <span className="font-semibold">🔌 W</span> - Modo cable
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <span className="font-semibold">↻ R</span> - Rotar componente
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <span className="font-semibold">🗑️ Del</span> - Eliminar
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <span className="font-semibold">↩ Ctrl+Z</span> - Deshacer
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <span className="font-semibold">💾 Ctrl+S</span> - Guardar
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <span className="font-semibold">🔍 Ctrl+Scroll</span> - Zoom
              </div>
              <div className="bg-gray-50 p-2 rounded-lg">
                <span className="font-semibold">✋ Alt+Click</span> - Mover canvas
              </div>
            </div>
          </div>

          {/* How to use */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">📋 Cómo usar</h2>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Selecciona un componente de la barra izquierda</li>
              <li>Haz click en el canvas para colocarlo</li>
              <li>Usa <kbd className="bg-gray-100 px-1 rounded text-xs">W</kbd> para dibujar cables entre terminales</li>
              <li>Click en un componente para editarlo (valor, rotación)</li>
              <li>Presiona <span className="font-semibold text-green-600">▶ Simular</span> para analizar el circuito</li>
              <li>Guarda como archivo <code className="bg-gray-100 px-1 rounded text-xs">.circuit</code> para compartir</li>
            </ol>
          </div>

          {/* File format */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <h3 className="text-sm font-bold text-amber-800 mb-1">💾 Formato de archivo</h3>
            <p className="text-xs text-amber-700">
              Los circuitos se guardan como archivos <code className="bg-amber-100 px-1 rounded">.circuit</code> (JSON). 
              Puedes guardar tu trabajo, enviarlo por email/chat, y quien lo reciba puede abrirlo directamente en esta página 
              sin necesidad de cuenta.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-2 justify-end">
          <button
            onClick={onLoadFile}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            📂 Abrir archivo
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Empezar desde cero →
          </button>
        </div>
      </div>
    </div>
  );
}
