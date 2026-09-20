import { CircuitData, SimulationData, BranchCurrent, SimulationResult } from '../types';

const TOLERANCE = 5; // pixels tolerance for connection detection

function pointsMatch(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return Math.abs(a.x - b.x) < TOLERANCE && Math.abs(a.y - b.y) < TOLERANCE;
}

export function simulateCircuit(data: CircuitData): SimulationData {
  try {
    if (data.components.length === 0) {
      return { nodeVoltages: [], branchCurrents: [], totalPower: 0, success: false, error: 'No hay componentes en el circuito' };
    }

    // Collect all connection points
    interface ConnectionPoint {
      x: number;
      y: number;
      componentId?: string;
      terminalIndex?: number;
      wireId?: string;
      pointIndex?: number;
      isGround?: boolean;
    }

    const allPoints: ConnectionPoint[] = [];

    // Add component terminals
    data.components.forEach(comp => {
      comp.terminals.forEach((term, ti) => {
        allPoints.push({
          x: term.position.x,
          y: term.position.y,
          componentId: comp.id,
          terminalIndex: ti,
          isGround: comp.type === 'ground' && ti === 0,
        });
      });
    });

    // Add wire points
    data.wires.forEach(wire => {
      wire.points.forEach((pt, pi) => {
        allPoints.push({
          x: pt.x,
          y: pt.y,
          wireId: wire.id,
          pointIndex: pi,
        });
      });
    });

    // Union-Find to group connected points into nodes
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

    // Connect points that are at the same location
    for (let i = 0; i < allPoints.length; i++) {
      for (let j = i + 1; j < allPoints.length; j++) {
        if (pointsMatch(allPoints[i], allPoints[j])) {
          union(i, j);
        }
      }
    }

    // Also connect wire endpoints to each other (wire is a continuous conductor)
    data.wires.forEach(wire => {
      const wireIndices: number[] = [];
      allPoints.forEach((pt, idx) => {
        if (pt.wireId === wire.id) wireIndices.push(idx);
      });
      for (let i = 0; i < wireIndices.length - 1; i++) {
        union(wireIndices[i], wireIndices[i + 1]);
      }
    });

    // Build node map: root -> set of point indices
    const nodeGroups = new Map<number, Set<number>>();
    allPoints.forEach((_, idx) => {
      const root = find(idx);
      if (!nodeGroups.has(root)) nodeGroups.set(root, new Set());
      nodeGroups.get(root)!.add(idx);
    });

    // Assign node IDs
    const nodeIds: number[] = [];
    const pointToNode = new Map<number, number>();
    let groundNodeIdx = -1;
    let nodeCounter = 0;

    nodeGroups.forEach((pointIndices, root) => {
      const nodeId = nodeCounter++;
      nodeIds.push(nodeId);
      pointIndices.forEach(pi => pointToNode.set(pi, nodeId));
      
      // Check if this node contains a ground
      for (const pi of pointIndices) {
        if (allPoints[pi].isGround) {
          groundNodeIdx = nodeId;
          break;
        }
      }
    });

    if (nodeIds.length === 0) {
      return { nodeVoltages: [], branchCurrents: [], totalPower: 0, success: false, error: 'No hay nodos en el circuito' };
    }

    // If no ground found, use first node
    if (groundNodeIdx === -1) groundNodeIdx = 0;

    const n = nodeIds.length;

    // Count voltage sources for MNA
    const voltageSources = data.components.filter(c => c.type === 'voltage_source' || c.type === 'led');
    const m = voltageSources.length;
    const size = n + m;

    // Build MNA matrices: [G B; C D] [V; I] = [I; E]
    const G: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
    const rhs: number[] = Array(size).fill(0);

    // Map component to its MNA row (for voltage sources)
    const vsRowMap = new Map<string, number>();
    let vsCounter = 0;

    // Process each component
    data.components.forEach(comp => {
      if (comp.terminals.length < 1) return;

      // Get node indices for terminals
      const terminalNodes: number[] = [];
      comp.terminals.forEach((term, ti) => {
        const termPointIdx = allPoints.findIndex(p => 
          p.componentId === comp.id && p.terminalIndex === ti
        );
        if (termPointIdx >= 0 && pointToNode.has(termPointIdx)) {
          terminalNodes.push(pointToNode.get(termPointIdx)!);
        }
      });

      if (terminalNodes.length === 0) return;

      switch (comp.type) {
        case 'resistor':
        case 'lamp': {
          if (terminalNodes.length < 2) break;
          const n1 = terminalNodes[0];
          const n2 = terminalNodes[1];
          const g = 1 / Math.max(comp.value, 0.001); // conductance
          
          if (n1 !== groundNodeIdx && n2 !== groundNodeIdx) {
            G[n1][n1] += g;
            G[n2][n2] += g;
            G[n1][n2] -= g;
            G[n2][n1] -= g;
          } else if (n1 === groundNodeIdx) {
            G[n2][n2] += g;
          } else if (n2 === groundNodeIdx) {
            G[n1][n1] += g;
          }
          break;
        }
        case 'voltage_source':
        case 'led': {
          if (terminalNodes.length < 2) break;
          const n1 = terminalNodes[0]; // positive terminal
          const n2 = terminalNodes[1]; // negative terminal
          const row = n + vsCounter;
          vsRowMap.set(comp.id, row);
          
          // B matrix: +1 for n1, -1 for n2
          if (n1 !== groundNodeIdx) {
            G[n1][row] += 1;
            G[row][n1] += 1;
          }
          if (n2 !== groundNodeIdx) {
            G[n2][row] -= 1;
            G[row][n2] -= 1;
          }
          // RHS: voltage value
          rhs[row] = comp.value;
          vsCounter++;
          break;
        }
        case 'current_source': {
          if (terminalNodes.length < 2) break;
          const n1 = terminalNodes[0];
          const n2 = terminalNodes[1];
          // Current flows from + to -
          if (n1 !== groundNodeIdx) rhs[n1] -= comp.value;
          if (n2 !== groundNodeIdx) rhs[n2] += comp.value;
          break;
        }
        case 'switch': {
          if (terminalNodes.length < 2) break;
          if (comp.properties.closed) {
            const n1 = terminalNodes[0];
            const n2 = terminalNodes[1];
            const g = 10000; // Very high conductance
            if (n1 !== groundNodeIdx && n2 !== groundNodeIdx) {
              G[n1][n1] += g;
              G[n2][n2] += g;
              G[n1][n2] -= g;
              G[n2][n1] -= g;
            } else if (n1 === groundNodeIdx) {
              G[n2][n2] += g;
            } else if (n2 === groundNodeIdx) {
              G[n1][n1] += g;
            }
          }
          break;
        }
        case 'ammeter': {
          // Ammeter is essentially a short circuit (0 resistance)
          if (terminalNodes.length < 2) break;
          const n1 = terminalNodes[0];
          const n2 = terminalNodes[1];
          const row = n + vsCounter;
          vsRowMap.set(comp.id, row);
          if (n1 !== groundNodeIdx) {
            G[n1][row] += 1;
            G[row][n1] += 1;
          }
          if (n2 !== groundNodeIdx) {
            G[n2][row] -= 1;
            G[row][n2] -= 1;
          }
          rhs[row] = 0; // 0V drop
          vsCounter++;
          break;
        }
        case 'voltmeter': {
          // Voltmeter has infinite resistance - just measure, don't affect circuit
          break;
        }
        case 'ground': {
          // Ground is handled by setting node voltage to 0
          break;
        }
      }
    });

    // Solve the linear system
    const solution = solveLinearSystem(G, rhs, size);

    if (!solution) {
      return { nodeVoltages: [], branchCurrents: [], totalPower: 0, success: false, error: 'No se pudo resolver el circuito. Verifica que haya una ruta cerrada y un nodo de tierra.' };
    }

    // Extract node voltages
    const nodeVoltages: SimulationResult[] = nodeIds.map(id => ({
      nodeId: String(id),
      voltage: id === groundNodeIdx ? 0 : solution[id] || 0,
    }));

    // Calculate branch currents and voltages
    const branchCurrents: BranchCurrent[] = [];
    let totalPower = 0;

    data.components.forEach(comp => {
      if (comp.terminals.length < 2) {
        branchCurrents.push({ componentId: comp.id, current: 0, voltage: 0, power: 0 });
        return;
      }

      const terminalNodes: number[] = [];
      comp.terminals.forEach((term, ti) => {
        const termPointIdx = allPoints.findIndex(p => 
          p.componentId === comp.id && p.terminalIndex === ti
        );
        if (termPointIdx >= 0 && pointToNode.has(termPointIdx)) {
          terminalNodes.push(pointToNode.get(termPointIdx)!);
        }
      });

      if (terminalNodes.length < 2) {
        branchCurrents.push({ componentId: comp.id, current: 0, voltage: 0, power: 0 });
        return;
      }

      const n1 = terminalNodes[0];
      const n2 = terminalNodes[1];
      const v1 = n1 === groundNodeIdx ? 0 : (solution[n1] || 0);
      const v2 = n2 === groundNodeIdx ? 0 : (solution[n2] || 0);
      const vDiff = v1 - v2;

      let current = 0;
      let voltage = vDiff;

      switch (comp.type) {
        case 'resistor':
        case 'lamp':
          current = vDiff / Math.max(comp.value, 0.001);
          break;
        case 'voltage_source':
        case 'led':
        case 'ammeter': {
          const row = vsRowMap.get(comp.id);
          if (row !== undefined) {
            current = solution[row] || 0;
          }
          break;
        }
        case 'current_source':
          current = comp.value;
          break;
        case 'switch':
          if (comp.properties.closed) {
            current = vDiff * 10000;
          }
          break;
        case 'voltmeter':
          current = 0;
          break;
      }

      const power = Math.abs(vDiff * current);
      totalPower += power;

      branchCurrents.push({ componentId: comp.id, current, voltage, power });
    });

    return { nodeVoltages, branchCurrents, totalPower, success: true };
  } catch (e) {
    return { nodeVoltages: [], branchCurrents: [], totalPower: 0, success: false, error: `Error: ${(e as Error).message}` };
  }
}

function solveLinearSystem(A: number[][], b: number[], n: number): number[] | null {
  // Create augmented matrix
  const aug: number[][] = [];
  for (let i = 0; i < n; i++) {
    aug.push([...A[i], b[i]]);
  }

  // Forward elimination with partial pivoting
  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    let maxVal = Math.abs(aug[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > maxVal) {
        maxVal = Math.abs(aug[row][col]);
        maxRow = row;
      }
    }

    if (maxVal < 1e-10) {
      // Column is essentially zero - skip (singular system)
      continue;
    }

    // Swap rows
    if (maxRow !== col) {
      [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    }

    // Eliminate below
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[col][col]) < 1e-15) continue;
      const factor = aug[row][col] / aug[col][col];
      for (let j = col; j <= n; j++) {
        aug[row][j] -= factor * aug[col][j];
      }
    }
  }

  // Back substitution
  const x: number[] = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    if (Math.abs(aug[i][i]) < 1e-10) {
      x[i] = 0;
      continue;
    }
    let sum = aug[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= aug[i][j] * x[j];
    }
    x[i] = sum / aug[i][i];
  }

  return x;
}
