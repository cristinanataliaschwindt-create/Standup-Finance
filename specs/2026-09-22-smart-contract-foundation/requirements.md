# Requisitos y Contexto: Smart Contract Foundation

## Alcance (Scope)
El objetivo de esta fase es implementar un MVP estricto del contrato inteligente principal en Soroban (Rust). La funcionalidad se limitará a actuar como un registro (ledger) no custodial para los saldos de los usuarios.

**Incluido en esta fase:**
- Registro de saldos por usuario.
- Función principal de depósito de tokens (microahorros).
- Función de consulta de saldo.

**Excluido de esta fase:**
- Conexión a protocolos de liquidez o generación de rendimiento (yield generation / DeFi).
- Funciones de administrador complejas (pausar contrato, actualizaciones).

## Decisiones de Diseño
- **No Custodial:** El contrato debe requerir autorización (firmas) del usuario para mover fondos y solo registra el balance asociado a su cuenta de Stellar.
- **Simplicidad:** Mantener el código mínimo e indispensable para conectar luego la extensión del navegador (MVP Fase 1).

## Contexto
Según nuestra [Misión](../mission.md) y [Tech Stack](../tech-stack.md), esta base técnica en Stellar/Soroban garantiza bajas comisiones y alta velocidad, permitiendo que las micro-inversiones (diferenciales de ahorro al comprar productos) se almacenen de manera eficiente y transparente, antes de evolucionar a la generación de rendimientos en la Fase 2.
