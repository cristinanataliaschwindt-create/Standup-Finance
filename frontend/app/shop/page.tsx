'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Loader2,
  ScanSearch,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { MERCHANT_LABELS, MERCHANTS } from '@/src/substitution/engine';
import type { Merchant, SavingsIntention, SubstitutionMatch } from '@/src/substitution/engine';
import { createSavingsIntention } from '@/src/substitution/engine';

const INTENTIONS_KEY = 'standup:savings-intentions';
const MERCHANT_URLS: Record<Merchant, string> = {
  carrefour: 'https://www.carrefour.com.ar/',
  coto: 'https://www.coto.com.ar/',
  jumbo: 'https://www.jumbo.com.ar/',
  dia: 'https://diaonline.supermercadosdia.com.ar/',
};

type ViewState = 'ready' | 'analyzing' | 'suggestion' | 'saved' | 'error';

export default function ShopPage() {
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [originalMerchant, setOriginalMerchant] = useState<Merchant>('carrefour');
  const [result, setResult] = useState<SubstitutionMatch | null>(null);
  const [intentions, setIntentions] = useState<SavingsIntention[]>(() => {
    if (typeof window === 'undefined') return [];

    try {
      const stored = window.localStorage.getItem(INTENTIONS_KEY);
      return stored ? (JSON.parse(stored) as SavingsIntention[]) : [];
    } catch {
      return [];
    }
  });
  const [viewState, setViewState] = useState<ViewState>('ready');
  const [message, setMessage] = useState('');

  const analyzeProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setViewState('analyzing');
    setMessage('');

    try {
      const response = await fetch('/api/substitution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant: originalMerchant,
          originalName: productName,
          originalPrice: productPrice,
        }),
      });
      const data = (await response.json()) as SubstitutionMatch | { found: false; reason: string } | { error: string };

      if (!response.ok || 'error' in data) throw new Error('No pudimos analizar ese producto. Revisa nombre y precio.');
      if (!data.found) {
        setResult(null);
        setViewState('error');
        setMessage(data.reason === 'no_savings' ? 'No encontramos un ahorro positivo para este precio.' : 'Todavía no tenemos un sustituto para ese producto.');
        return;
      }

      setResult(data);
      setViewState('suggestion');
    } catch (error) {
      setViewState('error');
      setMessage(error instanceof Error ? error.message : 'No pudimos conectar con el motor.');
    }
  };

  const acceptSuggestion = () => {
    if (!result) return;
    const intention = createSavingsIntention(result);
    const nextIntentions = [intention, ...intentions];
    setIntentions(nextIntentions);
    window.localStorage.setItem(INTENTIONS_KEY, JSON.stringify(nextIntentions));
    void fetch('/api/payments/intentions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(intention),
    });
    setViewState('saved');
  };

  const discardSuggestion = () => {
    setResult(null);
    setViewState('ready');
    setMessage('Sugerencia descartada.');
  };

  const removeIntention = (id: string) => {
    const nextIntentions = intentions.filter((intention) => intention.id !== id);
    setIntentions(nextIntentions);
    window.localStorage.setItem(INTENTIONS_KEY, JSON.stringify(nextIntentions));
  };

  return (
    <main className="min-h-screen bg-[#EDE8DF] px-4 py-5 text-[#3D1F0A] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B4513]">
            <ArrowLeft className="h-4 w-4" />
            Panel principal
          </Link>
          <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#8B4513]">Catálogo multi-comercio · MVP</span>
        </header>

        <section className="overflow-hidden rounded-[2rem] bg-[#3D1F0A] p-6 text-[#FFF8ED] shadow-xl sm:p-9">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#F2B17F]">Compra inteligente</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Encontrá una alternativa antes de pagar.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#F5DCC7] sm:text-base">
              Abrí Carrefour, traé el producto que estás mirando y confirmá una sugerencia de menor precio. La aceptación queda pendiente hasta que exista un pago real.
            </p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-3xl border border-[#D2B48C] bg-[#F7F1E8] p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#C1622F] text-white">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold">1. Abrí el comercio</h2>
                <p className="mt-1 text-sm leading-5 text-[#76563F]">Elegí una oferta, abrí el comercio en otra pestaña y volvé para confirmar tu ahorro.</p>
              </div>
            </div>
            <a
              href={MERCHANT_URLS[originalMerchant]}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#C1622F] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#A94F25]"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir comercio
            </a>
            <p className="mt-3 text-center text-xs text-[#76563F]">Volvé a esta pantalla para analizar el producto.</p>
          </div>

          <form onSubmit={analyzeProduct} className="rounded-3xl border border-[#D2B48C] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E7F0E5] text-[#39733F]">
                <ScanSearch className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold">2. Analizá el producto</h2>
                <p className="mt-1 text-sm text-[#76563F]">Ingresá el producto y precio que encontraste.</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block text-sm font-semibold">
                Comercio donde lo viste
                <select
                  value={originalMerchant}
                  onChange={(event) => setOriginalMerchant(event.target.value as Merchant)}
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[#D2B48C] bg-[#FFFDF9] px-4 text-sm outline-none focus:border-[#C1622F] focus:ring-2 focus:ring-[#C1622F]/20"
                >
                  {MERCHANTS.map((merchant) => <option key={merchant} value={merchant}>{MERCHANT_LABELS[merchant]}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Nombre del producto
                <input
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  placeholder="Ej. Café Premium La Morenita 500g"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[#D2B48C] bg-[#FFFDF9] px-4 text-sm outline-none transition focus:border-[#C1622F] focus:ring-2 focus:ring-[#C1622F]/20"
                  required
                />
              </label>
              <label className="block text-sm font-semibold">
                Precio actual en ARS
                <input
                  value={productPrice}
                  onChange={(event) => setProductPrice(event.target.value)}
                  placeholder="Ej. 8000"
                  inputMode="decimal"
                  className="mt-2 min-h-12 w-full rounded-2xl border border-[#D2B48C] bg-[#FFFDF9] px-4 text-sm outline-none transition focus:border-[#C1622F] focus:ring-2 focus:ring-[#C1622F]/20"
                  required
                />
              </label>
              <button type="submit" disabled={viewState === 'analyzing'} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#3D1F0A] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#5B3016] disabled:opacity-60">
                {viewState === 'analyzing' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
                {viewState === 'analyzing' ? 'Analizando...' : 'Buscar sustituto'}
              </button>
            </div>
          </form>
        </section>

        {(viewState === 'suggestion' || viewState === 'saved' || viewState === 'error') && (
          <section aria-live="polite" className="rounded-3xl border border-[#D2B48C] bg-white p-5 shadow-sm sm:p-7">
            {viewState === 'error' && (
              <div className="flex items-start gap-3 text-[#8B4513]">
                <X className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <h2 className="font-bold">No hay una sugerencia disponible</h2>
                  <p className="mt-1 text-sm text-[#76563F]">{message}</p>
                </div>
              </div>
            )}
            {viewState === 'suggestion' && result && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#39733F]">Sugerencia encontrada</p>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <PriceCard label="Estás mirando" name={result.original} price={result.precioOriginal} />
                  <span className="mx-auto text-xl text-[#C1622F]">→</span>
                  <PriceCard label={`Alternativa en ${MERCHANT_LABELS[result.sustitutoMerchant]}`} name={result.sustituto} price={result.precioSustituto} image={result.sustitutoImagen} highlighted />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[#76563F]">
                  <span>Fuente: {result.fuente} · Actualizado {result.observadoEn}</span>
                  <a href={result.sustitutoUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-[#C1622F] underline">Ir a comprar</a>
                </div>
                <div className="mt-5 flex flex-col gap-4 rounded-2xl bg-[#E7F0E5] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-[#315B35]">Podrías ahorrar <strong className="text-xl">{formatArs(result.ahorro)} ARS</strong></p>
                  <div className="flex gap-2">
                    <button type="button" onClick={discardSuggestion} className="flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-[#76563F] hover:bg-white">
                      <X className="h-4 w-4" />
                      Descartar
                    </button>
                    <button type="button" onClick={acceptSuggestion} className="flex min-h-11 items-center gap-2 rounded-xl bg-[#39733F] px-4 text-sm font-bold text-white hover:bg-[#2D5B32]">
                      <Check className="h-4 w-4" />
                      Guardar intención
                    </button>
                  </div>
                </div>
              </div>
            )}
            {viewState === 'saved' && (
              <div className="flex items-start gap-3 text-[#315B35]">
                <Check className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <h2 className="font-bold">Intención guardada</h2>
                  <p className="mt-1 text-sm">Queda pendiente de confirmación de pago. Todavía no se firmó ninguna transacción.</p>
                </div>
              </div>
            )}
          </section>
        )}

        <section className="rounded-3xl border border-[#D2B48C] bg-[#F7F1E8] p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">Intenciones pendientes</h2>
              <p className="mt-1 text-sm text-[#76563F]">Se guardan solo en este dispositivo hasta integrar el evento de pago.</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold">{intentions.length}</span>
          </div>
          <div className="mt-5 space-y-3">
            {intentions.length === 0 && <p className="rounded-2xl bg-white p-4 text-sm text-[#76563F]">Todavía no guardaste ninguna sugerencia.</p>}
            {intentions.map((intention) => (
              <div key={intention.id} className="flex items-center gap-3 rounded-2xl bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{intention.original}</p>
                  <p className="mt-1 text-xs text-[#76563F]">→ {intention.sustituto} · Ahorro {formatArs(intention.ahorro)} ARS</p>
                </div>
                <button type="button" onClick={() => removeIntention(intention.id)} aria-label={`Eliminar intención de ${intention.original}`} className="flex h-11 w-11 items-center justify-center rounded-xl text-[#8B4513] hover:bg-[#F7F1E8]">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function PriceCard({ label, name, price, image, highlighted = false }: { label: string; name: string; price: number; image?: string; highlighted?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlighted ? 'border-[#9BC39D] bg-[#F1F8EF]' : 'border-[#E6D9C8] bg-[#FFFDF9]'}`}>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#76563F]">{label}</p>
      {image && <img src={image} alt="" className="mt-3 h-28 w-full rounded-xl object-contain bg-white" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
      <p className="mt-2 line-clamp-2 min-h-10 text-sm font-semibold">{name}</p>
      <p className="mt-3 text-2xl font-extrabold">{formatArs(price)} <span className="text-sm font-semibold text-[#76563F]">ARS</span></p>
    </div>
  );
}

function formatArs(value: number): string {
  return value.toLocaleString('es-AR');
}