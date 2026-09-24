'use client';
 
import { useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Coins,
  Home as HomeIcon,
  Landmark,
  Leaf,
  Loader2,
  MapPin,
  Moon,
  PiggyBank,
  QrCode,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Sun,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';
import { Client as AhorroClient } from '../src/contracts/ahorro/src/index';
import Link from 'next/link';
 
// Tu Contract ID generado en Testnet
const CONTRACT_ID = 'CB7WHVS6LV65H7V4LOOL7P27DUH7GNOZIZFD33Q5TOPOHCV64ZBI5KTG';
 
/* ═══════════════════════════════════════════════════════════════
   TIPOS
   ═══════════════════════════════════════════════════════════════ */
type Tab = 'home' | 'market' | 'nearby';
type Tema = 'sand' | 'night';
 
interface Oferta {
  cadena: string;
  marca: string;
  precio: number;
}
interface Producto {
  id: string;
  emoji: string;
  nombre: string;
  corto: string;
  palabras: string[];
  original: Oferta;
  sustitutos: Oferta[];
}
interface Cadena {
  id: string;
  sigla: string;
  color: string;
  sucursales: number;
}
interface Tienda {
  id: string;
  emoji: string;
  nombre: string;
  rubro: string;
  distancia: string;
  rating: number;
  abierto: boolean;
  horario: string;
  x: number; // posición en el mapa (%)
  y: number;
  pedido: string;
  precio: number;
  ahorro: number;
}
interface Movimiento {
  id: number;
  emoji: string;
  titulo: string;
  comercio: string;
  monto: number;
  fecha: string;
  estado: string;
}
interface DetalleAhorro {
  emoji: string;
  titulo: string;
  comercio: string;
}
type ComprarFn = (monto: number, detalle: DetalleAhorro) => Promise<void>;
 
/* ═══════════════════════════════════════════════════════════════
   MOCK DATA (todo simulado para la demo de visión a futuro)
   ═══════════════════════════════════════════════════════════════ */
const CADENAS: Cadena[] = [
  { id: 'Carrefour', sigla: 'C', color: '#1d4f9f', sucursales: 38 },
  { id: 'Coto', sigla: 'COTO', color: '#d62839', sucursales: 61 },
  { id: 'Jumbo', sigla: 'Jumbo', color: '#1f9d55', sucursales: 24 },
  { id: 'Día', sigla: 'Día', color: '#e11d2e', sucursales: 90 },
];
 
const PRODUCTOS: Producto[] = [
  {
    id: 'cafe',
    emoji: '☕',
    nombre: 'Café molido 500 g',
    corto: 'Café',
    palabras: ['cafe', 'molido', 'instantaneo'],
    original: { cadena: 'Carrefour', marca: 'Café Primera Marca', precio: 8000 },
    sustitutos: [
      { cadena: 'Carrefour', marca: 'Café Marca B', precio: 5500 },
      { cadena: 'Coto', marca: 'Café Tostado Local', precio: 5800 },
      { cadena: 'Jumbo', marca: 'Café Blend Sur', precio: 6200 },
      { cadena: 'Día', marca: 'Café Clásico Día', precio: 5650 },
    ],
  },
  {
    id: 'yerba',
    emoji: '🧉',
    nombre: 'Yerba mate 1 kg',
    corto: 'Yerba',
    palabras: ['yerba', 'mate'],
    original: { cadena: 'Jumbo', marca: 'Yerba Premium Tradicional', precio: 6500 },
    sustitutos: [
      { cadena: 'Carrefour', marca: 'Yerba Suave Carrefour', precio: 4300 },
      { cadena: 'Coto', marca: 'Yerba Coto Selección', precio: 4100 },
      { cadena: 'Jumbo', marca: 'Yerba Cachamai', precio: 4600 },
      { cadena: 'Día', marca: 'Yerba Día Tradicional', precio: 4200 },
    ],
  },
  {
    id: 'aceite',
    emoji: '🌻',
    nombre: 'Aceite de girasol 1,5 L',
    corto: 'Aceite',
    palabras: ['aceite', 'girasol'],
    original: { cadena: 'Coto', marca: 'Aceite Primera Marca', precio: 5200 },
    sustitutos: [
      { cadena: 'Carrefour', marca: 'Aceite Carrefour', precio: 3700 },
      { cadena: 'Coto', marca: 'Aceite Coto', precio: 3500 },
      { cadena: 'Jumbo', marca: 'Aceite Cocinero Sur', precio: 3900 },
      { cadena: 'Día', marca: 'Aceite Día', precio: 3600 },
    ],
  },
  {
    id: 'fideos',
    emoji: '🍝',
    nombre: 'Fideos tirabuzón 500 g',
    corto: 'Fideos',
    palabras: ['fideo', 'pasta', 'tirabuzon'],
    original: { cadena: 'Carrefour', marca: 'Fideos Primera Marca', precio: 2300 },
    sustitutos: [
      { cadena: 'Carrefour', marca: 'Fideos Carrefour', precio: 1600 },
      { cadena: 'Coto', marca: 'Fideos Coto', precio: 1650 },
      { cadena: 'Jumbo', marca: 'Fideos Pastalinda', precio: 1750 },
      { cadena: 'Día', marca: 'Fideos Día', precio: 1500 },
    ],
  },
  {
    id: 'leche',
    emoji: '🥛',
    nombre: 'Leche entera 1 L',
    corto: 'Leche',
    palabras: ['leche', 'lacteo'],
    original: { cadena: 'Jumbo', marca: 'Leche Primera Marca', precio: 2900 },
    sustitutos: [
      { cadena: 'Carrefour', marca: 'Leche Carrefour', precio: 2200 },
      { cadena: 'Coto', marca: 'Leche Coto', precio: 2150 },
      { cadena: 'Jumbo', marca: 'Leche Serenísima Clásica', precio: 2400 },
      { cadena: 'Día', marca: 'Leche Día', precio: 2250 },
    ],
  },
];
 
const SUGERENCIAS = ['Café molido', 'Yerba mate', 'Aceite de girasol', 'Fideos', 'Leche entera'];
 
const TIENDAS: Tienda[] = [
  {
    id: 't1',
    emoji: '🥖',
    nombre: 'Panadería La Central',
    rubro: 'Panadería',
    distancia: '300 m',
    rating: 4.8,
    abierto: true,
    horario: 'Abierto hasta las 21:00',
    x: 38,
    y: 33,
    pedido: 'Pan lactal artesanal + 6 medialunas',
    precio: 3800,
    ahorro: 1200,
  },
  {
    id: 't2',
    emoji: '🛒',
    nombre: 'Almacén Don Pepe',
    rubro: 'Almacén',
    distancia: '500 m',
    rating: 4.6,
    abierto: true,
    horario: 'Abierto hasta las 22:00',
    x: 63,
    y: 57,
    pedido: 'Yerba mate 1 kg + azúcar 1 kg',
    precio: 6900,
    ahorro: 900,
  },
  {
    id: 't3',
    emoji: '🥬',
    nombre: 'Verdulería El Fresco',
    rubro: 'Verdulería',
    distancia: '700 m',
    rating: 4.7,
    abierto: true,
    horario: 'Abierto hasta las 20:30',
    x: 22,
    y: 66,
    pedido: 'Cajón de frutas y verduras de estación',
    precio: 8200,
    ahorro: 1500,
  },
  {
    id: 't4',
    emoji: '🥩',
    nombre: 'Carnicería Los Andes',
    rubro: 'Carnicería',
    distancia: '900 m',
    rating: 4.5,
    abierto: true,
    horario: 'Abierto hasta las 20:00',
    x: 76,
    y: 30,
    pedido: 'Asado 1 kg + chorizo x4',
    precio: 14500,
    ahorro: 1800,
  },
  {
    id: 't5',
    emoji: '🌾',
    nombre: 'Dietética Sol y Grano',
    rubro: 'Dietética',
    distancia: '1,1 km',
    rating: 4.9,
    abierto: false,
    horario: 'Abre mañana a las 9:00',
    x: 50,
    y: 80,
    pedido: 'Granola casera 500 g + frutos secos',
    precio: 5600,
    ahorro: 1100,
  },
];
 
const ACTIVIDAD_INICIAL: Movimiento[] = [
  { id: 1, emoji: '☕', titulo: 'Ahorro en Café', comercio: 'Carrefour', monto: 2500, fecha: 'Hoy, 10:42', estado: 'Confirmada' },
  { id: 2, emoji: '🍝', titulo: 'Ahorro en Fideos', comercio: 'Coto', monto: 800, fecha: 'Ayer, 18:15', estado: 'Confirmada' },
  { id: 3, emoji: '🥖', titulo: 'Ahorro en Pan', comercio: 'Panadería La Central', monto: 1200, fecha: 'Ayer, 09:03', estado: 'Confirmada' },
  { id: 4, emoji: '🧉', titulo: 'Ahorro en Yerba', comercio: 'Jumbo', monto: 950, fecha: 'Lun, 12:30', estado: 'Confirmada' },
  { id: 5, emoji: '🥛', titulo: 'Ahorro en Leche', comercio: 'Día', monto: 700, fecha: 'Dom, 20:10', estado: 'Confirmada' },
];
 
// Forma de la curva de crecimiento (el último punto siempre es el saldo real de Soroban)
const CRECIMIENTO = [0.14, 0.22, 0.2, 0.41, 0.63, 1];
const MESES = ['Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];
const META_MENSUAL = 100000;
 
const NAV: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Inicio', icon: HomeIcon },
  { id: 'market', label: 'Explorar sustitutos', icon: ShoppingCart },
  { id: 'nearby', label: 'Tiendas de cercanía', icon: MapPin },
];
 
const TITULOS: Record<Tab, { titulo: string; sub: string }> = {
  home: { titulo: 'Resumen financiero', sub: 'Tu ahorro tokenizado, leído en vivo desde Soroban' },
  market: { titulo: 'Explorar sustitutos', sub: 'Compara, sustituye y ahorra sin cambiar tu rutina' },
  nearby: { titulo: 'Tiendas de cercanía', sub: 'Compra en comercios de barrio y retira con un QR' },
};
 
/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const ars = (n: number) => `$${n.toLocaleString('es-AR')}`;
const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
 
// Curva suave (Catmull-Rom → Bézier) para el gráfico
function smoothPath(p: { x: number; y: number }[]) {
  let d = `M ${p[0].x} ${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}
 
/* ═══════════════════════════════════════════════════════════════
   ESTILOS: tokens de tema (sand = referencia, night = dark) + glass
   ═══════════════════════════════════════════════════════════════ */
const ESTILOS = `
.sf-root{background:var(--bg);background-attachment:fixed;color:var(--text)}
.sf-root[data-theme='sand']{
  --bg:linear-gradient(135deg,#f3e6d4 0%,#e2c9aa 50%,#d4ab82 100%);
  --sidebar:rgba(255,255,255,.35);--surface:rgba(255,255,255,.5);--surface-strong:rgba(255,255,255,.78);
  --surface-hover:rgba(255,255,255,.66);--tile:rgba(233,212,186,.65);--border:rgba(255,255,255,.7);
  --grid:rgba(90,60,30,.16);--text:#2b1b0e;--muted:#7d6450;
  --accent:#e8801a;--accent-hover:#d2700d;--accent-soft:rgba(232,128,26,.16);
  --good:#2b7a46;--good-soft:rgba(43,122,70,.15);--bad:#b8412c;--bad-soft:rgba(184,65,44,.13);
  --input:rgba(255,255,255,.92);--shadow:0 12px 40px rgba(120,80,40,.16);
  --chart-line:#d2700d;--dot-fill:#fff8ee;--tip-fg:#fff7ec;
  --blob-a:rgba(255,255,255,.6);--blob-b:rgba(232,128,26,.28);
  --map-bg:#f1e6d6;--map-road:#fff9f0;--map-road2:#e6d5bd;--map-water:#c5d8dc;--map-park:#d3ddbb;
}
.sf-root[data-theme='night']{
  --bg:linear-gradient(140deg,#060a13 0%,#0b1220 55%,#0a1512 100%);
  --sidebar:rgba(255,255,255,.04);--surface:rgba(255,255,255,.055);--surface-strong:rgba(255,255,255,.09);
  --surface-hover:rgba(255,255,255,.11);--tile:rgba(255,255,255,.05);--border:rgba(255,255,255,.1);
  --grid:rgba(255,255,255,.09);--text:#eef2f8;--muted:#8c9ab0;
  --accent:#fb923c;--accent-hover:#f97316;--accent-soft:rgba(251,146,60,.16);
  --good:#34d399;--good-soft:rgba(52,211,153,.14);--bad:#fb7185;--bad-soft:rgba(251,113,133,.14);
  --input:rgba(255,255,255,.07);--shadow:0 12px 40px rgba(0,0,0,.45);
  --chart-line:#34d399;--dot-fill:#0b1220;--tip-fg:#07101b;
  --blob-a:rgba(52,211,153,.16);--blob-b:rgba(251,146,60,.16);
  --map-bg:#0f1726;--map-road:#243149;--map-road2:#18233a;--map-water:#0d2a3b;--map-park:#10281f;
}
.sf-glass{background:var(--surface);border:1px solid var(--border);-webkit-backdrop-filter:blur(22px) saturate(150%);backdrop-filter:blur(22px) saturate(150%);box-shadow:var(--shadow)}
.sf-glass-strong{background:var(--surface-strong);border:1px solid var(--border);-webkit-backdrop-filter:blur(22px) saturate(150%);backdrop-filter:blur(22px) saturate(150%);box-shadow:var(--shadow)}
.sf-sidebar{background:var(--sidebar);border-right:1px solid var(--border);-webkit-backdrop-filter:blur(26px);backdrop-filter:blur(26px)}
.sf-highlight{box-shadow:0 0 0 2px var(--good),var(--shadow)}
.sf-selected{box-shadow:0 0 0 2px var(--accent),var(--shadow)}
.sf-muted{color:var(--muted)}
.sf-accent{color:var(--accent)}
.sf-good{color:var(--good)}
.sf-pill-good{background:var(--good-soft);color:var(--good)}
.sf-pill-accent{background:var(--accent-soft);color:var(--accent)}
.sf-pill-bad{background:var(--bad-soft);color:var(--bad)}
.sf-tile{background:var(--tile)}
.sf-hover:hover{background:var(--surface-hover)}
.sf-nav-active{background:var(--accent-soft);color:var(--accent)}
.sf-solid{background:var(--accent);color:#fff}
.sf-btn{background:var(--accent);color:#fff;box-shadow:0 10px 28px -10px var(--accent)}
.sf-btn:hover:not(:disabled){background:var(--accent-hover);transform:translateY(-1px)}
.sf-btn:disabled{opacity:.55;cursor:not-allowed}
.sf-input{background:var(--input);color:var(--text);border:1px solid var(--border)}
.sf-input::placeholder{color:var(--muted)}
.sf-root :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.sf-blob-a{background:var(--blob-a)}
.sf-blob-b{background:var(--blob-b)}
.sf-track{background:var(--accent-soft)}
.sf-track-fill{background:linear-gradient(90deg,var(--accent),var(--good))}
.sf-grid{stroke:var(--grid)}
.sf-line{stroke:var(--chart-line)}
.sf-dot{fill:var(--dot-fill);stroke:var(--chart-line)}
.sf-axis{fill:var(--muted)}
.sf-tip{fill:var(--text)}
.sf-tip-text{fill:var(--tip-fg)}
.sf-map-bg{fill:var(--map-bg)}
.sf-map-road{stroke:var(--map-road);fill:none;stroke-linecap:round}
.sf-map-road2{stroke:var(--map-road2);fill:none}
.sf-map-water{fill:var(--map-water)}
.sf-map-park{fill:var(--map-park)}
.sf-map-label{fill:var(--muted)}
@keyframes sf-fade{from{opacity:0}to{opacity:1}}
@keyframes sf-pop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes sf-ping{0%{transform:scale(.6);opacity:.7}100%{transform:scale(2.6);opacity:0}}
.sf-fade{animation:sf-fade .35s ease both}
.sf-pop{animation:sf-pop .25s ease both}
.sf-ping{animation:sf-ping 2s ease-out infinite}
@media (prefers-reduced-motion:reduce){.sf-fade,.sf-pop,.sf-ping{animation:none}.sf-btn{transition:none}}
`;
 
/* ═══════════════════════════════════════════════════════════════
   COMPONENTES DE UI
   ═══════════════════════════════════════════════════════════════ */
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="sf-solid flex h-11 w-11 items-center justify-center rounded-2xl">
        <TrendingUp className="h-6 w-6" />
      </span>
      <span className="sf-accent font-serif text-xl font-bold leading-[1.05]">
        Standup
        <br />
        Finance
      </span>
    </div>
  );
}
 
/* ── Gráfico de crecimiento (SVG puro, sin dependencias) ── */
function AhorroChart({ total }: { total: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 230;
  const PX = 28;
  const PT = 44;
  const PB = 34;
  const base = H - PB;
 
  const pts = CRECIMIENTO.map((r, i) => ({
    x: PX + (i * (W - PX * 2)) / (CRECIMIENTO.length - 1),
    y: PT + (1 - r) * (base - PT),
    valor: Math.round(total * r),
  }));
  const linea = smoothPath(pts);
  const area = `${linea} L ${pts[pts.length - 1].x} ${base} L ${pts[0].x} ${base} Z`;
  const activo = hover ?? pts.length - 1;
  const p = pts[activo];
  const etiqueta = ars(p.valor);
  const tipW = Math.max(70, etiqueta.length * 9 + 20);
  const tipX = Math.min(Math.max(p.x - tipW / 2, 4), W - tipW - 4);
  const colW = (W - PX * 2) / (pts.length - 1);
 
  return (
    <div className="mt-6">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Evolución simulada del ahorro tokenizado"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="sf-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--chart-line)', stopOpacity: 0.35 }} />
            <stop offset="100%" style={{ stopColor: 'var(--chart-line)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
 
        {[0, 1, 2].map((i) => {
          const y = PT + (i * (base - PT)) / 2;
          return <line key={i} x1={PX} x2={W - PX} y1={y} y2={y} className="sf-grid" strokeDasharray="4 6" />;
        })}
 
        <path d={area} fill="url(#sf-area)" />
        <path d={linea} fill="none" className="sf-line" strokeWidth="3" strokeLinecap="round" />
        <line x1={p.x} x2={p.x} y1={PT - 6} y2={base} className="sf-grid" />
 
        {pts.map((q, i) => (
          <circle key={i} cx={q.x} cy={q.y} r={i === activo ? 6 : 3.5} className="sf-dot" strokeWidth="2.5" />
        ))}
        {pts.map((q, i) => (
          <text key={MESES[i]} x={q.x} y={H - 10} textAnchor="middle" fontSize="13" className="sf-axis">
            {MESES[i]}
          </text>
        ))}
 
        <rect x={tipX} y={p.y - 38} width={tipW} height="26" rx="8" className="sf-tip" />
        <text x={tipX + tipW / 2} y={p.y - 20} textAnchor="middle" fontSize="13" fontWeight="700" className="sf-tip-text">
          {etiqueta}
        </text>
 
        {pts.map((q, i) => (
          <rect
            key={`hit-${i}`}
            x={q.x - colW / 2}
            y="0"
            width={colW}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onClick={() => setHover(i)}
          />
        ))}
      </svg>
      <p className="sf-muted mt-1 text-xs">
        Curva de ejemplo escalada a tu saldo real: el último punto es lo que hoy tienes en Soroban.
      </p>
    </div>
  );
}
 
/* ── QR de demostración (determinista, no escaneable) ── */
function QrSimulado({ semilla }: { semilla: string }) {
  const N = 25;
  const celdas = useMemo(() => {
    let h = 2166136261;
    for (const c of semilla) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    const rnd = () => {
      h ^= h << 13;
      h ^= h >>> 17;
      h ^= h << 5;
      return ((h >>> 0) % 1000) / 1000;
    };
    const grid: boolean[][] = Array.from({ length: N }, () => Array.from({ length: N }, () => rnd() > 0.52));
    const finder = (ox: number, oy: number) => {
      for (let dy = -1; dy <= 7; dy++) {
        for (let dx = -1; dx <= 7; dx++) {
          const x = ox + dx;
          const y = oy + dy;
          if (x < 0 || y < 0 || x >= N || y >= N) continue;
          const dentro = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
          const borde = dx === 0 || dx === 6 || dy === 0 || dy === 6;
          const centro = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
          grid[y][x] = dentro && (borde || centro);
        }
      }
    };
    finder(0, 0);
    finder(N - 7, 0);
    finder(0, N - 7);
    const rects: { x: number; y: number }[] = [];
    grid.forEach((fila, y) => fila.forEach((v, x) => v && rects.push({ x, y })));
    return rects;
  }, [semilla]);
 
  return (
    <svg viewBox={`-2 -2 ${N + 4} ${N + 4}`} className="h-full w-full" shapeRendering="crispEdges" role="img" aria-label="Código QR de retiro (demostración)">
      <rect x="-2" y="-2" width={N + 4} height={N + 4} fill="#ffffff" />
      {celdas.map((c) => (
        <rect key={`${c.x}-${c.y}`} x={c.x} y={c.y} width="1" height="1" fill="#111111" />
      ))}
    </svg>
  );
}
 
/* ── Tarjeta de producto (original / sustituto) ── */
function TarjetaProducto({
  tipo,
  emoji,
  nombre,
  marca,
  cadena,
  precio,
  descuento,
}: {
  tipo: 'original' | 'sustituto';
  emoji: string;
  nombre: string;
  marca: string;
  cadena: string;
  precio: number;
  descuento?: number;
}) {
  const esSustituto = tipo === 'sustituto';
  return (
    <div
      className={`sf-glass-strong rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 ${
        esSustituto ? 'sf-highlight' : ''
      }`}
    >
      <div className="sf-tile flex h-32 items-center justify-center rounded-2xl text-6xl">{emoji}</div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${esSustituto ? 'sf-pill-good' : 'sf-pill-bad'}`}
        >
          {esSustituto ? 'Sustituto encontrado' : 'Producto habitual'}
        </span>
        {descuento !== undefined && descuento > 0 && (
          <span className="sf-pill-good rounded-full px-2.5 py-1 text-xs font-bold">-{descuento}%</span>
        )}
      </div>
      <h3 className="mt-3 text-lg font-bold leading-tight">{marca}</h3>
      <p className="sf-muted text-sm">{nombre}</p>
      <p className="sf-muted mt-2 flex items-center gap-1.5 text-xs">
        <Store className="h-3.5 w-3.5" />
        {cadena}
      </p>
      <p className={`mt-3 text-3xl font-extrabold ${esSustituto ? 'sf-good' : ''}`}>
        {ars(precio)} <span className="sf-muted text-sm font-semibold">ARS</span>
      </p>
    </div>
  );
}
 
/* ═══════════════════════════════════════════════════════════════
   VISTA 1: HOME / DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
function HomeView({
  ahorroTotal,
  walletAddress,
  movimientos,
  onConectar,
  onIrMercado,
}: {
  ahorroTotal: number;
  walletAddress: string;
  movimientos: Movimiento[];
  onConectar: () => void;
  onIrMercado: () => void;
}) {
  const rendimientoMensual = Math.round((ahorroTotal * 0.125) / 12);
  const totalSustituciones = movimientos.reduce((acc, m) => acc + m.monto, 0);
  const progreso = Math.min(100, (ahorroTotal / META_MENSUAL) * 100);
 
  const kpis = [
    { icon: ShoppingCart, label: 'Sustituciones realizadas', valor: String(movimientos.length) },
    { icon: PiggyBank, label: 'Ahorrado en sustituciones', valor: `${ars(totalSustituciones)} ARS` },
    { icon: Coins, label: 'Rendimiento mensual estimado', valor: `+${ars(rendimientoMensual)} ARS` },
  ];
 
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Saldo + gráfico */}
        <section className="sf-glass rounded-3xl p-6 md:p-8 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="sf-muted text-sm font-medium">Ahorro capitalizado en Soroban</p>
              <p className="mt-2 text-5xl font-extrabold tracking-tight md:text-6xl">
                ${ahorroTotal.toLocaleString('es-AR')}{' '}
                <span className="sf-muted text-2xl font-semibold">ARS</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="sf-pill-good flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +12,5% APY en Soroban
                </span>
                <span className="sf-pill-accent rounded-full px-3 py-1 text-xs font-semibold">
                  Renta pasiva en USDC
                </span>
              </div>
            </div>
            {!walletAddress && (
              <button
                onClick={onConectar}
                className="sf-btn flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300"
              >
                <Wallet className="h-4 w-4" />
                Conectar Freighter
              </button>
            )}
          </div>
          <AhorroChart total={ahorroTotal} />
        </section>
 
        {/* Columna derecha */}
        <div className="space-y-6">
          <section className="sf-glass rounded-3xl p-6">
            <div className="flex items-center gap-3">
              <span className="sf-pill-good flex h-11 w-11 items-center justify-center rounded-2xl">
                <Leaf className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-bold">Impacto del mes</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              Has evitado gastar un <strong>30% más</strong> este mes. Tu capital está generando rendimiento{' '}
              <em>on-chain</em>.
            </p>
            <button
              onClick={onIrMercado}
              className="sf-btn mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300"
            >
              <Sparkles className="h-4 w-4" />
              Buscar un sustituto
            </button>
            <Link
              href="/shop"
              className="sf-glass-strong mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
            >
              <ShoppingCart className="h-4 w-4" />
              Analizar compra en Carrefour
            </Link>
          </section>
 
          <section className="sf-glass rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Bóveda de inversión</h2>
              <Landmark className="sf-muted h-5 w-5" />
            </div>
            <p className="sf-muted mt-1 text-sm">Meta del mes: {ars(META_MENSUAL)} ARS</p>
            <div className="sf-track mt-4 h-3 overflow-hidden rounded-full">
              <div className="sf-track-fill h-full rounded-full transition-all duration-700" style={{ width: `${progreso}%` }} />
            </div>
            <p className="mt-2 text-sm font-semibold">{Math.round(progreso)}% completado</p>
          </section>
        </div>
      </div>
 
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="sf-glass flex items-center gap-4 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-0.5">
            <span className="sf-pill-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <k.icon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <p className="sf-muted text-xs">{k.label}</p>
              <p className="truncate text-lg font-bold">{k.valor}</p>
            </div>
          </div>
        ))}
      </div>
 
      {/* Historial */}
      <section className="sf-glass rounded-3xl p-6">
        <h2 className="text-lg font-bold">Historial de actividad</h2>
        <ul className="mt-4 space-y-3">
          {movimientos.map((m) => (
            <li
              key={m.id}
              className="sf-tile flex items-center gap-4 rounded-2xl p-3 transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="sf-glass-strong flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl">
                {m.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {m.titulo} en {m.comercio}
                </p>
                <p className="sf-muted text-xs">{m.fecha}</p>
              </div>
              <div className="text-right">
                <p className="sf-good font-bold">+{ars(m.monto)} ARS</p>
                <p className="sf-good flex items-center justify-end gap-1 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {m.estado}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
 
/* ═══════════════════════════════════════════════════════════════
   VISTA 2: EXPLORAR / MARKET (flujo de sustitución)
   ═══════════════════════════════════════════════════════════════ */
function MarketView({
  walletAddress,
  cargando,
  onConectar,
  onComprar,
}: {
  walletAddress: string;
  cargando: boolean;
  onConectar: () => void;
  onComprar: ComprarFn;
}) {
  const [busqueda, setBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<Producto | null>(null);
  const [sinResultados, setSinResultados] = useState(false);
  const [cadenaSel, setCadenaSel] = useState<string>('todas');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
 
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
 
  const buscar = (texto: string) => {
    const q = norm(texto);
    if (!q) return;
    if (timer.current) clearTimeout(timer.current);
    setBuscando(true);
    setSinResultados(false);
    setResultado(null);
    // Simula la consulta a las cadenas asociadas
    timer.current = setTimeout(() => {
      const encontrado = PRODUCTOS.find((p) =>
        p.palabras.some((w) => q.includes(w) || (q.length >= 3 && w.startsWith(q))),
      );
      setResultado(encontrado ?? null);
      setSinResultados(!encontrado);
      setBuscando(false);
    }, 900);
  };
 
  const mejor = useMemo(() => {
    if (!resultado) return null;
    const pool =
      cadenaSel === 'todas' ? resultado.sustitutos : resultado.sustitutos.filter((s) => s.cadena === cadenaSel);
    return [...pool].sort((a, b) => a.precio - b.precio)[0] ?? null;
  }, [resultado, cadenaSel]);
 
  const ahorro = resultado && mejor ? resultado.original.precio - mejor.precio : 0;
  const descuento = resultado && mejor ? Math.round((ahorro / resultado.original.precio) * 100) : 0;
 
  return (
    <div className="space-y-6">
      {/* Buscador */}
      <section className="sf-glass rounded-3xl p-6 md:p-8">
        <h2 className="text-2xl font-bold md:text-3xl">¿Qué producto buscas hoy?</h2>
        <p className="sf-muted mt-1 text-sm">
          Comparamos precios en las cadenas asociadas y te mostramos el sustituto más barato.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="sf-muted pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') buscar(busqueda);
              }}
              placeholder='Ej. "Café molido"'
              aria-label="Buscar producto"
              className="sf-input w-full rounded-2xl py-4 pl-12 pr-4 text-base transition-all duration-300"
            />
          </div>
          <button
            onClick={() => buscar(busqueda)}
            disabled={buscando || !busqueda.trim()}
            className="sf-btn flex items-center justify-center gap-2 rounded-2xl px-7 py-4 font-semibold transition-all duration-300"
          >
            <Sparkles className="h-5 w-5" />
            Comparar
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setBusqueda(s);
                buscar(s);
              }}
              className="sf-glass-strong sf-hover rounded-full px-4 py-1.5 text-sm transition-all duration-300"
            >
              {s}
            </button>
          ))}
        </div>
      </section>
 
      {/* Cadenas asociadas */}
      <section>
        <h3 className="mb-3 text-sm font-semibold">Cadenas asociadas</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setCadenaSel('todas')}
            aria-pressed={cadenaSel === 'todas'}
            className={`flex items-center rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
              cadenaSel === 'todas' ? 'sf-glass-strong sf-selected' : 'sf-glass sf-hover'
            }`}
          >
            Todas
          </button>
          {CADENAS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCadenaSel(c.id)}
              aria-pressed={cadenaSel === c.id}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-left transition-all duration-300 ${
                cadenaSel === c.id ? 'sf-glass-strong sf-selected' : 'sf-glass sf-hover'
              }`}
            >
              <span
                className="flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-xs font-extrabold text-white"
                style={{ background: c.color }}
              >
                {c.sigla}
              </span>
              <span>
                <span className="block text-sm font-semibold">{c.id}</span>
                <span className="sf-muted block text-xs">{c.sucursales} sucursales</span>
              </span>
            </button>
          ))}
        </div>
      </section>
 
      {/* Resultados */}
      <section aria-live="polite">
        {buscando && (
          <div className="sf-glass flex flex-col items-center gap-3 rounded-3xl p-10 text-center">
            <Loader2 className="sf-accent h-8 w-8 animate-spin" />
            <p className="font-semibold">Comparando precios en {CADENAS.length} cadenas asociadas...</p>
          </div>
        )}
 
        {!buscando && sinResultados && (
          <div className="sf-glass rounded-3xl p-8 text-center">
            <p className="font-semibold">No encontramos “{busqueda}” en las cadenas asociadas.</p>
            <p className="sf-muted mt-1 text-sm">Prueba con café, yerba, aceite, fideos o leche.</p>
          </div>
        )}
 
        {!buscando && !resultado && !sinResultados && (
          <div className="sf-glass rounded-3xl p-8 text-center">
            <Sparkles className="sf-accent mx-auto h-8 w-8" />
            <p className="mt-3 font-semibold">Busca un producto para ver su sustituto</p>
            <p className="sf-muted mt-1 text-sm">Escribe arriba o elige una de las sugerencias.</p>
          </div>
        )}
 
        {!buscando && resultado && mejor && (
          <div className="sf-fade space-y-5">
            <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
              <TarjetaProducto
                tipo="original"
                emoji={resultado.emoji}
                nombre={resultado.nombre}
                marca={resultado.original.marca}
                cadena={resultado.original.cadena}
                precio={resultado.original.precio}
              />
              <div className="flex items-center justify-center">
                <span className="sf-solid flex h-12 w-12 rotate-90 items-center justify-center rounded-full md:rotate-0">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
              <TarjetaProducto
                tipo="sustituto"
                emoji={resultado.emoji}
                nombre={resultado.nombre}
                marca={mejor.marca}
                cadena={mejor.cadena}
                precio={mejor.precio}
                descuento={descuento}
              />
            </div>
 
            <div className="sf-glass-strong sf-highlight flex flex-col items-start justify-between gap-5 rounded-3xl p-6 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <span className="sf-pill-good flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
                  <PiggyBank className="h-7 w-7" />
                </span>
                <div>
                  <p className="sf-good text-3xl font-extrabold">
                    {ars(ahorro)} <span className="text-base">ARS</span>
                  </p>
                  <p className="text-sm font-medium">directo a tu bóveda de inversión</p>
                  <p className="sf-muted text-xs">Se registra en Soroban y empieza a rendir 12,5% APY.</p>
                </div>
              </div>
              <button
                onClick={() =>
                  walletAddress
                    ? onComprar(ahorro, {
                        emoji: resultado.emoji,
                        titulo: `Ahorro en ${resultado.corto}`,
                        comercio: mejor.cadena,
                      })
                    : onConectar()
                }
                disabled={cargando}
                className="sf-btn flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-bold transition-all duration-300 md:w-auto"
              >
                {cargando ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Procesando en Soroban...
                  </>
                ) : walletAddress ? (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Comprar sustituto y ahorrar
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5" />
                    Conecta Freighter para ahorrar
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
 
/* ═══════════════════════════════════════════════════════════════
   VISTA 3: TIENDAS DE CERCANÍA (Click & Collect)
   ═══════════════════════════════════════════════════════════════ */
const CALLES_H = [60, 140, 220, 300, 380, 450];
const CALLES_V = [90, 190, 290, 390, 490, 590, 690];
 
function NearbyView() {
  const [selId, setSelId] = useState<string>(TIENDAS[0].id);
  const [qr, setQr] = useState<{ tienda: Tienda; codigo: string } | null>(null);
  const sel = TIENDAS.find((t) => t.id === selId) ?? TIENDAS[0];
 
  const generarQr = () => {
    const codigo = `SF-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setQr({ tienda: sel, codigo });
  };
 
  useEffect(() => {
    if (!qr) return;
    const cerrar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQr(null);
    };
    window.addEventListener('keydown', cerrar);
    return () => window.removeEventListener('keydown', cerrar);
  }, [qr]);
 
  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <div className="space-y-6 xl:col-span-3">
        {/* Mapa simulado */}
        <section className="sf-glass rounded-3xl p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <h2 className="text-lg font-bold">Comercios de barrio cerca de ti</h2>
            <span className="sf-pill-accent rounded-full px-3 py-1 text-xs font-semibold">Click &amp; Collect</span>
          </div>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
            <svg viewBox="0 0 800 500" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <rect width="800" height="500" className="sf-map-bg" />
              {CALLES_H.map((y) => (
                <line key={`h${y}`} x1="0" x2="800" y1={y} y2={y} className="sf-map-road2" strokeWidth="6" />
              ))}
              {CALLES_V.map((x) => (
                <line key={`v${x}`} x1={x} x2={x} y1="0" y2="500" className="sf-map-road2" strokeWidth="6" />
              ))}
              <line x1="0" x2="800" y1="250" y2="250" className="sf-map-road" strokeWidth="14" />
              <line x1="340" x2="340" y1="0" y2="500" className="sf-map-road" strokeWidth="14" />
              <line x1="0" y1="480" x2="560" y2="0" className="sf-map-road" strokeWidth="12" />
              <rect x="110" y="320" width="120" height="80" rx="12" className="sf-map-park" />
              <rect x="400" y="90" width="90" height="70" rx="12" className="sf-map-park" />
              <rect x="560" y="340" width="110" height="70" rx="12" className="sf-map-park" />
              <path
                d="M 560 0 L 800 0 L 800 260 C 740 230, 690 150, 640 100 C 610 70, 580 40, 560 0 Z"
                className="sf-map-water"
              />
              <text x="715" y="90" textAnchor="middle" fontSize="14" fontStyle="italic" className="sf-map-label">
                Río de la Plata
              </text>
            </svg>
 
            {/* Tu ubicación */}
            <div className="absolute" style={{ left: '50%', top: '50%' }}>
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <span className="sf-ping absolute -inset-2 rounded-full" style={{ background: '#3b82f6' }} />
                <span className="relative block h-4 w-4 rounded-full border-2 border-white" style={{ background: '#3b82f6' }} />
              </div>
            </div>
 
            {/* Pines */}
            {TIENDAS.map((t) => {
              const activo = t.id === selId;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelId(t.id)}
                  aria-label={`${t.nombre}, ${ars(t.precio)}`}
                  aria-pressed={activo}
                  className={`absolute flex -translate-x-1/2 -translate-y-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-300 ${
                    activo ? 'sf-solid z-20 scale-110' : 'sf-glass-strong z-10 hover:scale-105'
                  } ${t.abierto ? '' : 'opacity-70'}`}
                  style={{ left: `${t.x}%`, top: `${t.y}%` }}
                >
                  <span>{t.emoji}</span>
                  <span>{ars(t.precio)}</span>
                </button>
              );
            })}
          </div>
        </section>
 
        {/* Detalle del comercio */}
        <section className="sf-glass space-y-4 rounded-3xl p-5">
          <div className="flex items-start gap-4">
            <div className="sf-tile flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl">
              {sel.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold">{sel.nombre}</h3>
              <p className="sf-muted text-sm">
                {sel.rubro}, a {sel.distancia}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <span className="flex items-center gap-1">
                  <Star className="sf-accent h-3.5 w-3.5" />
                  {sel.rating}
                </span>
                <span className="sf-muted flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {sel.horario}
                </span>
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                sel.abierto ? 'sf-pill-good' : 'sf-pill-bad'
              }`}
            >
              {sel.abierto ? 'Abierto' : 'Cerrado'}
            </span>
          </div>
 
          <div className="sf-tile flex items-center justify-between gap-4 rounded-2xl p-4">
            <div className="min-w-0">
              <p className="sf-muted text-xs">Pedido sugerido</p>
              <p className="font-semibold">{sel.pedido}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xl font-extrabold">{ars(sel.precio)}</p>
              <p className="sf-good text-xs font-semibold">Ahorras {ars(sel.ahorro)}</p>
            </div>
          </div>
 
          <button
            onClick={generarQr}
            disabled={!sel.abierto}
            className="sf-btn flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 font-bold transition-all duration-300"
          >
            <QrCode className="h-5 w-5" />
            Generar QR de Retiro
          </button>
          {!sel.abierto && (
            <p className="sf-muted text-center text-xs">Cerrado por ahora: el retiro se habilita cuando abra.</p>
          )}
        </section>
      </div>
 
      {/* Lista de comercios */}
      <section className="sf-glass h-fit space-y-2 rounded-3xl p-3 xl:col-span-2">
        <h2 className="px-3 pb-1 pt-2 text-lg font-bold">Comercios cercanos</h2>
        {TIENDAS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelId(t.id)}
            aria-pressed={t.id === selId}
            className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-300 ${
              t.id === selId ? 'sf-glass-strong sf-selected' : 'sf-hover'
            }`}
          >
            <span className="sf-tile flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl">
              {t.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{t.nombre}</span>
              <span className="sf-muted block text-xs">
                {t.rubro}, {t.distancia}
              </span>
            </span>
            <span className="shrink-0 text-right">
              <span className="sf-good block text-sm font-bold">-{ars(t.ahorro)}</span>
              <span className="sf-muted flex items-center justify-end gap-1 text-xs">
                <Star className="h-3 w-3" />
                {t.rating}
              </span>
            </span>
          </button>
        ))}
      </section>
 
      {/* Modal QR */}
      {qr && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="QR de retiro"
        >
          <button
            aria-label="Cerrar"
            onClick={() => setQr(null)}
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
          />
          <div className="sf-glass-strong sf-pop relative w-full max-w-sm rounded-3xl p-6 text-center">
            <button
              aria-label="Cerrar"
              onClick={() => setQr(null)}
              className="sf-muted sf-hover absolute right-4 top-4 rounded-full p-1.5 transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold">Tu QR de retiro</h3>
            <p className="sf-muted text-sm">{qr.tienda.nombre}</p>
            <div className="mx-auto my-5 h-52 w-52 rounded-2xl bg-white p-3 shadow-lg">
              <QrSimulado semilla={qr.codigo} />
            </div>
            <p className="font-mono text-lg font-bold tracking-widest">{qr.codigo}</p>
            <p className="sf-muted mt-1 text-xs">Muéstralo en el mostrador. Válido por 15 minutos.</p>
            <div className="sf-tile mt-4 space-y-1 rounded-2xl p-3 text-left text-sm">
              <p className="font-semibold">{qr.tienda.pedido}</p>
              <p className="flex justify-between">
                <span className="sf-muted">Total a pagar en el local</span>
                <span className="font-bold">{ars(qr.tienda.precio)}</span>
              </p>
              <p className="flex justify-between">
                <span className="sf-muted">Se tokeniza en tu bóveda</span>
                <span className="sf-good font-bold">+{ars(qr.tienda.ahorro)}</span>
              </p>
            </div>
            <p className="sf-muted mt-3 text-xs">QR de demostración: en producción se firma con tu billetera.</p>
            <button
              onClick={() => setQr(null)}
              className="sf-btn mt-4 w-full rounded-2xl px-6 py-3 font-bold transition-all duration-300"
            >
              Listo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
 
/* ═══════════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
   ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  // ── Estados reales de Soroban (NO TOCAR) ──
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [ahorroTotal, setAhorroTotal] = useState<number>(0);
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<string>('');
 
  // ── Estados de la UI de la demo ──
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [tema, setTema] = useState<Tema>('sand');
  const [movimientos, setMovimientos] = useState<Movimiento[]>(ACTIVIDAD_INICIAL);
 
  // El mensaje de estado se oculta solo (salvo mientras hay una transacción en curso)
  useEffect(() => {
    if (!mensaje || cargando) return;
    const t = setTimeout(() => setMensaje(''), 6000);
    return () => clearTimeout(t);
  }, [mensaje, cargando]);
 
  /* ═══════════ LÓGICA SOROBAN ═══════════ */
 
  // Leer el saldo guardado en la blockchain
  const actualizarSaldoActual = async (publicKey: string) => {
    try {
      const client = new AhorroClient({
        networkPassphrase: 'Test SDF Network ; September 2015',
        contractId: CONTRACT_ID,
        rpcUrl: 'https://soroban-testnet.stellar.org',
        publicKey,
      });
      const tx = await client.consultar_saldo({ usuario: publicKey });
      setAhorroTotal(Number(tx.result));
    } catch (error) {
      console.error('Error al consultar saldo:', error);
      setMensaje('No se pudo consultar el saldo en Soroban.');
    }
  };
 
  // 1. Conectar con la billetera Freighter
  const conectarBilletera = async () => {
    try {
      const connected = await isConnected();
      if (!connected) {
        alert('Por favor instala la extensión de Freighter Wallet en tu navegador.');
        return;
      }
 
      // Solución: Usamos requestAccess() en lugar de getPublicKey()
      const accessRes = await requestAccess();
 
      // Manejo flexible para distintas versiones de Freighter API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const publicKey = typeof accessRes === 'string' ? accessRes : (accessRes as any)?.address;
 
      if (publicKey) {
        setWalletAddress(publicKey);
        setMensaje('Billetera conectada con éxito');
        await actualizarSaldoActual(publicKey);
      } else {
        setMensaje('No se pudo autorizar la billetera');
      }
    } catch (error) {
      console.error('Error al conectar Freighter:', error);
      setMensaje('Error al conectar billetera');
    }
  };
 
  // 2. Registrar el ahorro en el contrato de Soroban
  //    (misma lógica de antes; ahora el monto llega desde el producto comparado y, si no se
  //    pasa nada, usa los $1.500 originales)
  const comprarSustituto = async (
    montoAhorro: number = 1500,
    detalle: DetalleAhorro = { emoji: '☕', titulo: 'Ahorro en Café', comercio: 'Carrefour' },
  ) => {
    if (!walletAddress) {
      alert('Primero debes conectar tu billetera Freighter');
      return;
    }
 
    setCargando(true);
    setMensaje('Generando transacción para Soroban...');
 
    try {
      const client = new AhorroClient({
        networkPassphrase: 'Test SDF Network ; September 2015',
        contractId: CONTRACT_ID,
        rpcUrl: 'https://soroban-testnet.stellar.org',
        publicKey: walletAddress,
      });
 
      // Invocar función del contrato en Rust
      const tx = await client.registrar_ahorro({
        usuario: walletAddress,
        monto: BigInt(Math.round(montoAhorro)),
      });
 
      setMensaje('Por favor, confirma la firma en Freighter...');
 
      await tx.signAndSend({
        signTransaction: async (xdr: string) => {
          const signedTx = await signTransaction(xdr, {
            networkPassphrase: 'Test SDF Network ; September 2015',
          });
          return signedTx;
        },
      });
 
      setMensaje('¡Transacción confirmada en la Testnet de Stellar!');
      // Solo UI: suma la operación al historial de la demo
      setMovimientos((prev) => [
        { id: Date.now(), ...detalle, monto: Math.round(montoAhorro), fecha: 'Ahora', estado: 'Confirmada' },
        ...prev,
      ]);
      await actualizarSaldoActual(walletAddress);
    } catch (error) {
      console.error('Error al procesar ahorro:', error);
      setMensaje('Error al firmar o ejecutar en la blockchain.');
    } finally {
      setCargando(false);
    }
  };
 
  /* ═══════════ FIN LÓGICA SOROBAN ═══════════ */
 
  const walletCorta = walletAddress ? `${walletAddress.slice(0, 5)}...${walletAddress.slice(-5)}` : '';
  const esError = /error|no se pudo/i.test(mensaje);
  const { titulo, sub } = TITULOS[activeTab];
 
  return (
    <div className="sf-root relative min-h-screen" data-theme={tema}>
      <style>{ESTILOS}</style>
 
      {/* Fondo decorativo para que el glass tenga profundidad */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="sf-blob-a absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full blur-3xl" />
        <div className="sf-blob-b absolute -right-24 bottom-0 h-[26rem] w-[26rem] rounded-full blur-3xl" />
      </div>
 
      <div className="relative z-10 flex min-h-screen">
        {/* ── Sidebar (desktop) ── */}
        <aside className="sf-sidebar sticky top-0 hidden h-screen w-72 shrink-0 flex-col justify-between p-5 lg:flex">
          <div className="space-y-8">
            <div className="px-2 pt-2">
              <Logo />
            </div>
            <nav className="space-y-1.5" aria-label="Navegación principal">
              {NAV.map((item) => {
                const activo = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    aria-current={activo ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                      activo ? 'sf-nav-active' : 'sf-muted sf-hover'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
              <div
                aria-disabled="true"
                className="sf-muted flex w-full cursor-not-allowed items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium opacity-60"
              >
                <Landmark className="h-5 w-5" />
                Bóveda DeFi
                <span className="sf-pill-accent ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold">
                  Pronto
                </span>
              </div>
            </nav>
          </div>
 
          <div className="space-y-3">
            <p className="sf-pill-accent w-fit rounded-full px-3 py-1 text-xs font-semibold">Testnet de Stellar</p>
            <button
              onClick={conectarBilletera}
              className="sf-glass-strong flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-300 hover:scale-[1.02]"
            >
              <span className="sf-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Wallet className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <span className={`h-2 w-2 rounded-full ${walletAddress ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  Freighter
                </span>
                <span className="sf-muted block truncate font-mono text-xs">
                  {walletAddress ? walletCorta : 'Conectar billetera'}
                </span>
              </span>
            </button>
          </div>
        </aside>
 
        {/* ── Contenido principal ── */}
        <main className="min-w-0 flex-1 px-4 pb-28 pt-6 md:px-8 lg:pb-10 lg:pt-8">
          <div className="mx-auto max-w-6xl space-y-6">
            <header className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 lg:hidden">
                  <Logo />
                </div>
                <h1 className="text-2xl font-bold md:text-3xl">{titulo}</h1>
                <p className="sf-muted mt-1 text-sm">{sub}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setTema(tema === 'sand' ? 'night' : 'sand')}
                  aria-label={tema === 'sand' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
                  className="sf-glass-strong flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  {tema === 'sand' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>
                <button
                  onClick={conectarBilletera}
                  className="sf-glass-strong flex h-11 items-center gap-2 rounded-2xl px-3 text-xs font-semibold transition-all duration-300 hover:scale-105 lg:hidden"
                >
                  <Wallet className="sf-accent h-4 w-4" />
                  <span className="font-mono">{walletAddress ? walletCorta : 'Conectar'}</span>
                </button>
              </div>
            </header>
 
            <div key={activeTab} className="sf-fade">
              {activeTab === 'home' && (
                <HomeView
                  ahorroTotal={ahorroTotal}
                  walletAddress={walletAddress}
                  movimientos={movimientos}
                  onConectar={conectarBilletera}
                  onIrMercado={() => setActiveTab('market')}
                />
              )}
              {activeTab === 'market' && (
                <MarketView
                  walletAddress={walletAddress}
                  cargando={cargando}
                  onConectar={conectarBilletera}
                  onComprar={comprarSustituto}
                />
              )}
              {activeTab === 'nearby' && <NearbyView />}
            </div>
          </div>
        </main>
      </div>
 
      {/* ── Navegación inferior (mobile) ── */}
      <nav
        className="sf-glass-strong fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-3xl p-2 lg:hidden"
        aria-label="Navegación principal"
      >
        {NAV.map((item) => {
          const activo = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={activo ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-all duration-300 ${
                activo ? 'sf-nav-active' : 'sf-muted'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label.split(' ')[0]}
            </button>
          );
        })}
      </nav>
 
      {/* ── Mensajes de estado de la transacción ── */}
      {mensaje && (
        <div
          role="status"
          className="sf-glass-strong sf-pop fixed right-4 top-4 z-[60] flex max-w-sm items-start gap-3 rounded-2xl px-4 py-3"
        >
          {cargando ? (
            <Loader2 className="sf-accent mt-0.5 h-4 w-4 shrink-0 animate-spin" />
          ) : esError ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
          ) : (
            <CheckCircle2 className="sf-good mt-0.5 h-4 w-4 shrink-0" />
          )}
          <p className="font-mono text-xs leading-relaxed">{mensaje}</p>
          <button onClick={() => setMensaje('')} aria-label="Cerrar mensaje" className="sf-muted shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}