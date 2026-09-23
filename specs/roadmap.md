# Roadmap

Nuestro roadmap refleja el pivote estratégico hacia una experiencia **100% Mobile-First**, con integración a métodos de pago existentes (sin fricción para el usuario) y respaldada por la blockchain de Stellar.

## Fase 1: Core MVP (✅ Completada)
- **1.1 Smart Contract Foundation:** Desarrollo del contrato no-custodial en Soroban (Rust) con almacenamiento persistente por usuario.
- **1.2 Basic Web App & Wallet:** Frontend en Next.js/TypeScript con integración de Freighter Wallet para autenticación y firma de transacciones.
- **1.3 Browser Extension Prototype:** Prototipo de extensión para demostrar el concepto del motor de sustitución sobre e-commerce. *(Descartada como producto final en favor de Mobile PWA.)*
- **1.4 Substitution Engine:** API en Next.js que implementa la lógica de sustitución de productos y calcula el diferencial de precio.
- **1.5 E2E Flow Integration:** Conexión completa: detección de producto → sustitución → micro-inversión en Soroban. *(Servió para validar el flujo, ahora se rediseña para Mobile.)*

## Fase 2: Mobile-First & Payment Integration (Próxima)
- **2.1 PWA Mobile-First:** Convertir la Web App en una Progressive Web App optimizada para pantalla de celular (sin instalación de extensiones). Incluye diseño responsive, manifest para "Agregar al Inicio" y experiencia fluida en iOS/Android.
- **2.2 Motor de Sustitución Mobile:** Migrar la lógica del Substitution Engine al contexto mobile: detección basada en la navegación dentro de la propia PWA (In-App Browser sobre los e-commerce) o por historial de compras.
- **2.3 Integración MercadoPago (MVP de Pagos):** Conectar con la API de MercadoPago para detectar compras en tiempo real via webhooks. Cuando el usuario paga normalmente con MP en un comercio participante, Standup Finance intercepta la transacción en segundo plano y envia automáticamente el diferencial a Soroban. Sin segundo paso para el usuario.
- **2.4 Timing Correcto de Micro-inversión:** Implementar el sistema de "intención de ahorro confirmada": el depósito en Soroban solo se ejecuta cuando se confirma el evento de pago real, no cuando el usuario acepta la sugerencia.

## Fase 3: Yield & Escala (Futuro)
- **3.1 DeFi / Generación de Rendimientos:** Conectar la bóveda de Soroban a protocolos de liquidez de Stellar para generar APY automático sobre los micro-ahorros acumulados.
- **3.2 Open Banking (BCRA):** Expandir la integración de pagos más allá de MercadoPago, apuntando a Open Banking regulado por BCRA para soportar cualquier billetera o banco del usuario sin depender de un único proveedor.
- **3.3 Red de Pymes Asociadas:** Mapear y onboardear comercios físicos locales que ofrezcan sus productos como "sustitutos recomendados" dentro de la plataforma, creando un ecosistema de circuito corto (consumidor ↔ Pyme).
