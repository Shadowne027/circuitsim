import { CircuitData, CircuitComponent } from '../types';

export interface DigitalSimulationResult {
  componentId: string;
  value: number; // 0 or 1
  label: string;
}

export interface DigitalSimulationData {
  results: DigitalSimulationResult[];
  success: boolean;
  error?: string;
  updatedComponents?: any[];
}

const TOLERANCE = 15;

function pointsMatch(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return Math.abs(a.x - b.x) < TOLERANCE && Math.abs(a.y - b.y) < TOLERANCE;
}

export function simulateDigitalCircuit(data: CircuitData): DigitalSimulationData {
  try {
    // Check if circuit has logic components
    const logicComponents = data.components.filter(c => 
      c.type.startsWith('logic_')
    );
    
    if (logicComponents.length === 0) {
      return { results: [], success: false, error: 'No hay componentes lógicos en el circuito' };
    }

    // Build connection map
    interface ConnectionPoint {
      x: number;
      y: number;
      componentId?: string;
      terminalIndex?: number;
      wireId?: string;
    }

    const allPoints: ConnectionPoint[] = [];

    // Add component terminals
    data.components.forEach(comp => {
      comp.terminals.forEach((term, idx) => {
        allPoints.push({
          x: term.position.x,
          y: term.position.y,
          componentId: comp.id,
          terminalIndex: idx
        });
      });
    });

    // Add wire points
    data.wires.forEach(wire => {
      wire.points.forEach(pt => {
        allPoints.push({ x: pt.x, y: pt.y, wireId: wire.id });
      });
    });

    // Union-Find to group connected points
    const parent = new Map<number, number>();
    
    function find(x: number): number {
      if (!parent.has(x)) parent.set(x, x);
      if (parent.get(x) !== x) parent.set(x, find(parent.get(x)!));
      return parent.get(x)!;
    }
    
    function union(a: number, b: number) {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent.set(ra, rb);
    }

    // Connect nearby points
    for (let i = 0; i < allPoints.length; i++) {
      for (let j = i + 1; j < allPoints.length; j++) {
        if (pointsMatch(allPoints[i], allPoints[j])) {
          union(i, j);
        }
      }
    }

    // Connect wire segments
    data.wires.forEach(wire => {
      const indices: number[] = [];
      allPoints.forEach((pt, idx) => {
        if (pt.wireId === wire.id) indices.push(idx);
      });
      for (let i = 0; i < indices.length - 1; i++) {
        union(indices[i], indices[i + 1]);
      }
    });

    // Build node groups
    const nodeGroups = new Map<number, Set<number>>();
    allPoints.forEach((_, idx) => {
      const root = find(idx);
      if (!nodeGroups.has(root)) nodeGroups.set(root, new Set());
      nodeGroups.get(root)!.add(idx);
    });

    // Map component terminals to nodes
    const componentNodes = new Map<string, Map<number, number>>();
    let nodeId = 0;
    const nodeToId = new Map<number, number>();
    
    nodeGroups.forEach((pointIndices, root) => {
      const currentNodeId = nodeId++;
      nodeToId.set(root, currentNodeId);
      
      pointIndices.forEach(pi => {
        const pt = allPoints[pi];
        if (pt.componentId !== undefined && pt.terminalIndex !== undefined) {
          if (!componentNodes.has(pt.componentId)) {
            componentNodes.set(pt.componentId, new Map());
          }
          componentNodes.get(pt.componentId)!.set(pt.terminalIndex, currentNodeId);
        }
      });
    });

    // Evaluate logic gates iteratively until stable
    const values = new Map<string, number>();
    
    // Set initial values for inputs
    logicComponents.forEach(comp => {
      if (comp.type === 'logic_input') {
        values.set(comp.id, comp.properties.value || 0);
      }
    });

    // Iterative evaluation (max 100 iterations to prevent infinite loops)
    let changed = true;
    let iterations = 0;
    const maxIterations = 100;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      logicComponents.forEach(comp => {
        if (comp.type === 'logic_input') return; // Already set

        const terminals = componentNodes.get(comp.id);
        if (!terminals) return;

        // Get input values based on gate type
        let output: number | null = null;

        switch (comp.type) {
          case 'logic_not': {
            const inputNode = terminals.get(0);
            if (inputNode === undefined) return;
            
            // Find component connected to this node
            const inputValue = findNodeValue(inputNode, componentNodes, values, data.components);
            if (inputValue !== null) {
              output = inputValue === 0 ? 1 : 0;
            }
            break;
          }

          case 'logic_and': {
            const input1Node = terminals.get(0);
            const input2Node = terminals.get(1);
            if (input1Node === undefined || input2Node === undefined) return;
            
            const input1 = findNodeValue(input1Node, componentNodes, values, data.components);
            const input2 = findNodeValue(input2Node, componentNodes, values, data.components);
            
            if (input1 !== null && input2 !== null) {
              output = (input1 === 1 && input2 === 1) ? 1 : 0;
            }
            break;
          }

          case 'logic_or': {
            const input1Node = terminals.get(0);
            const input2Node = terminals.get(1);
            if (input1Node === undefined || input2Node === undefined) return;
            
            const input1 = findNodeValue(input1Node, componentNodes, values, data.components);
            const input2 = findNodeValue(input2Node, componentNodes, values, data.components);
            
            if (input1 !== null && input2 !== null) {
              output = (input1 === 1 || input2 === 1) ? 1 : 0;
            }
            break;
          }

          case 'logic_nand': {
            const input1Node = terminals.get(0);
            const input2Node = terminals.get(1);
            if (input1Node === undefined || input2Node === undefined) return;
            
            const input1 = findNodeValue(input1Node, componentNodes, values, data.components);
            const input2 = findNodeValue(input2Node, componentNodes, values, data.components);
            
            if (input1 !== null && input2 !== null) {
              output = (input1 === 1 && input2 === 1) ? 0 : 1;
            }
            break;
          }

          case 'logic_nor': {
            const input1Node = terminals.get(0);
            const input2Node = terminals.get(1);
            if (input1Node === undefined || input2Node === undefined) return;
            
            const input1 = findNodeValue(input1Node, componentNodes, values, data.components);
            const input2 = findNodeValue(input2Node, componentNodes, values, data.components);
            
            if (input1 !== null && input2 !== null) {
              output = (input1 === 1 || input2 === 1) ? 0 : 1;
            }
            break;
          }

          case 'logic_xor': {
            const input1Node = terminals.get(0);
            const input2Node = terminals.get(1);
            if (input1Node === undefined || input2Node === undefined) return;
            
            const input1 = findNodeValue(input1Node, componentNodes, values, data.components);
            const input2 = findNodeValue(input2Node, componentNodes, values, data.components);
            
            if (input1 !== null && input2 !== null) {
              output = (input1 !== input2) ? 1 : 0;
            }
            break;
          }

          case 'logic_output': {
            const inputNode = terminals.get(0);
            if (inputNode === undefined) return;
            
            const inputValue = findNodeValue(inputNode, componentNodes, values, data.components);
            if (inputValue !== null) {
              output = inputValue;
            }
            break;
          }
        }

        // Update value if changed
        if (output !== null && values.get(comp.id) !== output) {
          values.set(comp.id, output);
          changed = true;
        }
      });
    }

    // Build results
    const results: DigitalSimulationResult[] = [];
    logicComponents.forEach(comp => {
      const value = values.get(comp.id);
      if (value !== undefined) {
        results.push({
          componentId: comp.id,
          value,
          label: comp.label
        });
      }
    });

    // Update output components with simulation values
    const updatedComponents = data.components.map(comp => {
      if (comp.type === 'logic_output') {
        const value = values.get(comp.id);
        if (value !== undefined) {
          return { ...comp, _simValue: value };
        }
      }
      return comp;
    });

    return {
      results,
      success: true,
      updatedComponents
    };
  } catch (e) {
    return {
      results: [],
      success: false,
      error: `Error en simulación digital: ${(e as Error).message}`
    };
  }
}

function findNodeValue(
  nodeId: number,
  componentNodes: Map<string, Map<number, number>>,
  values: Map<string, number>,
  components: CircuitComponent[]
): number | null {
  // Find all components connected to this node
  for (const [compId, terminals] of componentNodes.entries()) {
    for (const [termIdx, node] of terminals.entries()) {
      if (node === nodeId) {
        // This component has a terminal connected to this node
        const comp = components.find(c => c.id === compId);
        if (!comp) continue;

        // If this is an output terminal, return its value
        if (isOutputTerminal(comp.type, termIdx)) {
          const value = values.get(compId);
          if (value !== undefined) return value;
        }
      }
    }
  }
  return null;
}

function isOutputTerminal(type: string, terminalIndex: number): boolean {
  switch (type) {
    case 'logic_input':
      return terminalIndex === 0; // Output terminal
    case 'logic_not':
      return terminalIndex === 1; // Output terminal
    case 'logic_and':
    case 'logic_or':
    case 'logic_nand':
    case 'logic_nor':
    case 'logic_xor':
      return terminalIndex === 2; // Output terminal
    case 'logic_output':
      return terminalIndex === 0; // Input terminal (but we read from it)
    default:
      return false;
  }
}
