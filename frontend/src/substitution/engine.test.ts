import { describe, expect, it } from 'vitest';
import {
  createSavingsIntention,
  findSubstitution,
  normalizeProductName,
  parsePrice,
  validateRequest,
} from './engine';

describe('substitution engine', () => {
  it('normalizes accents and punctuation in product names', () => {
    expect(normalizeProductName(' cafe Nescafe Gold 95g ')).toBe('cafe nescafe gold 95g');
  });

  it('parses Argentine formatted prices', () => {
    expect(parsePrice('$ 15.379')).toBe(15379);
    expect(parsePrice('invalid')).toBeNull();
  });

  it('finds a cheaper Dia substitution', () => {
    const result = findSubstitution({
      merchant: 'dia',
      originalName: 'Cafe Nescafe Gold 95g',
      originalPrice: 15379,
    });

    expect(result).toMatchObject({ found: true, precioSustituto: 8725, ahorro: 6654 });
  });

  it('ranks offers across merchants and returns the purchase evidence', () => {
    const result = findSubstitution({ merchant: 'dia', originalName: 'Café Nescafe Gold 95g', originalPrice: 15379 });

    expect(result).toMatchObject({
      found: true,
      sustitutoMerchant: 'dia',
      sustitutoUrl: 'https://diaonline.supermercadosdia.com.ar/cafe-tostado-liofilizado-morenita-80-gr-313616/p',
      fuente: 'Catálogo administrado',
      observadoEn: '2026-09-23',
    });
  });

  it('accepts a short coffee name from the mobile form', () => {
    expect(findSubstitution({ merchant: 'dia', originalName: 'Café', originalPrice: 15379 })).toMatchObject({
      found: true,
      ahorro: 6654,
    });
  });

  it('rejects matches without positive savings', () => {
    const result = findSubstitution({ merchant: 'dia', originalName: 'Café Nescafe Gold 95g', originalPrice: 8725 });
    expect(result).toEqual({ found: false, reason: 'no_savings' });
  });

  it('validates API input and creates a pending intention', () => {
    const request = validateRequest({ merchant: 'dia', originalName: 'Café Nescafe Gold 95g', originalPrice: '$15.379' });
    const result = findSubstitution(request);

    expect(result.found).toBe(true);
    if (result.found) {
      expect(createSavingsIntention(result)).toMatchObject({ status: 'pending', merchant: 'dia', ahorro: 6654 });
    }
  });

  it('rejects unsupported merchants and invalid prices', () => {
    expect(() => validateRequest({ merchant: 'disco', originalName: 'Café', originalPrice: 15379 })).toThrow();
    expect(() => validateRequest({ merchant: 'dia', originalName: 'Café', originalPrice: 0 })).toThrow();
  });
});