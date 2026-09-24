'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, Wallet } from 'lucide-react';
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';
import { Client as AhorroClient } from '@/src/contracts/ahorro/src/index';
import type { PaymentIntent } from '@/src/payments/store';

const CONTRACT_ID = 'CB7WHVS6LV65H7V4LOOL7P27DUH7GNOZIZFD33Q5TOPOHCV64ZBI5KTG';
const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

type ScreenState = 'loading' | 'waiting' | 'signing' | 'success' | 'error';

export default function AuthorizePage() {
  const [intention, setIntention] = useState<PaymentIntent | null>(null);
  const [state, setState] = useState<ScreenState>('loading');
  const [message, setMessage] = useState('Buscando el pago confirmado...');
  const id = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('intention');
  const screenState = id ? state : 'error';
  const screenMessage = id ? message : 'Falta la intención de ahorro.';

  useEffect(() => {
    if (!id) return;

    fetch(`/api/payments/intention?id=${encodeURIComponent(id)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('No encontramos esa intención de ahorro.');
        return response.json() as Promise<PaymentIntent>;
      })
      .then((paymentIntent) => {
        setIntention(paymentIntent);
        setState(paymentIntent.paymentStatus === 'paid' ? 'waiting' : 'error');
        setMessage(paymentIntent.paymentStatus === 'paid' ? 'Tu pago fue confirmado. Ahora autoriza el ahorro.' : 'Todavía no recibimos la confirmación de MercadoPago.');
      })
      .catch((error: unknown) => {
        setState('error');
        setMessage(error instanceof Error ? error.message : 'No pudimos consultar el pago.');
      });
  }, [id]);

  const authorize = async () => {
    if (!intention) return;
    try {
      if (!(await isConnected())) throw new Error('Instala o abre una wallet compatible con Freighter para autorizar este ahorro.');
      const access = await requestAccess();
      const walletAddress = typeof access === 'string' ? access : access.address;
      if (!walletAddress) throw new Error('No se autorizó el acceso a la wallet.');

      setState('signing');
      setMessage('Confirma la firma en Freighter.');
      const client = new AhorroClient({
        networkPassphrase: NETWORK_PASSPHRASE,
        contractId: CONTRACT_ID,
        rpcUrl: 'https://soroban-testnet.stellar.org',
        publicKey: walletAddress,
      });
      const transaction = await client.registrar_ahorro({ usuario: walletAddress, monto: BigInt(Math.round(intention.ahorro)) });
      await transaction.signAndSend({
        signTransaction: (xdr: string) => signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE }),
      });
      await fetch('/api/payments/intention', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: intention.id }),
      });
      setState('success');
      setMessage('El ahorro fue autorizado y enviado a Soroban.');
    } catch (error: unknown) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'No pudimos autorizar el ahorro.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EDE8DF] px-4 py-8 text-[#3D1F0A]">
      <section className="w-full max-w-md rounded-3xl border border-[#D2B48C] bg-white p-6 text-center shadow-xl sm:p-8">
        {screenState === 'success' ? <CheckCircle2 className="mx-auto h-16 w-16 text-[#39733F]" /> : <Wallet className="mx-auto h-14 w-14 text-[#C1622F]" />}
        <h1 className="mt-5 text-2xl font-bold">Autorizar ahorro</h1>
        <p className="mt-3 text-sm leading-6 text-[#76563F]">{screenMessage}</p>
        {intention && <p className="mt-5 rounded-2xl bg-[#E7F0E5] p-4 text-sm font-semibold text-[#315B35]">Ahorro a autorizar: {intention.ahorro.toLocaleString('es-AR')} ARS</p>}
        {screenState === 'waiting' && <button type="button" onClick={authorize} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#3D1F0A] px-4 py-3 font-bold text-white hover:bg-[#5B3016]"><Wallet className="h-4 w-4" />Autorizar con Freighter</button>}
        {screenState === 'signing' && <Loader2 className="mx-auto mt-6 h-7 w-7 animate-spin text-[#C1622F]" />}
        {(screenState === 'error' || screenState === 'success') && <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-2xl bg-[#C1622F] px-5 py-3 text-sm font-bold text-white">Volver al inicio</Link>}
      </section>
    </main>
  );
}