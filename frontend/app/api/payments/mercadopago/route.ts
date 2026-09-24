import { NextResponse } from 'next/server';
import { isMercadoPagoSignatureValid, resolvePaymentData } from '@/src/payments/mercadopago';
import { markPaymentPaid } from '@/src/payments/store';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const data = await resolvePaymentData(body);
  if (!data || !data.approved || !isMercadoPagoSignatureValid(request, data.paymentId)) {
    return NextResponse.json({ error: 'Webhook inválido.' }, { status: 401 });
  }

  const updated = markPaymentPaid(data.intentionId, data.paymentId);
  if (!updated) return NextResponse.json({ error: 'Intención no encontrada.' }, { status: 404 });
  return NextResponse.json({ received: true, intentionId: updated.id });
}