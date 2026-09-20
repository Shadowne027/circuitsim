import { CircuitData, SimulationData, BranchCurrent, SimulationResult, CircuitComponent } from '../types';

const TOLERANCE = 15; // Aumentado de 5 a 15 para mejor detección de conexiones

function pointsMatch(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return dx < TOLERANCE && dy < TOLERANCE;
}

export function simulateCircuit(data: CircuitData): SimulationData {
  try {
    if (data.components.length === 0) {
      return { nodeVoltages: [], branchCurrents: [], totalPower: 0, success: false, error: 'No hay componentes' };
    }

    // Collect all connection points
    interface ConnPoint { x: number; y: number; compId?: string; termIdx?: number; wireId?: string; isGround?: boolean; }
    const allPoints: ConnPoint[] = [];

    data.components.forEach((comp: CircuitComponent) => {
      comp.terminals.forEach((term, ti: number) => {
        allPoints.push({
          x: term.position.x, y: term.position.y,
          compId: comp.id, termIdx: ti,
          isGround: comp.type === 'ground' && ti === 0,
        });
      });
    });

    data.wires.forEach((wire) => {
      wire.points.forEach((pt) => {
        allPoints.push({ x: pt.x, y: pt.y, wireId: wire.id });
      });
    });

    // Union-Find
    const parent = new Map<number, number>();
    function find(x: number): number {
      if (!parent.has(x)) parent.set(x, x);
      if (parent.get(x) !== x) parent.set(x, find(parent.get(x)!));
      return parent.get(x)!;
    }
    function union(a: number, b: number) {
      const ra = find(a); const rb = find(b);
      if (ra !== rb) parent.set(ra, rb);
    }

    // Connect nearby points
    for (let i = 0; i < allPoints.length; i++) {
      for (let j = i + 1; j < allPoints.length; j++) {
        if (pointsMatch(allPoints[i], allPoints[j])) union(i, j);
      }
    }

    // Connect wire segments
    data.wires.forEach((wire) => {
      const indices: number[] = [];
      allPoints.forEach((pt, idx) => { if (pt.wireId === wire.id) indices.push(idx); });
      for (let i = 0; i < indices.length - 1; i++) union(indices[i], indices[i + 1]);
    });

    // Build node groups
    const nodeGroups = new Map<number, Set<number>>();
    allPoints.forEach((_, idx) => {
      const root = find(idx);
      if (!nodeGroups.has(root)) nodeGroups.set(root, new Set());
      nodeGroups.get(root)!.add(idx);
    });

    // Assign node IDs
    const pointToNode = new Map<number, number>();
    let groundNodeIdx = -1;
    let nodeCounter = 0;

    nodeGroups.forEach((pointIndices) => {
      const nodeId = nodeCounter++;
      pointIndices.forEach(pi => pointToNode.set(pi, nodeId));
      for (const pi of pointIndices) {
        if (allPoints[pi].isGround) { groundNodeIdx = nodeId; break; }
      }
    });

    if (nodeCounter === 0) {
      return { nodeVoltages: [], branchCurrents: [], totalPower: 0, success: false, error: 'No hay nodos' };
    }
    if (groundNodeIdx === -1) groundNodeIdx = 0;
    const n = nodeCounter;

    // Count voltage sources for MNA
    const vsComponents = data.components.filter((c: CircuitComponent) => 
      ['voltage_source', 'battery', 'led', 'diode', 'zener_diode', 'schottky_diode', 'photodiode', 'ac_voltage', 'ammeter'].includes(c.type)
    );
    const m = vsComponents.length;
    const size = n + m;

    const G: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
    const rhs: number[] = Array(size).fill(0);
    const vsRowMap = new Map<string, number>();
    let vsCounter = 0;

    // Helper to get node indices for a component's terminals
    function getNodes(comp: CircuitComponent): number[] {
      const nodes: number[] = [];
      comp.terminals.forEach((term, ti: number) => {
        const idx = allPoints.findIndex(p => p.compId === comp.id && p.termIdx === ti);
        if (idx >= 0 && pointToNode.has(idx)) nodes.push(pointToNode.get(idx)!);
      });
      return nodes;
    }

    // Add conductance between two nodes
    function addConductance(n1: number, n2: number, g: number) {
      if (n1 !== groundNodeIdx && n2 !== groundNodeIdx) {
        G[n1][n1] += g; G[n2][n2] += g;
        G[n1][n2] -= g; G[n2][n1] -= g;
      } else if (n1 === groundNodeIdx) {
        G[n2][n2] += g;
      } else if (n2 === groundNodeIdx) {
        G[n1][n1] += g;
      }
    }

    // Process components
    data.components.forEach((comp: CircuitComponent) => {
      const nodes = getNodes(comp);
      if (nodes.length === 0) return;

      switch (comp.type) {
        case 'resistor':
        case 'potentiometer':
        case 'lamp': {
          if (nodes.length < 2) break;
          const g = 1 / Math.max(comp.value, 0.001);
          addConductance(nodes[0], nodes[1], g);
          break;
        }
        case 'capacitor': {
          // In DC: open circuit (infinite resistance) - no current flows
          // We don't add anything to the matrix
          break;
        }
        case 'inductor': {
          // In DC: short circuit (zero resistance)
          if (nodes.length < 2) break;
          addConductance(nodes[0], nodes[1], 1e6);
          break;
        }
        case 'voltage_source':
        case 'battery':
        case 'ac_voltage': {
          if (nodes.length < 2) break;
          const row = n + vsCounter;
          vsRowMap.set(comp.id, row);
          if (nodes[0] !== groundNodeIdx) { G[nodes[0]][row] += 1; G[row][nodes[0]] += 1; }
          if (nodes[1] !== groundNodeIdx) { G[nodes[1]][row] -= 1; G[row][nodes[1]] -= 1; }
          rhs[row] = comp.value;
          vsCounter++;
          break;
        }
        case 'current_source':
        case 'ac_current': {
          if (nodes.length < 2) break;
          // Current flows from terminal 0 to terminal 1
          if (nodes[0] !== groundNodeIdx) rhs[nodes[0]] -= comp.value;
          if (nodes[1] !== groundNodeIdx) rhs[nodes[1]] += comp.value;
          break;
        }
        case 'diode':
        case 'schottky_diode':
        case 'photodiode': {
          // Simplified DC model: voltage drop = comp.value when forward biased
          if (nodes.length < 2) break;
          const row = n + vsCounter;
          vsRowMap.set(comp.id, row);
          if (nodes[0] !== groundNodeIdx) { G[nodes[0]][row] += 1; G[row][nodes[0]] += 1; }
          if (nodes[1] !== groundNodeIdx) { G[nodes[1]][row] -= 1; G[row][nodes[1]] -= 1; }
          rhs[row] = comp.value; // Forward voltage drop
          vsCounter++;
          break;
        }
        case 'zener_diode': {
          // Zener: behaves like regular diode in forward, voltage regulator in reverse
          if (nodes.length < 2) break;
          const row = n + vsCounter;
          vsRowMap.set(comp.id, row);
          if (nodes[0] !== groundNodeIdx) { G[nodes[0]][row] += 1; G[row][nodes[0]] += 1; }
          if (nodes[1] !== groundNodeIdx) { G[nodes[1]][row] -= 1; G[row][nodes[1]] -= 1; }
          rhs[row] = comp.value; // Zener voltage
          vsCounter++;
          break;
        }
        case 'led': {
          if (nodes.length < 2) break;
          const row = n + vsCounter;
          vsRowMap.set(comp.id, row);
          if (nodes[0] !== groundNodeIdx) { G[nodes[0]][row] += 1; G[row][nodes[0]] += 1; }
          if (nodes[1] !== groundNodeIdx) { G[nodes[1]][row] -= 1; G[row][nodes[1]] -= 1; }
          rhs[row] = comp.value; // LED forward voltage
          vsCounter++;
          break;
        }
        case 'switch_spst':
        case 'push_button': {
          if (nodes.length < 2) break;
          if (comp.properties.closed) {
            addConductance(nodes[0], nodes[1], 1e4);
          }
          break;
        }
        case 'switch_spdt': {
          // SPDT: common (terminal 0) connects to terminal 1 or 2 based on position
          if (nodes.length < 3) break;
          const target = comp.properties.position === 0 ? nodes[1] : nodes[2];
          addConductance(nodes[0], target, 1e4);
          break;
        }
        case 'opamp': {
          // Ideal op-amp: V+ = V- (virtual short), infinite gain
          // Terminals: 0=non-inv(+), 1=inv(-), 2=output
          if (nodes.length < 3) break;
          const vPlus = nodes[0]; // non-inverting input
          const vMinus = nodes[1]; // inverting input
          const vOut = nodes[2]; // output
          // Model: Vout = A * (V+ - V-), with A very large
          // Use MNA: add constraint Vout = A*(V+ - V-)
          const row = n + vsCounter;
          vsRowMap.set(comp.id, row);
          const A = comp.value; // open-loop gain (default 100000)
          if (vPlus !== groundNodeIdx) G[row][vPlus] += A;
          if (vMinus !== groundNodeIdx) G[row][vMinus] -= A;
          if (vOut !== groundNodeIdx) { G[vOut][row] -= 1; G[row][vOut] += 1; }
          rhs[row] = 0;
          vsCounter++;
          break;
        }
        case 'transformer': {
          // Ideal transformer: V2 = N*V1, I1 = N*I2
          // 4 terminals: 0=primary+, 1=primary-, 2=secondary+, 3=secondary-
          if (nodes.length < 4) break;
          const N = comp.value; // turns ratio
          // V_secondary = N * V_primary
          const vp = nodes[0]; const vn = nodes[1];
          const vs_p = nodes[2]; const vs_n = nodes[3];
          // Add coupled equations
          const row1 = n + vsCounter;
          vsRowMap.set(comp.id + '_v', row1);
          if (vp !== groundNodeIdx) G[row1][vp] += 1;
          if (vn !== groundNodeIdx) G[row1][vn] -= 1;
          if (vs_p !== groundNodeIdx) G[vs_p][row1] -= N;
          if (vs_n !== groundNodeIdx) G[vs_n][row1] += N;
          rhs[row1] = 0;
          vsCounter++;
          break;
        }
        case 'ammeter': {
          // Ammeter = short circuit, measure current
          if (nodes.length < 2) break;
          const row = n + vsCounter;
          vsRowMap.set(comp.id, row);
          if (nodes[0] !== groundNodeIdx) { G[nodes[0]][row] += 1; G[row][nodes[0]] += 1; }
          if (nodes[1] !== groundNodeIdx) { G[nodes[1]][row] -= 1; G[row][nodes[1]] -= 1; }
          rhs[row] = 0;
          vsCounter++;
          break;
        }
        case 'voltmeter': {
          // Voltmeter: infinite resistance, just measures - don't affect circuit
          break;
        }
        case 'ground':
        case 'voltage_label':
        case 'wire':
          break;
      }
    });

    // Solve
    const solution = solveLinearSystem(G, rhs, size);
    if (!solution) {
      return { nodeVoltages: [], branchCurrents: [], totalPower: 0, success: false, 
        error: 'Circuito no resoluble. Verifica: 1) Hay tierra (GND), 2) Hay fuente de voltaje, 3) Circuito cerrado.' };
    }

    // Build results
    const nodeVoltages: SimulationResult[] = [];
    for (let i = 0; i < n; i++) {
      nodeVoltages.push({ nodeId: String(i), voltage: i === groundNodeIdx ? 0 : solution[i] || 0 });
    }

    const branchCurrents: BranchCurrent[] = [];
    let totalPower = 0;

    data.components.forEach((comp: CircuitComponent) => {
      const nodes = getNodes(comp);
      if (nodes.length < 2) {
        branchCurrents.push({ componentId: comp.id, current: 0, voltage: 0, power: 0 });
        return;
      }

      const v1 = nodes[0] === groundNodeIdx ? 0 : (solution[nodes[0]] || 0);
      const v2 = nodes[1] === groundNodeIdx ? 0 : (solution[nodes[1]] || 0);
      const vDiff = v1 - v2;
      let current = 0;

      switch (comp.type) {
        case 'resistor':
        case 'potentiometer':
        case 'lamp':
          current = vDiff / Math.max(comp.value, 0.001);
          break;
        case 'inductor':
          current = vDiff * 1e6;
          break;
        case 'voltage_source':
        case 'battery':
        case 'ac_voltage':
        case 'diode':
        case 'zener_diode':
        case 'schottky_diode':
        case 'led':
        case 'photodiode':
        case 'ammeter': {
          const row = vsRowMap.get(comp.id);
          if (row !== undefined) current = solution[row] || 0;
          break;
        }
        case 'current_source':
        case 'ac_current':
          current = comp.value;
          break;
        case 'switch_spst':
        case 'push_button':
          if (comp.properties.closed) current = vDiff * 1e4;
          break;
        case 'switch_spdt': {
          if (nodes.length >= 3) {
            const target = comp.properties.position === 0 ? nodes[1] : nodes[2];
            const vTarget = target === groundNodeIdx ? 0 : (solution[target] || 0);
            current = (v1 - vTarget) * 1e4;
          }
          break;
        }
        case 'capacitor':
          current = 0; // DC open circuit
          break;
        case 'voltmeter':
          current = 0;
          break;
        default:
          current = 0;
      }

      const power = Math.abs(vDiff * current);
      totalPower += power;
      branchCurrents.push({ componentId: comp.id, current, voltage: vDiff, power });
    });

    return { nodeVoltages, branchCurrents, totalPower, success: true };
  } catch (e) {
    return { nodeVoltages: [], branchCurrents: [], totalPower: 0, success: false, error: `Error: ${(e as Error).message}` };
  }
}

function solveLinearSystem(A: number[][], b: number[], n: number): number[] | null {
  const aug: number[][] = [];
  for (let i = 0; i < n; i++) aug.push([...A[i], b[i]]);

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    let maxVal = Math.abs(aug[col][col]);
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > maxVal) { maxVal = Math.abs(aug[row][col]); maxRow = row; }
    }
    if (maxVal < 1e-10) continue;
    if (maxRow !== col) [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[col][col]) < 1e-15) continue;
      const factor = aug[row][col] / aug[col][col];
      for (let j = col; j <= n; j++) aug[row][j] -= factor * aug[col][j];
    }
  }

  const x: number[] = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    if (Math.abs(aug[i][i]) < 1e-10) { x[i] = 0; continue; }
    let sum = aug[i][n];
    for (let j = i + 1; j < n; j++) sum -= aug[i][j] * x[j];
    x[i] = sum / aug[i][i];
  }
  return x;
}
