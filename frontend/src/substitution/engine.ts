import { MERCHANTS, MERCHANT_LABELS, PRODUCT_CATALOG } from '@/src/catalog/catalog';
import type { Merchant } from '@/src/catalog/catalog';

export { MERCHANTS, MERCHANT_LABELS };
export type { Merchant };
export type IntentionStatus = 'draft' | 'pending' | 'discarded';

export interface SubstitutionRequest {
  merchant: Merchant;
  originalName: string;
  originalPrice: number;
}

export interface SubstitutionMatch {
  found: true;
  merchant: Merchant;
  original: string;
  precioOriginal: number;
  sustituto: string;
  precioSustituto: number;
  ahorro: number;
  sustitutoMerchant: Merchant;
  sustitutoImagen: string;
  sustitutoUrl: string;
  fuente: string;
  observadoEn: string;
}

export interface NoSubstitutionMatch {
  found: false;
  reason: 'not_found' | 'no_savings';
}

export type SubstitutionResult = SubstitutionMatch | NoSubstitutionMatch;

export interface SavingsIntention {
  id: string;
  merchant: Merchant;
  original: string;
  precioOriginal: number;
  sustituto: string;
  precioSustituto: number;
  ahorro: number;
  status: IntentionStatus;
  createdAt: string;
  sustitutoMerchant?: Merchant;
  sustitutoImagen?: string;
  sustitutoUrl?: string;
  fuente?: string;
  observadoEn?: string;
}

export function normalizeProductName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function parsePrice(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
  }

  if (typeof value !== 'string') return null;

  const cleaned = value.replace(/[^0-9,.-]/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

export function validateRequest(input: unknown): SubstitutionRequest {
  if (!input || typeof input !== 'object') throw new Error('Payload inválido.');

  const candidate = input as Record<string, unknown>;
  const merchant = MERCHANTS.includes(candidate.merchant as Merchant) ? candidate.merchant as Merchant : null;
  const originalName = typeof candidate.originalName === 'string' ? candidate.originalName.trim() : '';
  const originalPrice = parsePrice(candidate.originalPrice);

  if (!merchant || originalName.length < 3 || originalName.length > 240 || originalPrice === null) {
    throw new Error('Se requieren comercio, nombre y precio válidos.');
  }

  return { merchant, originalName, originalPrice };
}

export function findSubstitution(request: SubstitutionRequest): SubstitutionResult {
  const normalizedName = normalizeProductName(request.originalName);
  const product = PRODUCT_CATALOG.find((item) => item.original.merchant === request.merchant && item.aliases.some((name) => normalizedName.includes(normalizeProductName(name))));

  if (!product) return { found: false, reason: 'not_found' };
  const match = [...product.alternatives].sort((a, b) => a.price - b.price)[0];
  if (!match || request.originalPrice <= match.price) return { found: false, reason: 'no_savings' };

  return {
    found: true,
    merchant: request.merchant,
    original: request.originalName,
    precioOriginal: request.originalPrice,
    sustituto: match.productName,
    precioSustituto: match.price,
    ahorro: request.originalPrice - match.price,
    sustitutoMerchant: match.merchant,
    sustitutoImagen: match.image,
    sustitutoUrl: match.url,
    fuente: match.source,
    observadoEn: match.observedAt,
  };
}

export function createSavingsIntention(result: SubstitutionMatch): SavingsIntention {
  return {
    id: `intention-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    merchant: result.merchant,
    original: result.original,
    precioOriginal: result.precioOriginal,
    sustituto: result.sustituto,
    precioSustituto: result.precioSustituto,
    ahorro: result.ahorro,
    status: 'pending',
    createdAt: new Date().toISOString(),
    sustitutoMerchant: result.sustitutoMerchant,
    sustitutoImagen: result.sustitutoImagen,
    sustitutoUrl: result.sustitutoUrl,
    fuente: result.fuente,
    observadoEn: result.observadoEn,
  };
}