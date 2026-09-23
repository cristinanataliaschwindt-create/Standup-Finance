# Plan de Implementación: MVP (Soroban + Frontend Next.js + Browser Extension)

Este plan detalla las tareas para la Fase 1.1, 1.2, 1.3 y 1.4 del roadmap.

## Fase 1.1: Smart Contract Foundation
### Grupo 1: Estructuras de Datos
- `[x]` Definir el estado del contrato (`DataKey` enum).
- `[x]` Implementar la estructura para almacenar el saldo por usuario (`UserBalance`).
- `[x]` Configurar el almacenamiento persistente (`env.storage().persistent()`).

### Grupo 2: Lógica de Depósito y Tokenización
- `[x]` Implementar la función de inicialización del contrato (si es necesaria).
- `[x]` Crear la función `deposit` que reciba fondos y actualice el saldo del usuario.
- `[x]` Crear la función `get_balance` para consultar el saldo de una dirección específica.
- `[x]` Asegurar la validación de firmas y autenticación del usuario.

### Grupo 3: Tests Unitarios Locales
- `[x]` Configurar el entorno de testing de Rust para Soroban (`soroban-sdk::testutils`).
- `[x]` Escribir test para verificar que el depósito incrementa correctamente el saldo.
- `[x]` Escribir test para verificar que `get_balance` retorna 0 para usuarios nuevos.
- `[x]` Escribir test para depósitos múltiples del mismo usuario.

## Fase 1.2: Basic Web App & Wallet
### Grupo 4: Configuración UI y Estilos
- `[x]` Configurar los estilos globales (CSS/Tailwind) respetando la paleta de colores actual (tonalidades beige, marrón y naranja) y la tipografía base.
- `[x]` Crear la estructura base de la aplicación (Layout principal, Header) manteniendo el minimalismo.

### Grupo 5: Integración Freighter Wallet
- `[x]` Crear un `WalletProvider` global usando React Context para exponer el estado de la conexión (cuenta pública conectada) a toda la app.
- `[x]` Implementar una estrategia de conexión de baja fricción: leer la cuenta pasivamente y solicitar la firma en Freighter únicamente al momento de autorizar una transacción.

### Grupo 6: Componentes y Conexión On-Chain
- `[x]` Desarrollar el componente para el botón "Conectar Wallet".
- `[x]` Desarrollar el "Dashboard" principal que se conecte al RPC de Soroban para mostrar el saldo (UserBalance) consultando el contrato.

## Fase 1.3: Browser Extension Prototype
### Grupo 7: Setup y Arquitectura Vanilla
- `[x]` Crear la carpeta `extension/` en la raíz del proyecto.
- `[x]` Crear el `manifest.json` (V3) con permisos para `https://www.carrefour.com.ar/*` (prioridad), y opcionalmente dia/coto.
- `[x]` Definir los permisos necesarios (`activeTab`, `scripting`, `storage`).

### Grupo 8: Interfaz del Popup
- `[x]` Construir `popup.html` usando HTML/CSS vanilla.
- `[x]` Aplicar la paleta de colores del proyecto (beige, marrón, naranja) para mantener coherencia con la web app.
- `[x]` Añadir `popup.js` para manejar la UI de la extensión.

### Grupo 9: Lógica de Sustitución (Content Script)
- `[x]` Crear `background.js` (Service Worker) para el manejo de estado en la extensión.
- `[x]` Crear `content.js` que se inyecte en Carrefour, detecte elementos del DOM relacionados al carrito y pueda lanzar una alerta/overlay de sustitución simulada.

## Fase 1.4: Substitution Engine
### Grupo 10: API Backend (Next.js)
- `[x]` Crear un nuevo endpoint / Route Handler en Next.js (`frontend/app/api/substitution/route.ts`).
- `[x]` Hardcodear un diccionario clave-valor exacto en el API (ej. `Café Premium La Morenita 500g` -> `Café Pyme El Sol 500g` calculando la diferencia).
- `[x]` Configurar encabezados CORS para permitir peticiones entrantes desde la extensión.

### Grupo 11: Integración de DOM Scraping (Extensión)
- `[x]` Actualizar `extension/scripts/content.js` para usar selectores reales de Carrefour para extraer el título y precio del producto en pantalla (DOM Scraping).
- `[x]` Conectar `content.js` mediante un `fetch()` a la nueva API local de Next.js enviando los datos extraídos.
- `[x]` Recibir la respuesta del API y, si existe un sustituto válido, desplegar el overlay que creamos en la Fase 1.3 con los datos reales calculados.

## Fase 1.5: E2E Flow Integration
### Grupo 12: Puente Extensión-WebApp
- `[x]` Actualizar `content.js` para que el botón "Invertir" abra una pestaña redireccionando a `http://localhost:3000/invest?amount=...&item=...`.
- `[x]` Garantizar que la redirección contenga los parámetros correctos del ahorro.

### Grupo 13: Procesamiento y Firma (Next.js)
- `[x]` Crear una nueva página en Next.js (`frontend/app/invest/page.tsx`) dedicada a recibir el redireccionamiento.
- `[x]` Implementar auto-conexión a Freighter al montar la página y llamada a Soroban (`registrar_ahorro`) de forma transparente.
- `[x]` Mostrar un "Estado de éxito" y luego devolver al usuario a su flujo original (cerrar la pestaña).
