# Plan de Implementación: MVP (Soroban + Frontend Next.js + Browser Extension + PWA)

Este plan detalla las tareas para las Fases 1.1 — 2.1 del roadmap.

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

## Fase 2.1: PWA Mobile-First
### Grupo 14: Infraestructura PWA
- `[x]` Crear `frontend/public/manifest.json` con nombre, íconos, colores y modo `standalone`.
- `[x]` Crear `frontend/public/sw.js` (Service Worker): Cache-First para estáticos, Network-First para APIs.
- `[x]` Generar íconos PWA de la marca (192x192 y 512x512) en `frontend/public/icons/`.

### Grupo 15: Integración en Next.js
- `[x]` Actualizar `frontend/app/layout.tsx` con metadatos PWA, `<link rel="manifest">`, Apple Web App tags y registro automático del Service Worker.
- `[x]` Actualizar `frontend/next.config.ts` con headers correctos para el SW y manifest.

### Grupo 16: Optimización Mobile CSS
- `[x]` Actualizar `frontend/app/globals.css` con tokens de diseño (beige, marrón, naranja), reglas `safe-area-inset`, `100dvh`, touch targets mínimos de 44px y scroll sin scrollbar.

## Fase 2.2: Motor de Sustitución Mobile

**Objetivo:** completar el flujo móvil desde la PWA: iniciar la compra en Carrefour, detectar un producto y su precio, consultar una sustitución válida, pedir confirmación al usuario y guardar una intención de ahorro pendiente. Esta etapa no ejecuta depósitos en Soroban; ese comportamiento queda para la Fase 2.4, una vez confirmado el pago real.

**Alcance del MVP:** Carrefour como primer comercio, catálogo de sustituciones hardcodeado y navegación iniciada desde la PWA. Si el navegador impide embeber Carrefour, se utilizará una pestaña externa con retorno manual a la PWA como fallback explícito.

### Grupo 17: Modelo de datos y contrato del motor
- `[x]` Definir tipos compartidos para el producto original, sustituto, precios, diferencial, comercio y estado de la intención (`draft`, `pending`, `discarded`).
- `[x]` Normalizar precios y nombres recibidos desde DOM, eliminando símbolos de moneda, separadores locales y texto accesorio.
- `[x]` Extraer la lógica de comparación del Route Handler actual a una función testeable, manteniendo el catálogo de Carrefour como fuente del MVP.
- `[x]` Validar entradas del endpoint (`originalName`, `originalPrice`, `merchant`) y devolver respuestas consistentes para coincidencia, ausencia y datos inválidos.

### Grupo 18: Flujo de navegación mobile
- `[x]` Crear una vista mobile de comercio dentro de la PWA con estado de preparación, análisis, resultado y error.
- `[x]` Implementar la apertura de Carrefour desde la PWA con contexto de sesión y una ruta de retorno identificable.
- `[ ]` Intentar navegación embebida únicamente cuando el entorno lo permita; mostrar el fallback a pestaña externa cuando Carrefour bloquee el embebido.
- `[x]` Añadir una acción de retorno manual que permita continuar el flujo sin perder el producto o la sesión de análisis.
- `[x]` No depender de la extensión de navegador para el flujo principal de la PWA.

### Grupo 19: Detección y consulta de sustituciones
- `[x]` Implementar el adaptador de Carrefour para extraer título y precio desde los selectores DOM conocidos.
- `[ ]` Añadir tolerancia a cambios menores del DOM y un estado visible cuando no se pueda detectar el producto.
- `[x]` Conectar el adaptador con `/api/substitution` usando `fetch`, timeout y manejo de errores de red.
- `[x]` Mostrar comparación de producto original, sustituto y ahorro en pesos, evitando sugerencias cuando el diferencial no sea positivo.
- `[x]` Mantener el motor preparado para incorporar otros comercios sin mezclarlos con los selectores específicos de Carrefour.

### Grupo 20: Confirmación e intención de ahorro
- `[x]` Crear el componente de sugerencia previa al pago con acciones claras de aceptar y descartar.
- `[x]` Guardar localmente la intención aceptada con producto original, sustituto, diferencial, comercio, timestamp y estado `pending`.
- `[x]` Permitir consultar y eliminar intenciones pendientes desde la PWA.
- `[x]` Mostrar que la aceptación prepara el ahorro, pero no ejecuta todavía una transacción blockchain.
- `[x]` Dejar el modelo compatible con la futura confirmación de pago de MercadoPago y la ejecución on-chain de la Fase 2.4.

### Grupo 21: Validación del flujo E2E
- `[x]` Añadir tests unitarios para normalización de precios, matching del catálogo y cálculo del diferencial.
- `[x]` Añadir tests del Route Handler para coincidencia, producto no encontrado, precio menor o igual y payload inválido.
- `[ ]` Validar manualmente en viewport móvil el flujo Carrefour → detección → sugerencia → aceptación → intención pendiente.
- `[ ]` Validar el fallback cuando el comercio no puede abrirse embebido y comprobar que el contexto no se pierde al volver.
- `[ ]` Definir como criterio de terminado que el flujo sea reproducible sin extensión, sin firma de wallet y sin depósito en Soroban.

## Fase 2.3: Catalogo y precios MVP

**Objetivo:** reemplazar el diccionario fijo del motor por un catalogo de productos y precios con comercio, fuente, fecha de consulta y vigencia. La plataforma debe poder comparar ofertas actuales de comercios participantes, seleccionar el sustituto mas barato y advertir cuando un precio no esta suficientemente actualizado.

**Alcance inicial:** comenzar con Carrefour y una carga administrada reproducible. Investigar primero si existe una API oficial o fuente autorizada; si no existe, mantener la carga administrada como fallback operativo y preparar adaptadores para automatizar la ingesta posteriormente. Esta etapa no incluye MercadoPago ni depositos en Soroban.

**Criterio de confianza:** ningun precio debe mostrarse como actual sin indicar su fuente y fecha de consulta. Los precios vencidos no deben generar una sugerencia automatica.

### Grupo 22: Modelo de dominio del catalogo
- `[ ]` Definir tipos para `Merchant`, `Product`, `Offer`, `PriceSource` y `PriceFreshness`.
- `[ ]` Representar producto normalizado, marca, presentacion, unidad, categoria, identificador externo y aliases de busqueda.
- `[ ]` Representar oferta con comercio, precio, moneda, URL, disponibilidad, fuente, `observedAt`, `expiresAt` y estado de vigencia.
- `[ ]` Definir estados de oferta (`active`, `stale`, `unavailable`, `invalid`) y reglas de transicion.
- `[ ]` Definir un identificador estable para evitar duplicados cuando el nombre, la presentacion o el precio cambien.

### Grupo 23: Fuentes y politica de actualizacion
- `[ ]` Investigar si Carrefour ofrece API publica, feed de productos, sitemap utilizable o mecanismo autorizado de consulta de precios.
- `[ ]` Documentar restricciones de uso, frecuencia, autenticacion, rate limits y condiciones de cada fuente.
- `[ ]` Definir la prioridad de fuentes: API oficial, feed autorizado, carga administrada y otras fuentes solo si son legales y tecnicamente sostenibles.
- `[ ]` Definir una politica de frescura por comercio y categoria, incluyendo el tiempo maximo permitido antes de marcar una oferta como `stale`.
- `[ ]` Definir como se manejan promociones, precio por unidad, precio con beneficio de membresia y stock no disponible.

### Grupo 24: Catalogo administrado reproducible
- `[ ]` Crear un archivo o formato estructurado versionado para cargar productos y ofertas iniciales de Carrefour.
- `[ ]` Añadir validacion de esquema para evitar precios negativos, monedas desconocidas, nombres vacios, fechas invalidas o duplicados.
- `[ ]` Crear un comando o proceso de importacion que informe altas, actualizaciones, duplicados y errores sin modificar datos parcialmente.
- `[ ]` Añadir metadatos de importacion: operador o fuente, timestamp, version del lote y cantidad de registros aceptados.
- `[ ]` Cargar un conjunto inicial de productos de consumo frecuente que permita probar sustituciones reales y comparables.

### Grupo 25: Persistencia y API de consulta
- `[ ]` Elegir una persistencia adecuada para el MVP, comenzando con un repositorio local o archivo estructurado y dejando una interfaz preparada para base de datos.
- `[ ]` Implementar repositorio de lectura para buscar productos por nombre, alias, marca, categoria y presentacion.
- `[ ]` Implementar consulta de ofertas vigentes por producto y comercio.
- `[ ]` Implementar consulta de comparacion entre comercios con moneda y unidad homogeneas.
- `[ ]` Devolver en cada resultado precio, comercio, fuente, fecha de consulta, vigencia, URL y advertencias de disponibilidad.
- `[ ]` Añadir endpoints internos para importar, actualizar y revisar catalogo sin exponer operaciones administrativas publicamente.

### Grupo 26: Ranking del sustituto mas barato
- `[ ]` Sustituir el diccionario hardcodeado del motor por consultas al catalogo vigente.
- `[ ]` Comparar solo productos compatibles por categoria, presentacion, unidad y reglas de sustitucion definidas.
- `[ ]` Ordenar ofertas por precio final normalizado y aplicar desempates por frescura, disponibilidad y confianza de la fuente.
- `[ ]` Excluir ofertas vencidas, invalidas o sin stock de la recomendacion automatica.
- `[ ]` Mostrar alternativas cuando no exista un sustituto confiable y explicar por que no se recomienda ninguno.
- `[ ]` Mantener la respuesta compatible con el flujo de intencion pendiente de la Fase 2.2.

### Grupo 27: Actualizacion automatizable
- `[ ]` Crear una interfaz de adaptador por comercio para poder incorporar una API o feed sin modificar el motor de sustitucion.
- `[ ]` Implementar un adaptador inicial de Carrefour con datos de prueba y contrato de salida estable.
- `[ ]` Añadir modo simulacion para ejecutar una ingesta sin publicar cambios en el catalogo activo.
- `[ ]` Añadir deteccion de cambios de precio, stock y nombre entre lotes.
- `[ ]` Registrar errores de fuente, reintentos y ultima actualizacion exitosa.
- `[ ]` Definir una estrategia de programacion periodica para cuando exista una fuente automatizada, sin activarla hasta validar sus limites.

### Grupo 28: Integracion con la PWA
- `[ ]` Actualizar la busqueda de `/shop` para consultar el catalogo en lugar de depender exclusivamente de nombres hardcodeados.
- `[ ]` Mostrar comercio, precio, fuente, fecha de consulta y nivel de frescura junto al sustituto.
- `[ ]` Añadir un estado visible para precio vencido, producto sin stock, oferta no verificable y catalogo temporalmente no disponible.
- `[ ]` Permitir abrir la URL de la oferta elegida para completar la compra en el comercio.
- `[ ]` Conservar en la intencion pendiente la oferta original, la oferta elegida y la evidencia de precio usada para calcular el ahorro.

### Grupo 29: Validacion y criterio de terminado
- `[ ]` Añadir tests de esquema para productos, ofertas, fechas, monedas, duplicados y estados de vigencia.
- `[ ]` Añadir tests de busqueda por nombre, alias, marca y presentacion.
- `[ ]` Añadir tests de ranking para seleccionar el precio mas bajo entre varios comercios.
- `[ ]` Añadir tests que excluyan ofertas vencidas, sin stock o con datos invalidos.
- `[ ]` Añadir tests de regresion del endpoint `/api/substitution` usando catalogo vigente.
- `[ ]` Validar manualmente en movil la busqueda, comparacion, apertura del comercio y guardado de la intencion.
- `[ ]` Considerar terminada la etapa cuando el motor ya no dependa del diccionario fijo, cada oferta tenga fuente y vigencia, y el resultado mas barato sea reproducible mediante tests y una carga de catalogo versionada.

