import type { SavingsIntention } from '@/src/substitution/engine';

export type PaymentStatus = 'pending' | 'paid' | 'authorized' | 'rejected';

export interface PaymentIntent extends SavingsIntention {
  paymentStatus: PaymentStatus;
  paymentId?: string;
  paidAt?: string;
  authorizedAt?: string;
}

const intents = new Map<string, PaymentIntent>();

export function registerPaymentIntent(intention: SavingsIntention): PaymentIntent {
  const paymentIntent: PaymentIntent = { ...intention, paymentStatus: 'pending' };
  intents.set(intention.id, paymentIntent);
  return paymentIntent;
}

export function getPaymentIntent(id: string): PaymentIntent | null {
  return intents.get(id) ?? null;
}

export function markPaymentPaid(id: string, paymentId: string): PaymentIntent | null {
  const intention = intents.get(id);
  if (!intention || intention.paymentStatus === 'authorized') return intention ?? null;

  const updated: PaymentIntent = {
    ...intention,
    paymentStatus: 'paid',
    paymentId,
    paidAt: new Date().toISOString(),
  };
  intents.set(id, updated);
  return updated;
}

export function markPaymentAuthorized(id: string): PaymentIntent | null {
  const intention = intents.get(id);
  if (!intention || intention.paymentStatus !== 'paid') return intention ?? null;

  const updated: PaymentIntent = {
    ...intention,
    paymentStatus: 'authorized',
    status: 'pending',
    authorizedAt: new Date().toISOString(),
  };
  intents.set(id, updated);
  return updated;
}

export function clearPaymentIntents(): void {
  intents.clear();
}