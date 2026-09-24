# Validación: Smart Contract Foundation

Este documento define cómo sabremos que la implementación de la Fase 1.1 ha sido exitosa y está lista para fusionarse (merge).

## Criterio de Éxito
El contrato se considera validado si **pasa exitosamente todas las pruebas unitarias locales en Rust** (`cargo test`).

## Casos de Prueba Requeridos
Para que la implementación se considere completa, los tests deben cubrir y pasar exitosamente los siguientes escenarios:
1. **Lectura inicial:** Un usuario nuevo debe tener un saldo de 0.
2. **Depósito exitoso:** Al llamar a la función de depósito, el saldo del usuario debe incrementarse en la cantidad exacta depositada.
3. **Depósitos múltiples:** Múltiples depósitos del mismo usuario deben sumar correctamente el saldo total sin sobreescribir el historial.
4. **Independencia de saldos:** Los depósitos de un Usuario A no deben afectar el saldo de un Usuario B.

**Nota:** El despliegue en Testnet y la validación con la wallet Freighter (frontend) se abordarán en las fases siguientes del MVP.
