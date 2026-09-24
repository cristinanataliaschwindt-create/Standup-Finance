# Roadmap

## Objetivo del producto

Standup Finance ayuda al usuario a proteger su poder adquisitivo convirtiendo ahorros cotidianos en microinversiones verificables sobre Stellar:

1. El usuario busca un producto dentro de la PWA.
2. La plataforma compara precios actuales de supermercados y comercios participantes.
3. Muestra el sustituto más barato y el diferencial de ahorro.
4. El usuario compra el sustituto en el comercio elegido.
5. MercadoPago confirma el pago mediante webhook.
6. La plataforma informa el ahorro y solicita una autorizacion puntual para invertirlo.
7. El ahorro autorizado se deposita en una boveda o fondo definido sobre Stellar/Soroban.
8. El usuario consulta su saldo, rendimiento y puede retirar sus fondos desde la plataforma.

### Principios y restricciones

- La experiencia principal es **Mobile-First** mediante una PWA.
- El producto mantiene un modelo no-custodial: Standup Finance no debe controlar las claves del usuario.
- La confirmacion de una sustitucion no mueve fondos; el pago debe verificarse antes de habilitar el ahorro.
- La integracion inicial de pagos sera MercadoPago, con autorizacion de Freighter unicamente cuando exista un pago confirmado.
- No se promete inversion automatica sin consentimiento previo, firma valida o un mecanismo de autorizacion delegada explicito.
- La extension de navegador queda como prototipo tecnico, no como canal principal.

## Fase 1: Core MVP (Completada)

- **1.1 Smart Contract Foundation:** Contrato no-custodial en Soroban con almacenamiento persistente por usuario.
- **1.2 Basic Web App & Wallet:** Frontend Next.js/TypeScript con integracion de Freighter para autenticacion y firma.
- **1.3 Browser Extension Prototype:** Prueba tecnica del motor sobre e-commerce. Descartada como canal final en favor de la PWA.
- **1.4 Substitution Engine:** API inicial para comparar productos y calcular diferenciales.
- **1.5 E2E Flow Integration:** Flujo inicial de sustitucion y registro on-chain usado para validar el concepto.

## Fase 2: Flujo verificable de ahorro mobile (En ejecucion)

- **2.1 PWA Mobile-First:** Aplicacion responsive, manifest, Service Worker y experiencia usable en iOS/Android.
- **2.2 Motor de Sustitucion Mobile:** Busqueda de productos, catalogo inicial de Carrefour, comparacion de precios, sugerencia, intencion pendiente y fallback manual cuando el navegador no puede leer el DOM de un comercio externo.
- **2.3 Catalogo y precios MVP:** Crear el modelo de productos, comercios, precios, vigencia y fuente; comenzar con carga administrada y diseñar actualizacion mediante APIs o scraping autorizado. No mostrar precios vencidos sin advertencia.
- **2.4 MercadoPago y confirmacion de compra:** Crear la preferencia o checkout, asociar cada compra a una intencion mediante `external_reference`, recibir webhooks, validar firma, consultar el pago en la API y aceptar unicamente estados `approved`.
- **2.5 Autorizacion no-custodial del ahorro:** Notificar el ahorro despues del pago confirmado y solicitar una unica firma puntual en Freighter para ejecutar el registro en Soroban. La intencion debe ser idempotente y trazable.

## Fase 3: Boveda, retiro y transparencia financiera (Critica antes de escalar)

- **3.1 Contrato de ahorro completo:** Revisar limites, overflow, autorizacion, eventos, estados e idempotencia del contrato; separar saldo registrado, saldo invertido y saldo retirable.
- **3.2 Retiro no-custodial:** Implementar `retirar` con autenticacion del usuario, validacion de saldo, proteccion contra doble retiro y una interfaz para solicitar y seguir el estado del retiro.
- **3.3 Fondo o estrategia Stellar:** Seleccionar y documentar el activo, protocolo, red, riesgos, liquidez, APY no garantizado y condiciones de entrada y salida.
- **3.4 Dashboard financiero:** Mostrar saldo, ahorros pendientes, inversiones confirmadas, rendimiento, transacciones, fuente de datos y opciones de retiro.
- **3.5 Seguridad y cumplimiento:** Gestionar secretos fuera del repositorio, validar webhooks, aplicar rate limits, registrar auditoria y documentar riesgos, consentimiento y tratamiento de datos.

## Fase 4: Rendimiento y escala (Posterior al flujo financiero completo)

- **4.1 DeFi / Generacion de Rendimientos:** Conectar la boveda a protocolos de liquidez de Stellar despues de resolver deposito, retiro, liquidez y divulgacion de riesgos.
- **4.2 Mas medios de pago:** Expandir MercadoPago hacia otras billeteras y, sujeto a viabilidad legal y tecnica, Open Banking regulado por BCRA.
- **4.3 Red de Pymes Asociadas:** Incorporar comercios y productos locales como fuentes de sustitutos, con acuerdos, precios verificables y trazabilidad.
- **4.4 Automatizacion avanzada:** Evaluar wallet embebida, passkeys o autorizacion delegada para reducir la firma puntual sin abandonar el modelo de seguridad elegido.
