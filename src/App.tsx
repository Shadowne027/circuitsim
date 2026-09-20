import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CircuitComponent, Wire, Point, Tool, CircuitData, SimulationData, COMPONENT_DEFAULTS, GRID_SIZE } from './types';
import CircuitCanvas from './components/CircuitCanvas';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import { simulateCircuit } from './utils/circuitSolver';
import { downloadCircuit, uploadCircuit, createEmptyCircuit } from './utils/fileHandler';
import WelcomeModal from './components/WelcomeModal';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function getTerminals(type: string, position: Point, rotation: number): { id: string; position: Point }[] {
  let t1: Point, t2: Point;
  
  switch (type) {
    case 'ground':
      t1 = { x: position.x, y: position.y - 20 };
      return [{ id: 't1', position: t1 }];
    default:
      // Default: horizontal component with terminals at ±30
      const rad = (rotation * Math.PI) / 180;
      t1 = {
        x: position.x + Math.round(-30 * Math.cos(rad)),
        y: position.y + Math.round(-30 * Math.sin(rad)),
      };
      t2 = {
        x: position.x + Math.round(30 * Math.cos(rad)),
        y: position.y + Math.round(30 * Math.sin(rad)),
      };
      return [
        { id: 't1', position: t1 },
        { id: 't2', position: t2 },
      ];
  }
}

export default function App() {
  const [circuitData, setCircuitData] = useState<CircuitData>(createEmptyCircuit());
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showValues, setShowValues] = useState(true);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const [simulationResults, setSimulationResults] = useState<Map<string, { current: number; voltage: number }>>(new Map());
  const [isSimulating, setIsSimulating] = useState(false);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentWirePoints, setCurrentWirePoints] = useState<Point[]>([]);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);
  const [dragComponentOffset, setDragComponentOffset] = useState<Point>({ x: 0, y: 0 });
  const [history, setHistory] = useState<CircuitData[]>([]);
  const [circuitName, setCircuitName] = useState('Mi Circuito');
  const [statusMessage, setStatusMessage] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const svgRef = useRef<HTMLDivElement>(null);

  const showStatus = (msg: string, duration = 3000) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), duration);
  };

  const saveHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(-20), circuitData]);
  }, [circuitData]);

  const undo = useCallback(() => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setCircuitData(prev);
      setHistory(h => h.slice(0, -1));
      showStatus('↩ Deshacer');
    }
  }, [history]);

  // Create component at position
  const createComponent = useCallback((type: Tool, position: Point) => {
    if (type === 'select' || type === 'wire') return;
    
    saveHistory();
    const defaults = COMPONENT_DEFAULTS[type];
    const id = generateId();
    const terminals = getTerminals(type, position, 0);
    
    const component: CircuitComponent = {
      id,
      type,
      position,
      rotation: 0,
      value: defaults.value,
      unit: defaults.unit,
      label: defaults.label,
      terminals,
      properties: type === 'switch' ? { closed: false } : {},
    };

    setCircuitData(prev => ({
      ...prev,
      components: [...prev.components, component],
    }));
    setSelectedId(id);
    showStatus(`+ ${type.replace('_', ' ')} agregado`);
  }, [saveHistory]);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent, point: Point) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle click or Alt+click = pan
      setIsPanning(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    if (activeTool === 'wire') {
      if (!isDrawing) {
        setIsDrawing(true);
        setCurrentWirePoints([point]);
      } else {
        // Add point to wire
        const lastPoint = currentWirePoints[currentWirePoints.length - 1];
        if (point.x !== lastPoint.x || point.y !== lastPoint.y) {
          setCurrentWirePoints([...currentWirePoints, point]);
        }
      }
    } else if (activeTool === 'select') {
      // Check if clicking on a component to drag it
      const clickedComp = circuitData.components.find(comp => {
        const dx = Math.abs(comp.position.x - point.x);
        const dy = Math.abs(comp.position.y - point.y);
        return dx < 35 && dy < 20;
      });
      
      if (clickedComp) {
        setSelectedId(clickedComp.id);
        setIsDraggingComponent(true);
        setDragComponentOffset({
          x: point.x - clickedComp.position.x,
          y: point.y - clickedComp.position.y,
        });
        saveHistory();
      } else {
        setSelectedId(null);
      }
    } else {
      // Place component
      createComponent(activeTool, point);
    }
  }, [activeTool, isDrawing, currentWirePoints, createComponent, panOffset, circuitData.components, saveHistory]);

  const handleMouseMove = useCallback((e: React.MouseEvent, point: Point) => {
    if (isPanning && dragStart) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (isDraggingComponent && selectedId) {
      const newPos = {
        x: point.x - dragComponentOffset.x,
        y: point.y - dragComponentOffset.y,
      };
      setCircuitData(prev => ({
        ...prev,
        components: prev.components.map(c => {
          if (c.id !== selectedId) return c;
          return {
            ...c,
            position: newPos,
            terminals: getTerminals(c.type, newPos, c.rotation),
          };
        }),
      }));
      setSimulationData(null);
      setSimulationResults(new Map());
    }
  }, [isPanning, dragStart, isDraggingComponent, selectedId, dragComponentOffset]);

  const handleMouseUp = useCallback((e: React.MouseEvent, point: Point) => {
    if (isPanning) {
      setIsPanning(false);
      setDragStart(null);
      return;
    }
    if (isDraggingComponent) {
      setIsDraggingComponent(false);
    }
  }, [isPanning, isDraggingComponent]);

  const finishWire = useCallback(() => {
    if (currentWirePoints.length >= 2) {
      saveHistory();
      const wire: Wire = {
        id: generateId(),
        points: [...currentWirePoints],
      };
      setCircuitData(prev => ({
        ...prev,
        wires: [...prev.wires, wire],
      }));
      showStatus('🔌 Cable agregado');
    }
    setIsDrawing(false);
    setCurrentWirePoints([]);
  }, [currentWirePoints, saveHistory]);

  // Double click to finish wire
  const handleDoubleClick = useCallback(() => {
    if (isDrawing) {
      finishWire();
    }
  }, [isDrawing, finishWire]);

  // Component operations
  const handleComponentClick = useCallback((id: string) => {
    setSelectedId(id);
    if (activeTool !== 'select') {
      setActiveTool('select');
    }
    // Toggle switch on click
    const comp = circuitData.components.find(c => c.id === id);
    if (comp && comp.type === 'switch') {
      saveHistory();
      setCircuitData(prev => ({
        ...prev,
        components: prev.components.map(c => {
          if (c.id !== id) return c;
          return { ...c, properties: { ...c.properties, closed: !c.properties.closed } };
        }),
      }));
      setSimulationData(null);
      setSimulationResults(new Map());
      showStatus(comp.properties.closed ? '🔴 Switch abierto' : '🟢 Switch cerrado');
    }
  }, [activeTool, circuitData.components, saveHistory]);

  const handleWireClick = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleUpdateComponent = useCallback((id: string, updates: Partial<CircuitComponent>) => {
    saveHistory();
    setCircuitData(prev => ({
      ...prev,
      components: prev.components.map(c => {
        if (c.id !== id) return c;
        const updated = { ...c, ...updates };
        // Recalculate terminals if rotation changed
        if (updates.rotation !== undefined) {
          updated.terminals = getTerminals(c.type, c.position, updates.rotation);
        }
        if (updates.properties) {
          updated.properties = { ...c.properties, ...updates.properties };
        }
        return updated;
      }),
    }));
    setSimulationData(null);
    setSimulationResults(new Map());
  }, [saveHistory]);

  const handleDeleteComponent = useCallback((id: string) => {
    saveHistory();
    setCircuitData(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== id),
      wires: prev.wires.filter(w => w.id !== id),
    }));
    setSelectedId(null);
    setSimulationData(null);
    setSimulationResults(new Map());
    showStatus('🗑️ Eliminado');
  }, [saveHistory]);

  const handleRotateComponent = useCallback((id: string) => {
    saveHistory();
    setCircuitData(prev => ({
      ...prev,
      components: prev.components.map(c => {
        if (c.id !== id) return c;
        const newRotation = (c.rotation + 90) % 360;
        return {
          ...c,
          rotation: newRotation,
          terminals: getTerminals(c.type, c.position, newRotation),
        };
      }),
    }));
    setSimulationData(null);
    setSimulationResults(new Map());
  }, [saveHistory]);

  // Simulation
  const handleSimulate = useCallback(() => {
    setIsSimulating(true);
    setTimeout(() => {
      const result = simulateCircuit(circuitData);
      setSimulationData(result);
      
      if (result.success) {
        const resultsMap = new Map<string, { current: number; voltage: number }>();
        result.branchCurrents.forEach(bc => {
          resultsMap.set(bc.componentId, { current: bc.current, voltage: bc.voltage });
        });
        setSimulationResults(resultsMap);
        showStatus(`✅ Simulación exitosa | ${result.branchCurrents.length} ramas analizadas`);
      } else {
        showStatus(`⚠️ ${result.error || 'Error en simulación'}`);
        setSimulationResults(new Map());
      }
      setIsSimulating(false);
    }, 100);
  }, [circuitData]);

  // File operations
  const handleSave = useCallback(() => {
    const dataToSave = { ...circuitData, name: circuitName };
    downloadCircuit(dataToSave);
    showStatus('💾 Archivo guardado');
  }, [circuitData, circuitName]);

  const handleLoad = useCallback(async () => {
    try {
      const data = await uploadCircuit();
      saveHistory();
      setCircuitData(data);
      setCircuitName(data.name);
      setSimulationData(null);
      setSimulationResults(new Map());
      setSelectedId(null);
      showStatus(`📂 "${data.name}" cargado`);
    } catch (err) {
      if ((err as Error).message !== 'No se seleccionó archivo') {
        showStatus('❌ Error al cargar archivo');
      }
    }
  }, [saveHistory]);

  const handleNew = useCallback(() => {
    if (circuitData.components.length > 0 || circuitData.wires.length > 0) {
      if (!confirm('¿Crear nuevo circuito? Se perderán los cambios no guardados.')) return;
    }
    saveHistory();
    setCircuitData(createEmptyCircuit());
    setCircuitName('Mi Circuito');
    setSimulationData(null);
    setSimulationResults(new Map());
    setSelectedId(null);
    showStatus('📄 Nuevo circuito');
  }, [circuitData, saveHistory]);

  const handleExportImage = useCallback(() => {
    const svgEl = svgRef.current?.querySelector('svg');
    if (!svgEl) return;
    
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `${circuitName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showStatus('🖼️ Imagen exportada');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  }, [circuitName]);

  const handleClear = useCallback(() => {
    if (!confirm('¿Limpiar todo el circuito?')) return;
    saveHistory();
    setCircuitData(prev => ({ ...prev, components: [], wires: [] }));
    setSimulationData(null);
    setSimulationResults(new Map());
    setSelectedId(null);
    showStatus('🗑️ Circuito limpiado');
  }, [saveHistory]);

  const handleLoadExample = useCallback((data: CircuitData) => {
    saveHistory();
    setCircuitData(data);
    setCircuitName(data.name);
    setSimulationData(null);
    setSimulationResults(new Map());
    setSelectedId(null);
    showStatus(`📚 Ejemplo "${data.name}" cargado`);
  }, [saveHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          handleDeleteComponent(selectedId);
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (selectedId) {
          handleRotateComponent(selectedId);
        }
      } else if (e.key === 'Escape') {
        if (isDrawing) {
          finishWire();
        }
        setSelectedId(null);
        setActiveTool('select');
      } else if (e.key === 'Enter' && isDrawing) {
        finishWire();
      } else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'w') {
        setActiveTool('wire');
      } else if (e.key === 'v') {
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, isDrawing, handleDeleteComponent, handleRotateComponent, finishWire, undo, handleSave]);

  // Zoom with scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(z => Math.max(0.3, Math.min(3, z + delta)));
      }
    };
    const el = svgRef.current;
    if (el) {
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }
  }, []);

  const selectedComponent = circuitData.components.find(c => c.id === selectedId) || null;
  const selectedWire = circuitData.wires.find(w => w.id === selectedId) || null;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Welcome Modal */}
      {showWelcome && (
        <WelcomeModal 
          onClose={() => setShowWelcome(false)} 
          onLoadExample={handleLoadExample}
          onLoadFile={handleLoad}
        />
      )}

      {/* Top Bar */}
      <header className="h-10 bg-gray-800 text-white flex items-center px-3 gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="font-bold text-sm">CircuitSim</span>
        </div>
        <div className="h-5 w-px bg-gray-600" />
        <input 
          type="text"
          value={circuitName}
          onChange={(e) => setCircuitName(e.target.value)}
          className="bg-transparent border-none text-sm text-gray-200 focus:outline-none focus:text-white w-48"
          placeholder="Nombre del circuito"
        />
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>|</span>
          <span>Componentes: {circuitData.components.length}</span>
          <span>|</span>
          <span>Cables: {circuitData.wires.length}</span>
        </div>
        <div className="h-5 w-px bg-gray-600" />
        <button 
          onClick={() => setZoom(1)} 
          className="text-xs px-2 py-0.5 bg-gray-700 rounded hover:bg-gray-600"
        >
          Reset Zoom
        </button>
        <button 
          onClick={() => setShowWelcome(true)} 
          className="text-xs px-2 py-0.5 bg-indigo-600 rounded hover:bg-indigo-500"
          title="Ayuda y ejemplos"
        >
          ❓ Ayuda
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar */}
        <div className="w-44 shrink-0 overflow-y-auto">
          <Toolbar
            activeTool={activeTool}
            onToolSelect={setActiveTool}
            onSimulate={handleSimulate}
            onClear={handleClear}
            onSave={handleSave}
            onLoad={handleLoad}
            onNew={handleNew}
            onExportImage={handleExportImage}
            showValues={showValues}
            onToggleValues={() => setShowValues(!showValues)}
            isSimulating={isSimulating}
          />
        </div>

        {/* Canvas */}
        <div className="flex-1 relative" ref={svgRef} onDoubleClick={handleDoubleClick}
          onContextMenu={(e) => {
            e.preventDefault();
            if (isDrawing) {
              finishWire();
            }
          }}>
          <CircuitCanvas
            components={circuitData.components}
            wires={circuitData.wires}
            selectedId={selectedId}
            showValues={showValues}
            simulationResults={simulationResults}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onComponentClick={handleComponentClick}
            onWireClick={handleWireClick}
            panOffset={panOffset}
            zoom={zoom}
            currentWirePoints={currentWirePoints}
            isDrawing={isDrawing}
            isDraggingComponent={isDraggingComponent}
          />
          
          {/* Drawing wire indicator */}
          {isDrawing && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
              🔌 Dibujando cable - Click para agregar puntos, Enter/Doble-click para terminar, Esc para cancelar
            </div>
          )}

          {/* Tool indicator */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-xs px-3 py-1.5 rounded-lg shadow border border-gray-200">
            Herramienta: <span className="font-semibold text-blue-600 capitalize">{activeTool === 'select' ? 'Seleccionar' : activeTool === 'wire' ? 'Cable' : activeTool.replace('_', ' ')}</span>
            {activeTool !== 'select' && activeTool !== 'wire' && (
              <span className="text-gray-400 ml-2">• Click para colocar</span>
            )}
            {activeTool === 'wire' && !isDrawing && (
              <span className="text-gray-400 ml-2">• Click para iniciar cable</span>
            )}
          </div>

          {/* Status message */}
          {statusMessage && (
            <div className="absolute bottom-3 right-3 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg animate-pulse">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-56 shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
          <PropertiesPanel
            selectedComponent={selectedComponent}
            selectedWire={selectedWire}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
            onRotateComponent={handleRotateComponent}
            simulationData={simulationData}
          />
          
          {/* Simulation Results Summary */}
          {simulationData?.success && (
            <div className="border-t border-gray-200 p-3">
              <div className="text-xs font-semibold text-gray-500 mb-2">📊 RESUMEN</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nodos:</span>
                  <span className="font-mono">{simulationData.nodeVoltages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ramas:</span>
                  <span className="font-mono">{simulationData.branchCurrents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Potencia total:</span>
                  <span className="font-mono text-orange-600">
                    {simulationData.totalPower.toFixed(4)} W
                  </span>
                </div>
              </div>
            </div>
          )}

          {simulationData && !simulationData.success && (
            <div className="border-t border-gray-200 p-3">
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                ⚠️ {simulationData.error}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-6 bg-gray-800 text-gray-400 text-xs flex items-center px-3 gap-4 shrink-0">
        <span>CircuitSim v1.0</span>
        <span>|</span>
        <span>Grid: {GRID_SIZE}px</span>
        <span>|</span>
        <span>Ctrl+Scroll = Zoom | Alt+Click = Pan | R = Rotar | Del = Eliminar | W = Cable | V = Seleccionar</span>
        <div className="flex-1" />
        <span>Formato: .circuit (JSON)</span>
      </footer>
    </div>
  );
}
