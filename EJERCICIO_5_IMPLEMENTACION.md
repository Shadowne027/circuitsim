# EJERCICIO 5 - COMPUERTAS LÓGICAS

## ✅ Implementación Completada

El ejercicio 5 ha sido implementado exitosamente con un sistema de simulación digital completo.

## 🎯 Características Implementadas

### Componentes Lógicos Agregados:
- **Entrada Lógica** (🔲): Muestra el valor actual (0 o 1), color rojo para 0, verde para 1
- **Salida Lógica** (🔵): Muestra el resultado final, gris para 0, verde para 1
- **AND**: Salida 1 solo si ambas entradas son 1
- **OR**: Salida 1 si al menos una entrada es 1
- **NOT**: Invierte el valor de entrada
- **NAND**: Negación de AND
- **NOR**: Negación de OR
- **XOR**: Salida 1 si las entradas son diferentes

### Simulador Digital:
- Detección automática de circuitos lógicos vs analógicos
- Evaluación iterativa hasta estabilización
- Manejo de retroalimentación y bucles
- Visualización en tiempo real de valores

## 📋 Circuito del Ejercicio 5

**Entradas:**
- A = 1
- B = 0

**Estructura:**

### Rama Superior:
1. AND1(A, B) = AND(1, 0) = 0
2. NOT1(A) = NOT(1) = 0
3. AND2(NOT1(A), B) = AND(0, 0) = 0
4. NOR1(AND1, AND2) = NOR(0, 0) = 1

### Rama Inferior:
1. NOT2(A) = NOT(1) = 0
2. AND3(NOT2(A), B) = AND(0, 0) = 0
3. AND4(NOT2(A), B) = AND(0, 0) = 0
4. NOR2(AND3, AND4) = NOR(0, 0) = 1
5. NOT3(NOR2) = NOT(1) = 0

### Salida Final:
- OR1(Rama Superior, Rama Inferior) = OR(1, 0) = 1

**Resultado Esperado: 1** ✅

## 🎮 Cómo Usar

1. **Cargar el ejercicio**: Selecciona "EJERCICIO 5" del modal de bienvenida
2. **Cambiar entradas**: Haz click en las entradas A o B para cambiar su valor (0/1)
3. **Simular**: Presiona "▶ Simular DC"
4. **Ver resultados**: Las salidas mostrarán su valor (verde = 1, gris = 0)
5. **Tooltip**: Pasa el mouse sobre cualquier compuerta para ver su valor

## 🔧 Funcionalidades Adicionales

### Interactividad:
- Click en entradas para toggle entre 0 y 1
- Visualización de colores según el estado
- Tooltips con información de cada compuerta
- Arrastrar y mover componentes libremente

### Simulación:
- Detección automática de tipo de circuito
- Evaluación iterativa con límite de 100 iteraciones
- Manejo de estados inestables
- Actualización en tiempo real

## 📊 Tabla de Verdad

| A | B | AND1 | NOT1 | AND2 | NOR1 | NOT2 | AND3 | AND4 | NOR2 | NOT3 | OR1 |
|---|---|------|------|------|------|------|------|------|------|------|-----|
| 1 | 0 |  0   |  0   |  0   |  1   |  0   |  0   |  0   |  1   |  0   |  1  |
| 1 | 1 |  1   |  0   |  0   |  0   |  0   |  0   |  0   |  1   |  0   |  0  |
| 0 | 0 |  0   |  1   |  0   |  1   |  1   |  0   |  0   |  1   |  0   |  1  |
| 0 | 1 |  0   |  1   |  1   |  0   |  1   |  1   |  1   |  0   |  1   |  1  |

## 💡 Diferencias con Circuitos Analógicos

| Característica | Analógico | Digital |
|----------------|-----------|---------|
| Valores | Continuos (V, A, Ω) | Discretos (0, 1) |
| Leyes | Ohm, Kirchhoff | Booleanas |
| Simulación | Análisis nodal | Evaluación iterativa |
| Componentes | R, C, L, fuentes | AND, OR, NOT, etc. |
| Visualización | Voltajes, corrientes | Estados lógicos |

## 🎯 Resultados por Combinación

### A=1, B=0 (Caso del ejercicio):
- **Rama Superior**: 1
- **Rama Inferior**: 0
- **Salida Final**: 1 ✅

### A=1, B=1:
- **Rama Superior**: 0
- **Rama Inferior**: 0
- **Salida Final**: 0

### A=0, B=0:
- **Rama Superior**: 1
- **Rama Inferior**: 0
- **Salida Final**: 1

### A=0, B=1:
- **Rama Superior**: 0
- **Rama Inferior**: 1
- **Salida Final**: 1

## 🔍 Modo Debug

Activa "🔴 Nodos ON (debug)" para ver:
- Conexiones entre compuertas
- Flujo de señales
- Puntos de conexión

## 📝 Notas Técnicas

- El simulador digital usa un algoritmo de evaluación iterativa
- Límite de 100 iteraciones para prevenir bucles infinitos
- Detección automática de circuitos mixtos (analógico + digital)
- Compatible con el sistema de archivos .circuit
- Todos los componentes lógicos tienen símbolos IEEE estándar

## 🚀 Próximos Pasos

Puedes:
1. Crear tus propios circuitos lógicos
2. Experimentar con diferentes combinaciones de entradas
3. Diseñar circuitos más complejos (flip-flops, contadores, etc.)
4. Combinar circuitos analógicos y digitales
5. Guardar y compartir tus diseños

¡El ejercicio 5 está completamente funcional y listo para usar!
