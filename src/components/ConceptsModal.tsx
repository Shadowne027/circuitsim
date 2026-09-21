import React from 'react';

interface Props {
  onClose: () => void;
}

export default function ConceptsModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
          <h1 className="text-2xl font-bold">📚 Conceptos Básicos de Circuitos</h1>
          <p className="text-green-100 text-sm mt-1">Fundamentos de electricidad y circuitos eléctricos</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Ley de Ohm */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">⚡ Ley de Ohm</h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-3">
              <p className="text-2xl font-mono text-center text-blue-700 mb-2">V = I × R</p>
              <p className="text-sm text-gray-600 text-center">Voltaje = Corriente × Resistencia</p>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><strong>V (Voltaje):</strong> Diferencia de potencial eléctrico, medido en Voltios (V)</li>
              <li><strong>I (Corriente):</strong> Flujo de electrones, medido en Amperios (A)</li>
              <li><strong>R (Resistencia):</strong> Oposición al flujo de corriente, medido en Ohmios (Ω)</li>
            </ul>
            <div className="mt-3 text-xs text-gray-600 bg-yellow-50 p-3 rounded">
              <strong>Ejemplo:</strong> Si tienes una batería de 12V y una resistencia de 1kΩ (1000Ω), 
              la corriente será I = V/R = 12/1000 = 0.012A = 12mA
            </div>
          </div>

          {/* Ley de Potencia */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">💡 Ley de Potencia</h2>
            <div className="bg-orange-50 p-4 rounded-lg mb-3">
              <p className="text-2xl font-mono text-center text-orange-700 mb-2">P = V × I</p>
              <p className="text-sm text-gray-600 text-center">Potencia = Voltaje × Corriente</p>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li><strong>P (Potencia):</strong> Energía consumida por unidad de tiempo, medida en Vatios (W)</li>
              <li>También: P = I² × R o P = V² / R</li>
            </ul>
            <div className="mt-3 text-xs text-gray-600 bg-yellow-50 p-3 rounded">
              <strong>Ejemplo:</strong> Una resistencia de 100Ω con 0.1A de corriente consume: 
              P = I² × R = 0.01 × 100 = 1W
            </div>
          </div>

          {/* Circuitos en Serie */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">🔗 Circuitos en Serie</h2>
            <div className="bg-purple-50 p-4 rounded-lg mb-3">
              <p className="text-sm text-gray-700">
                Los componentes se conectan uno después del otro, formando un solo camino para la corriente.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-purple-700 mb-1">Características:</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• La corriente es la misma en todos los componentes</li>
                  <li>• El voltaje total se divide entre los componentes</li>
                  <li>• Si un componente falla, todo el circuito se abre</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-purple-700 mb-1">Fórmulas:</h3>
                <div className="bg-white p-2 rounded border">
                  <p className="font-mono text-xs">R_total = R₁ + R₂ + R₃ + ...</p>
                  <p className="font-mono text-xs">V_total = V₁ + V₂ + V₃ + ...</p>
                  <p className="font-mono text-xs">I_total = I₁ = I₂ = I₃ = ...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Circuitos en Paralelo */}
          <div className="border-l-4 border-green-500 pl-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">🔀 Circuitos en Paralelo</h2>
            <div className="bg-green-50 p-4 rounded-lg mb-3">
              <p className="text-sm text-gray-700">
                Los componentes se conectan en múltiples caminos, compartiendo los mismos puntos de conexión.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-green-700 mb-1">Características:</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• El voltaje es el mismo en todos los componentes</li>
                  <li>• La corriente total se divide entre las ramas</li>
                  <li>• Si un componente falla, los demás siguen funcionando</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-green-700 mb-1">Fórmulas:</h3>
                <div className="bg-white p-2 rounded border">
                  <p className="font-mono text-xs">1/R_total = 1/R₁ + 1/R₂ + ...</p>
                  <p className="font-mono text-xs">V_total = V₁ = V₂ = ...</p>
                  <p className="font-mono text-xs">I_total = I₁ + I₂ + ...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Leyes de Kirchhoff */}
          <div className="border-l-4 border-red-500 pl-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">📐 Leyes de Kirchhoff</h2>
            <div className="space-y-3">
              <div className="bg-red-50 p-3 rounded">
                <h3 className="font-semibold text-red-700 mb-1">Ley de Corrientes (KCL)</h3>
                <p className="text-sm text-gray-700">
                  La suma de corrientes que entran a un nodo es igual a la suma de corrientes que salen.
                </p>
                <p className="font-mono text-xs mt-1">ΣI_entrada = ΣI_salida</p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <h3 className="font-semibold text-red-700 mb-1">Ley de Voltajes (KVL)</h3>
                <p className="text-sm text-gray-700">
                  La suma algebraica de voltajes en una malla cerrada es igual a cero.
                </p>
                <p className="font-mono text-xs mt-1">ΣV = 0 (en cualquier malla cerrada)</p>
              </div>
            </div>
          </div>

          {/* Componentes Básicos */}
          <div className="border-l-4 border-indigo-500 pl-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">🔧 Componentes Básicos</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-indigo-700">Resistencia (R)</h3>
                <p className="text-xs text-gray-600">Limita el flujo de corriente. Unidad: Ohmios (Ω)</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-indigo-700">Capacitor (C)</h3>
                <p className="text-xs text-gray-600">Almacena carga eléctrica. Unidad: Faradios (F)</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-indigo-700">Inductor (L)</h3>
                <p className="text-xs text-gray-600">Almacena energía en campo magnético. Unidad: Henrios (H)</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-indigo-700">Diodo</h3>
                <p className="text-xs text-gray-600">Permite corriente en una sola dirección. Caída: ~0.7V</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-indigo-700">LED</h3>
                <p className="text-xs text-gray-600">Diodo que emite luz. Caída: 1.8-3.3V según color</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-indigo-700">Transistor</h3>
                <p className="text-xs text-gray-600">Amplifica o conmuta señales electrónicas</p>
              </div>
            </div>
          </div>

          {/* Consejos Prácticos */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">💡 Consejos Prácticos</h2>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                <strong>Siempre usa una resistencia limitadora con LEDs:</strong> 
                R = (V_fuente - V_LED) / I_LED
              </li>
              <li>
                <strong>Tierra (GND) es tu referencia:</strong> 
                Todos los voltajes se miden respecto a tierra (0V)
              </li>
              <li>
                <strong>La corriente sigue todos los caminos:</strong> 
                En paralelo, la corriente se divide según la resistencia de cada rama
              </li>
              <li>
                <strong>Verifica la polaridad:</strong> 
                LEDs, diodos y capacitores electrolíticos tienen polaridad (+/-)
              </li>
              <li>
                <strong>Usa el simulador para experimentar:</strong> 
                Cambia valores y observa cómo afectan al circuito en tiempo real
              </li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Entendido ✓
          </button>
        </div>
      </div>
    </div>
  );
}
