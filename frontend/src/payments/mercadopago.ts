import { createHmac, timingSafeEqual } from 'node:crypto';

export function isMercadoPagoSignatureValid(request: Request, paymentId: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== 'production';

  const signature = request.headers.get('x-signature');
  const requestId = request.headers.get('x-request-id');
  if (!signature || !requestId) return false;

  const values = Object.fromEntries(
    signature.split(',').map((part) => {
      const [key, value] = part.trim().split('=', 2);
      return [key, value];
    }),
  );
  if (!values.ts || !values.v1) return false;

  const manifest = `id:${paymentId};request-id:${requestId};ts:${values.ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');
  const received = Buffer.from(values.v1, 'hex');
  const calculated = Buffer.from(expected, 'hex');
  return received.length === calculated.length && timingSafeEqual(received, calculated);
}

export async function resolvePaymentData(body: unknown): Promise<{ paymentId: string; intentionId: string; approved: boolean } | null> {
  if (!body || typeof body !== 'object') return null;
  const input = body as Record<string, unknown>;
  const paymentId = typeof input.data === 'object' && input.data !== null && typeof (input.data as Record<string, unknown>).id === 'string'
    ? (input.data as Record<string, string>).id
    : typeof input.id === 'string' ? input.id : null;
  let intentionId = typeof input.external_reference === 'string'
    ? input.external_reference
    : typeof input.metadata === 'object' && input.metadata !== null && typeof (input.metadata as Record<string, unknown>).intentionId === 'string'
      ? (input.metadata as Record<string, string>).intentionId
      : null;

  let approved = input.status === 'approved';
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (paymentId && (!intentionId || input.status === undefined) && accessToken) {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payment = (await response.json()) as { external_reference?: string; status?: string };
    intentionId ??= payment.external_reference ?? null;
    approved = payment.status === 'approved';
  }

  return paymentId && intentionId ? { paymentId, intentionId, approved } : null;
}