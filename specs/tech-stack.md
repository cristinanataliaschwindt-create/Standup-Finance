# Tech Stack

Standup Finance está construida sobre un stack moderno y descentralizado, diseñado para transacciones de bajo costo, alta velocidad y una experiencia de usuario sin fricciones, enfocada en **Mobile-First**.

## Core Infrastructure (Blockchain)
- **Blockchain:** Stellar Network — transacciones de bajo costo y alta velocidad, ideal para micro-inversiones frecuentes.
- **Smart Contracts:** Soroban (Rust) — lógica no-custodial para registrar y asignar los micro-ahorros tokenizados de cada usuario.

## Frontend & Experiencia Móvil
- **Framework:** Next.js con TypeScript — aplicación web reactiva y robusta.
- **Distribución Mobile:** PWA (Progressive Web App) — sin necesidad de instalar nada desde el App Store. El usuario accede desde el navegador de su celular y puede agregar la app a su pantalla de inicio con un gesto.
- **Wallet Integration:** Freighter Wallet para firma segura de transacciones on-chain.
- **Diseño:** Mobile-First, responsive, paleta de tonalidades beige, marrón y naranja. Interfaz minimalista orientada al ahorro cotidiano.

## Integración de Pagos (Sin Fricción)
- **MVP: MercadoPago API** — el método de pago más utilizado en Argentina. El usuario paga normalmente con su cuenta de MP; Standup Finance recibe el evento de pago via **webhook** y en segundo plano enruta el diferencial de precio hacia Soroban. El usuario no realiza ninguna acción adicional.
- **Escala: Open Banking (BCRA)** — una vez validado el MVP con MercadoPago, se expande a una integración regulada por el Banco Central para cubrir cualquier banco o billetera del ecosistema argentino.

## Motor de Sustitución
- **Backend:** Route Handlers en Next.js (API) que comparan el producto del usuario contra un diccionario de sustitutos y calculan el diferencial exacto de precio.
- **Fuente de datos:** Inicialmente un catálogo hardcodeado (MVP) → evolucionará hacia scraping / integración de APIs de precios de supermercados y Pymes.
- **Timing:** El registro en Soroban ocurre únicamente al recibir la confirmación del evento de pago real (webhook de MP o similar), no al momento en que el usuario acepta la sugerencia.

## Extensión de Navegador *(Prototipo / Proof of Concept)*
- Conservada en el repositorio como prueba técnica del motor de sustitución.
- **No es el producto final.** El canal de distribución primario es la PWA mobile.
