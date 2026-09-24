'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, Wallet } from 'lucide-react';
// Asumimos que Freighter API y el cliente de Soroban están disponibles como en page.tsx
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';
// import { Client as AhorroClient } from '../../src/contracts/ahorro/src/index';

export default function InvestPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F5F5DC] text-[#8B4513]">Cargando inversión...</div>}>
      <InvestContent />
    </Suspense>
  );
}

function InvestContent() {
  const searchParams = useSearchParams();
  const amountParam = searchParams.get('amount');
  const itemParam = searchParams.get('item');
  
  const amount = amountParam ? parseInt(amountParam, 10) : 0;
  
  const [status, setStatus] = useState<'connecting' | 'signing' | 'success' | 'error'>('connecting');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function processInvestment() {
      try {
        if (amount <= 0) {
          throw new Error("Monto inválido para invertir.");
        }

        // 1. Conectar a Freighter
        setStatus('connecting');
        const connected = await isConnected();
        if (!connected) {
          throw new Error("Freighter no está instalado o conectado.");
        }
        
        const access = await requestAccess();
        if (access.error) {
          throw new Error("Acceso a Freighter denegado.");
        }

        // 2. Firma en Soroban
        setStatus('signing');
        
        // Aquí iría la lógica real de invocar al cliente de Soroban
        // Ej: await AhorroClient.registrar_ahorro({ usuario: access.address, monto: amount });
        
        // Simulación de delay de red/blockchain
        await new Promise(resolve => setTimeout(resolve, 2500));

        // 3. Éxito y redirección
        setStatus('success');
        
        // Cerrar pestaña luego de 3 segundos para volver al e-commerce
        setTimeout(() => {
          window.close();
        }, 3000);

      } catch (err: any) {
        console.error(err);
        setStatus('error');
        setErrorMsg(err.message || 'Error procesando la transacción.');
      }
    }

    processInvestment();
  }, [amount]);

  return (
    <div className="min-h-screen bg-[#F5F5DC] text-[#8B4513] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border-2 border-[#D2B48C]">
        
        <h1 className="text-2xl font-bold text-[#FF8C00] mb-6">Standup Finance</h1>
        
        {status === 'connecting' && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#FF8C00] animate-spin" />
            <p className="text-lg font-medium">Conectando con Freighter Wallet...</p>
          </div>
        )}

        {status === 'signing' && (
          <div className="flex flex-col items-center space-y-4">
            <Wallet className="w-12 h-12 text-[#FF8C00] animate-bounce" />
            <p className="text-lg font-medium">Por favor, firma la transacción en Freighter.</p>
            <p className="text-sm opacity-80">Invirtiendo ${amount} ARS ahorrados en {itemParam}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <h2 className="text-xl font-bold text-green-600">¡Inversión Exitosa!</h2>
            <p className="text-lg">Tus ${amount} ARS ya están rindiendo en tu bóveda.</p>
            <p className="text-sm opacity-60 mt-4">Esta pestaña se cerrará automáticamente para que continúes tu compra...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-2xl font-bold">X</div>
            <h2 className="text-xl font-bold text-red-600">Ocurrió un problema</h2>
            <p className="text-md">{errorMsg}</p>
            <button 
              onClick={() => window.close()}
              className="mt-4 px-6 py-2 bg-[#8B4513] text-white rounded-lg hover:bg-opacity-90"
            >
              Volver a la tienda
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
