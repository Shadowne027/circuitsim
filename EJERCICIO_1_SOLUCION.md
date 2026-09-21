# EJERCICIO 1 - Solución Detallada

## Circuito
- **Fuente de voltaje:** V = 12V
- **Resistencias en serie:** R1 = 100Ω, R2 = 200Ω, R3 = 300Ω

## Cálculos Teóricos

### 1. Resistencia Total (Serie)
```
R_total = R1 + R2 + R3
R_total = 100 + 200 + 300
R_total = 600Ω
```

### 2. Corriente Total (Io) - Ley de Ohm
```
Io = V / R_total
Io = 12V / 600Ω
Io = 0.02A = 20mA
```

### 3. Voltajes en cada Resistencia - Ley de Ohm
```
V1 = Io × R1 = 0.02A × 100Ω = 2V
V2 = Io × R2 = 0.02A × 200Ω = 4V
V3 = Io × R3 = 0.02A × 300Ω = 6V
```

**Verificación (Ley de Voltajes de Kirchhoff):**
```
V = V1 + V2 + V3
12V = 2V + 4V + 6V ✓
```

### 4. Potencias Disipadas - Ley de Potencia
```
P1 = V1 × Io = 2V × 0.02A = 0.04W = 40mW
P2 = V2 × Io = 4V × 0.02A = 0.08W = 80mW
P3 = V3 × Io = 6V × 0.02A = 0.12W = 120mW
```

**Potencia Total:**
```
P_total = P1 + P2 + P3
P_total = 40mW + 80mW + 120mW
P_total = 240mW = 0.24W
```

**Verificación alternativa:**
```
P_total = V × Io = 12V × 0.02A = 0.24W ✓
```

## Resultados Esperados en el Simulador

Al cargar el "EJERCICIO 1" y presionar "Simular DC", deberías ver:

### En V1 (Fuente):
- **Voltaje:** 12V
- **Corriente:** 20mA (sale del terminal positivo)

### En R1 (100Ω):
- **Voltaje:** 2V
- **Corriente:** 20mA
- **Potencia:** 40mW

### En R2 (200Ω):
- **Voltaje:** 4V
- **Corriente:** 20mA
- **Potencia:** 80mW

### En R3 (300Ω):
- **Voltaje:** 6V
- **Corriente:** 20mA
- **Potencia:** 120mW

## Cómo Verificar en el Simulador

1. **Cargar el ejercicio:** Selecciona "📚 EJERCICIO 1" del modal de bienvenida
2. **Simular:** Presiona "▶ Simular DC" en la barra lateral
3. **Ver valores:** Pasa el mouse sobre cada componente para ver el tooltip con:
   - Voltaje (V)
   - Corriente (mA)
   - Potencia (mW)

4. **Panel de propiedades:** Haz click en cada componente para ver los valores en el panel derecho

5. **Modo debug:** Activa "🔴 Nodos ON" para ver las conexiones eléctricas

## Si los Valores No Coinciden

Si el simulador muestra valores diferentes a los esperados:

1. **Verifica las conexiones:** Activa el modo debug de nodos
2. **Revisa la polaridad:** Asegúrate de que la fuente tenga el terminal positivo conectado correctamente
3. **Verifica los valores:** Confirma que R1=100Ω, R2=200Ω, R3=300Ω
4. **Reporta el problema:** Indica qué valores muestra el simulador vs. los esperados

## Fórmulas Utilizadas

- **Ley de Ohm:** V = I × R
- **Ley de Potencia:** P = V × I
- **Resistencias en Serie:** R_total = R1 + R2 + R3 + ...
- **Ley de Voltajes de Kirchhoff (KVL):** ΣV = 0 en cualquier malla cerrada
- **Ley de Corrientes de Kirchhoff (KCL):** En serie, la corriente es la misma en todos los componentes
