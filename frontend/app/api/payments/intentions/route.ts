import { NextResponse } from 'next/server';
import { registerPaymentIntent } from '@/src/payments/store';
import type { SavingsIntention } from '@/src/substitution/engine';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SavingsIntention;
    if (!body.id || body.status !== 'pending' || body.ahorro <= 0) {
      return NextResponse.json({ error: 'Intención inválida.' }, { status: 400 });
    }
    return NextResponse.json(registerPaymentIntent(body), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 });
  }
}