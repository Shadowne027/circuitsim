# EJERCICIOS DE CIRCUITOS - RESUMEN

## ✅ Ejercicios Implementados

### EJERCICIO 1 - Circuito en Serie ✅
**Valores:**
- V0 = 100V
- R1 = 70Ω
- R2 = 35Ω
- R3 = 100Ω

**Resultados esperados:**
- RT = 205Ω
- I0 = 0.4878A = 487.8mA
- V1 = 34.15V
- V2 = 17.07V
- V3 = 48.78V
- Potencia total = 48.78W

**Cómo verificar:**
1. Selecciona "EJERCICIO 1" del modal de bienvenida
2. Presiona "▶ Simular DC"
3. Pasa el mouse sobre cada componente para ver los valores

---

### EJERCICIO 2 - Resistencia Equivalente ✅
**Valores:**
- R1 = 10Ω
- R2 = 20Ω
- R3 = 10Ω
- R4 = 20Ω
- R5 = 10Ω
- R6 = 10Ω
- Fuente de prueba = 1V (para medir RAB)

**Configuración:**
- R5 + R6 en serie = 20Ω
- R4 || (R5+R6) = 10Ω
- R3 + [R4||(R5+R6)] = 20Ω
- R2 || {R3+[R4||(R5+R6)]} = 10Ω
- R1 + {R2||[...]} = 20Ω

**Resultado esperado:**
- RAB = 20Ω

**Cómo verificar:**
1. Selecciona "EJERCICIO 2"
2. Simula el circuito
3. Con V=1V, mide la corriente I
4. Calcula: RAB = V/I = 1V/I

---

### EJERCICIO 3 - Análisis de Ramas ✅
**Valores:**
- I2 = 2A (fuente de corriente)
- R5a = 5Ω
- R5b = 5Ω
- R1 = 10Ω
- R20 = 20Ω
- V total = 100V

**Configuración:**
- Rama derecha: R5a + R5b en serie = 10Ω
- R1 en paralelo con rama derecha
- R20 en serie con todo

**Resultados esperados:**
- V en paralelo = 20V
- I1 = 2A (por R1)
- I0 = 4A (corriente total)
- V en R20 = 80V
- V2 = 10V

**Cómo verificar:**
1. Selecciona "EJERCICIO 3"
2. Simula el circuito
3. Verifica los voltajes y corrientes en cada componente

---

### EJERCICIO 4 - Red Mixta Compleja ✅
**Valores:**
- R1 = 55Ω
- R2 = 340Ω
- R3 = 50Ω
- R4 = 600Ω
- R5 = 1800Ω
- R6 = 1400Ω
- R7 = 400Ω
- R8 = 500Ω
- V = 24V

**Configuración:**
- R7 + R8 en serie = 900Ω
- R5 || R6 || (R7+R8) = 420Ω
- R4 + [R5||R6||(R7+R8)] = 1020Ω
- R2 || {R4+[...]} = 255Ω
- R1 + {R2||[...]} + R3 = 360Ω

**Resultados esperados:**
- RT = 360Ω
- IT = 66.67mA
- VR1 = 3.67V
- VR2 = 17.00V
- VR3 = 3.33V
- VR4 = 10.00V
- VR5 = 7.00V
- VR6 = 7.00V
- VR7 = 3.11V
- VR8 = 3.89V

**Cómo verificar:**
1. Selecciona "EJERCICIO 4"
2. Simula el circuito
3. Verifica los voltajes en cada resistencia

---

## ❌ EJERCICIO 5 - Compuertas Lógicas (NO IMPLEMENTADO)

**Razón:**
El ejercicio 5 es un circuito de **lógica digital** con compuertas (AND, OR, NOR, NOT), no un circuito analógico de resistencias.

**Diferencias:**
- Los circuitos 1-4 son **analógicos**: usan voltajes, corrientes y resistencias
- El ejercicio 5 es **digital**: usa niveles lógicos (0 y 1) y compuertas booleanas

**Limitación del simulador:**
El motor de simulación actual está diseñado para:
- Ley de Ohm (V = I × R)
- Leyes de Kirchhoff
- Análisis nodal
- Circuitos resistivos

No puede simular:
- Compuertas lógicas (AND, OR, NOT, NOR, etc.)
- Niveles lógicos (0V = LOW, 5V = HIGH)
- Tablas de verdad

**Solución:**
Para simular el ejercicio 5 necesitarías:
1. Un simulador de lógica digital (como Logisim)
2. O agregar un motor de simulación digital al proyecto

**Resultado del ejercicio 5 (calculado manualmente):**
- Entrada: A=1, B=0
- Rama superior: NOR(AND(1,0), AND(NOT(1),0)) = NOR(0,0) = 1
- Rama inferior: NOT(NOR(AND(NOT(1),0), AND(NOT(1),0))) = NOT(NOR(0,0)) = NOT(1) = 0
- Salida final: OR(1,0) = 1

---

## 📋 Cómo usar los ejercicios

1. **Abre la aplicación**
2. **Selecciona el ejercicio** del modal de bienvenida
3. **Presiona "▶ Simular DC"**
4. **Pasa el mouse** sobre los componentes para ver voltaje, corriente y potencia
5. **Compara** los valores simulados con los resultados esperados

## 🔍 Modo Debug

Si los valores no coinciden:
1. Activa "🔴 Nodos ON (debug)" en la barra lateral
2. Verifica que todos los puntos del mismo color estén conectados
3. Ajusta las conexiones si es necesario

## 📚 Fórmulas utilizadas

**Ley de Ohm:**
- V = I × R
- I = V / R
- R = V / I

**Potencia:**
- P = V × I
- P = I² × R

**Serie:**
- RT = R1 + R2 + R3 + ...
- I total = I1 = I2 = I3 = ...
- V total = V1 + V2 + V3 + ...

**Paralelo:**
- 1/RT = 1/R1 + 1/R2 + ...
- V total = V1 = V2 = V3 = ...
- I total = I1 + I2 + I3 + ...
