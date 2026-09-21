import { CircuitData } from '../types';

export const FILE_EXTENSION = '.circuit';
export const FILE_MIME = 'application/json';

export function serializeCircuit(data: CircuitData): string {
  return JSON.stringify(data, null, 2);
}

export function deserializeCircuit(json: string): CircuitData {
  const data = JSON.parse(json) as CircuitData;
  // Validate
  if (!data.version || !data.components || !data.wires) {
    throw new Error('Archivo de circuito inválido');
  }
  return data;
}

export function downloadCircuit(data: CircuitData): void {
  const json = serializeCircuit(data);
  const blob = new Blob([json], { type: FILE_MIME });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.name || 'circuito'}${FILE_EXTENSION}`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export function uploadCircuit(): Promise<CircuitData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = `${FILE_EXTENSION},.json`;
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        document.body.removeChild(input);
        reject(new Error('No se seleccionó archivo'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = deserializeCircuit(ev.target?.result as string);
          document.body.removeChild(input);
          resolve(data);
        } catch (err) {
          document.body.removeChild(input);
          reject(err);
        }
      };
      reader.onerror = () => {
        document.body.removeChild(input);
        reject(new Error('Error al leer archivo'));
      };
      reader.readAsText(file);
    };
    
    document.body.appendChild(input);
    input.click();
  });
}

export function createEmptyCircuit(name: string = 'Nuevo Circuito'): CircuitData {
  return {
    version: '1.0.0',
    name,
    description: '',
    author: '',
    date: new Date().toISOString(),
    components: [],
    wires: [],
    nodes: [],
    gridSize: 20,
    canvasWidth: 2000,
    canvasHeight: 1500,
  };
}

export function formatValue(value: number, unit: string): string {
  if (value === 0) return `0 ${unit}`;
  const abs = Math.abs(value);
  if (abs >= 1e6) return `${(value / 1e6).toFixed(2)} M${unit}`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(2)} k${unit}`;
  if (abs >= 1) return `${value.toFixed(2)} ${unit}`;
  if (abs >= 1e-3) return `${(value * 1e3).toFixed(2)} m${unit}`;
  if (abs >= 1e-6) return `${(value * 1e6).toFixed(2)} µ${unit}`;
  return `${value.toExponential(2)} ${unit}`;
}
