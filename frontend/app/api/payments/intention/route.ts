import { NextResponse } from 'next/server';
import { getPaymentIntent } from '@/src/payments/store';
import { markPaymentAuthorized } from '@/src/payments/store';

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta id.' }, { status: 400 });

  const intention = getPaymentIntent(id);
  return intention
    ? NextResponse.json(intention)
    : NextResponse.json({ error: 'Intención no encontrada.' }, { status: 404 });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: 'Falta id.' }, { status: 400 });

  const intention = markPaymentAuthorized(body.id);
  return intention
    ? NextResponse.json(intention)
    : NextResponse.json({ error: 'La intención no está paga o no existe.' }, { status: 409 });
}