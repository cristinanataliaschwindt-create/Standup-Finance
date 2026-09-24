import { describe, expect, it } from 'vitest';
import { POST } from './route';

describe('POST /api/substitution', () => {
  it('returns a substitution for a supported Carrefour product', async () => {
    const response = await POST(
      new Request('http://localhost/api/substitution', {
        method: 'POST',
        body: JSON.stringify({ merchant: 'carrefour', originalName: 'Café Premium La Morenita 500g', originalPrice: 8000 }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ found: true, ahorro: 2500 });
  });

  it('returns a validation error for an invalid payload', async () => {
    const response = await POST(
      new Request('http://localhost/api/substitution', {
        method: 'POST',
        body: JSON.stringify({ merchant: 'carrefour', originalName: '', originalPrice: 0 }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: expect.any(String) });
  });
});