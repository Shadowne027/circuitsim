# RESUMEN DE EJERCICIOS IMPLEMENTADOS

## ✅ EJERCICIO 1 - Circuito Serie

**Diagrama:**
```
             R1(70Ω)    R2(35Ω)    R3(100Ω)
A ─────────/\/\/──────/\/\/──────/\/\/──────── B
|                                               |
|                                               |
└────────────────────── V0(100V) ──────────────┘
```

**Componentes:**
- V0 = 100V (fuente de voltaje)
- R1 = 70Ω
- R2 = 35Ω
- R3 = 100Ω

**Cálculos:**
- RT = R1 + R2 + R3 = 70 + 35 + 100 = **205Ω**
- I0 = V0 / RT = 100 / 205 = **0.4878A = 487.8mA**
- V1 = I0 × R1 = 0.4878 × 70 = **34.15V**
- V2 = I0 × R2 = 0.4878 × 35 = **17.07V**
- V3 = I0 × R3 = 0.4878 × 100 = **48.78V**
- P1 = I0² × R1 = **16.66W**
- P2 = I0² × R2 = **8.33W**
- P3 = I0² × R3 = **23.80W**

**Verificación:** V1 + V2 + V3 = 34.15 + 17.07 + 48.78 = **100V** ✅

---

## ✅ EJERCICIO 2 - Resistencia Equivalente

**Diagrama:**
```
                 R1(10Ω)          R3(10Ω)
A ─────────────/\/\/─────────────/\/\/───────────────┐
|                                                     |
|                           R2(20Ω)                   |
|                           (vertical)                |
|                                                     |
|                         ┌────/\/\/──── R4(20Ω) ────┤
|                         │                           |
|                         │      R5(10Ω)   R6(10Ω)    |
|                         └────/\/\/──────/\/\/───────┤
|                                                     |
└───────────────────────────────────────────────────── B
```

**Componentes:**
- R1 = 10Ω
- R2 = 20Ω
- R3 = 10Ω
- R4 = 20Ω
- R5 = 10Ω
- R6 = 10Ω

**Cálculos:**
- R56 = R5 + R6 = 10 + 10 = **20Ω**
- R4||(R5+R6) = 20||20 = (20×20)/(20+20) = **10Ω**
- R3 + [R4||(R5+R6)] = 10 + 10 = **20Ω**
- R2 || {R3 + [...]} = 20||20 = **10Ω**
- RAB = R1 + {R2||[...]} = 10 + 10 = **20Ω**

**Resultado:** RAB = **20Ω** ✅

---

## ✅ EJERCICIO 3 - Análisis de Ramas

**Diagrama:**
```
                         R1(10Ω)
                    ┌────/\/\/────┐
                    │             │
A ─────/\/\/────────┤             ├──────── B
       20Ω          │             │
                    │   R2(5Ω)    │
                    └──/\/\/──────┤
                        │         │
                    R(5Ω)         │
                    ─/\/\/────────┘
                    
I2 = 2A
```

**Componentes:**
- I2 = 2A (fuente de corriente)
- R20 = 20Ω (resistencia de entrada)
- R1 = 10Ω
- R2 = 5Ω
- R = 5Ω

**Cálculos:**
- R_rama_derecha = R2 + R = 5 + 5 = **10Ω**
- V_rama = I2 × R_rama = 2 × 10 = **20V**
- V1 = 20V (en paralelo)
- I1 = V1 / R1 = 20 / 10 = **2A**
- I0 = I1 + I2 = 2 + 2 = **4A**
- V_20Ω = I0 × 20 = 4 × 20 = **80V**
- V2 = I2 × R2 = 2 × 5 = **10V**

**Verificación:** 80V + 20V = **100V** ✅

---

## ✅ EJERCICIO 4 - Red Mixta

**Diagrama:**
```
                         R4(600Ω)
                    ┌────/\/\/────┐
                    │             │
                    │    R5       │
                    │  1800Ω      │
                    │   /\/\/     │
R1(55Ω)             │             │
A ──/\/\/───┬───────┤    R6       ├──────┬──/\/\/── B
            │       │  1400Ω      │      │   R3(50Ω)
            │       │   /\/\/     │      │
            │       │             │      │
            │       │    R7       │      │
            │       │   400Ω      │      │
            │       │   /\/\/     │      │
            │       │    R8       │      │
            │       │   500Ω      │      │
            │       │   /\/\/     │      │
            │       └─────────────┘      │
            │                            │
            └──────────/\/\/─────────────┘
                       R2(340Ω)

V = 24V
```

**Componentes:**
- V = 24V
- R1 = 55Ω
- R2 = 340Ω
- R3 = 50Ω
- R4 = 600Ω
- R5 = 1800Ω
- R6 = 1400Ω
- R7 = 400Ω
- R8 = 500Ω

**Cálculos:**
- R78 = R7 + R8 = 400 + 500 = **900Ω**
- RP = R5 || R6 || R78 = 1800 || 1400 || 900 = **420Ω**
- R4P = R4 + RP = 600 + 420 = **1020Ω**
- RB = R2 || R4P = 340 || 1020 = **255Ω**
- RT = R1 + RB + R3 = 55 + 255 + 50 = **360Ω**
- IT = V / RT = 24 / 360 = **0.06667A = 66.67mA**

**Voltajes:**
- VR1 = IT × R1 = 0.06667 × 55 = **3.67V**
- VR3 = IT × R3 = 0.06667 × 50 = **3.33V**
- V_bloque_paralelo = IT × RB = 0.06667 × 255 = **17.00V**
- VR2 = 17.00V
- I_rama_R4P = 17 / 1020 = **16.67mA**
- VR4 = 0.01667 × 600 = **10.00V**
- V_bloque_R5_R6_R78 = 0.01667 × 420 = **7.00V**
- VR5 = 7.00V
- VR6 = 7.00V
- VR7 = 0.01667 × 400 = **3.11V**
- VR8 = 0.01667 × 500 = **3.89V**

**Verificación:** 3.67 + 17.00 + 3.33 = **24V** ✅

---

## ✅ EJERCICIO 5 - Compuertas Lógicas

**Diagrama:**
```
A ───────┬──────── AND ───────────────┐
         │          ▲                 │
         │          │                 │
B ───────┘          │                 │
                    │                 │
A ─── NOT ──────────┤                 │
                    │                 │
B ──────────────────┘                 │
                                      │
                                      ▼
                                    NOR ───────┐
                                               │
                                               │
RAMA INFERIOR                                OR ─── SALIDA
                                               │
A ─── NOT ───┬── AND ───┐                      │
             │          │                      │
B ───────────┘          │                      │
                        ├──── NOR ─── NOT ─────┘
A ───────────── AND ────┘
B ──────────────────────┘
```

**Entradas:**
- A = 1
- B = 0

**Cálculos:**

**RAMA SUPERIOR:**
- AND(A, B) = AND(1, 0) = **0**
- NOT(A) = NOT(1) = **0**
- AND(NOT(A), B) = AND(0, 0) = **0**
- NOR(AND(A,B), AND(NOT(A),B)) = NOR(0, 0) = **1**

**RAMA INFERIOR:**
- NOT(A) = NOT(1) = **0**
- AND(NOT(A), B) = AND(0, 0) = **0**
- AND(A, B) = AND(1, 0) = **0**
- NOR(AND(NOT(A),B), AND(A,B)) = NOR(0, 0) = **1**
- NOT(NOR(...)) = NOT(1) = **0**

**SALIDA FINAL:**
- OR(RAMA_SUPERIOR, RAMA_INFERIOR) = OR(1, 0) = **1**

**Resultado:** Salida = **1** ✅

---

## 📋 CÓMO USAR

1. **Recarga la página** para ver el modal de bienvenida
2. **Selecciona cualquier ejercicio** de la lista
3. **Presiona "▶ Simular DC"** para ejecutar la simulación
4. **Pasa el mouse** sobre los componentes para ver voltaje, corriente y potencia
5. **Haz click** en un componente para ver detalles en el panel derecho

## 🔧 FUNCIONALIDADES

✅ **Simulación analógica** (ejercicios 1-4)
- Ley de Ohm
- Leyes de Kirchhoff
- Análisis nodal
- Cálculo de potencias

✅ **Simulación digital** (ejercicio 5)
- Compuertas lógicas (AND, OR, NOT, NOR, NAND, XOR)
- Evaluación iterativa
- Visualización de estados (0/1)

✅ **Herramientas**
- Arrastrar y soltar componentes
- Rotar componentes (tecla R)
- Dibujar cables con snap automático
- Zoom con Ctrl+scroll
- Pan con click y arrastre
- Guardar/cargar circuitos (.circuit)
- Exportar a PNG

✅ **Debug**
- Modo de visualización de nodos
- Tooltips con información en tiempo real
- Panel de propiedades detallado

---

## 🎯 RESULTADOS ESPERADOS

| Ejercicio | Resultado Principal | Verificación |
|-----------|-------------------|--------------|
| 1 | I0 = 487.8mA | V1+V2+V3 = 100V ✅ |
| 2 | RAB = 20Ω | Cálculo paso a paso ✅ |
| 3 | V_20Ω = 80V | 80V+20V = 100V ✅ |
| 4 | IT = 66.67mA | VR1+VB+VR3 = 24V ✅ |
| 5 | Salida = 1 | Evaluación lógica ✅ |

Todos los ejercicios están implementados y funcionando correctamente.
