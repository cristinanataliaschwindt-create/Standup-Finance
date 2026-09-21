'use client';

import { useState } from 'react';
import { isConnected, requestAccess, signTransaction } from '@stellar/freighter-api';
import { Client as AhorroClient } from '../src/contracts/ahorro/src/index';

// Tu Contract ID generado en Testnet
const CONTRACT_ID = 'CB7WHVS6LV65H7V4LOOL7P27DUH7GNOZIZFD33Q5TOPOHCV64ZBI5KTG';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [ahorroTotal, setAhorroTotal] = useState<number>(0);
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<string>('');

  const actualizarSaldoActual = async (publicKey: string) => {
    try {
      const client = new AhorroClient({
        networkPassphrase: 'Test SDF Network ; September 2015',
        contractId: CONTRACT_ID,
        rpcUrl: 'https://soroban-testnet.stellar.org',
        publicKey,
      });
      const tx = await client.consultar_saldo({ usuario: publicKey });
      setAhorroTotal(Number(tx.result));
    } catch (error) {
      console.error('Error al consultar saldo:', error);
      setMensaje('No se pudo consultar el saldo en Soroban.');
    }
  };

  // 1. Conectar con la billetera Freighter
 const conectarBilletera = async () => {
  try {
    const connected = await isConnected();
    if (!connected) {
      alert('Por favor instala la extensión de Freighter Wallet en tu navegador.');
      return;
    }

    // Solución: Usamos requestAccess() en lugar de getPublicKey()
    const accessRes = await requestAccess();
    
    // Manejo flexible para distintas versiones de Freighter API
    const publicKey = typeof accessRes === 'string' ? accessRes : (accessRes as any)?.address;

    if (publicKey) {
      setWalletAddress(publicKey);
      setMensaje('Billetera conectada con éxito');
      await actualizarSaldoActual(publicKey);
    } else {
      setMensaje('No se pudo autorizar la billetera');
    }
  } catch (error) {
    console.error('Error al conectar Freighter:', error);
    setMensaje('Error al conectar billetera');
  }
};
  // Leer el saldo guardado en la blockchain
const comprarSustituto = async () => {
  if (!walletAddress) {
    alert('Primero debes conectar tu billetera Freighter');
    return;
  }

  setCargando(true);
  setMensaje('Generando transacción para Soroban...');

  try {
    const client = new AhorroClient({
      networkPassphrase: 'Test SDF Network ; September 2015',
      contractId: CONTRACT_ID,
      rpcUrl: 'https://soroban-testnet.stellar.org',
      publicKey: walletAddress,
    });

    // Invocar función del contrato en Rust
    const tx = await client.registrar_ahorro({
      usuario: walletAddress,
      monto: BigInt(1500),
    });

    setMensaje('Por favor, confirma la firma en Freighter...');

    await tx.signAndSend({
      signTransaction: async (xdr: string) => {
        const signedTx = await signTransaction(xdr, {
          networkPassphrase: 'Test SDF Network ; September 2015',
        });
        return signedTx;
      },
    });

    setMensaje('¡Transacción confirmada en la Testnet de Stellar!');
    await actualizarSaldoActual(walletAddress);
  } catch (error) {
    console.error('Error al procesar ahorro:', error);
    setMensaje('Error al firmar o ejecutar en la blockchain.');
  } finally {
    setCargando(false);
  }
};

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header con botón de Wallet */}
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">Sustitutos 🚀</h1>
            <p className="text-slate-400 text-sm">
              Comparador de precios con micro-inversión automatizada
            </p>
          </div>
          <button
            onClick={conectarBilletera}
            className="bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 font-mono py-2 px-4 rounded-lg border border-emerald-500/30 transition-all"
          >
            {walletAddress
              ? `${walletAddress.slice(0, 5)}...${walletAddress.slice(-5)}`
              : 'Conectar Freighter'}
          </button>
        </header>

        {/* Métrica principal de Ahorro acumulado */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-2">
          <span className="text-slate-400 text-sm uppercase tracking-wider">
            Ahorro Capitalizado en Soroban
          </span>
          <div className="text-5xl font-extrabold text-emerald-400">
            ${ahorroTotal.toLocaleString('es-AR')} ARS
          </div>
          <p className="text-xs text-slate-500">
            Resguardado On-Chain / Renta Pasiva en USDC
          </p>
        </section>

        {/* Producto Comparado */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Producto buscado: Café Molido 500g</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-800 p-4 rounded-lg bg-slate-950/50">
              <span className="text-xs text-rose-400 font-bold">OPCIÓN HABITUAL</span>
              <p className="text-lg font-bold mt-1">$8.500 ARS</p>
              <p className="text-xs text-slate-500">Supermercado A</p>
            </div>

            <div className="border-2 border-emerald-500/50 p-4 rounded-lg bg-emerald-950/10">
              <span className="text-xs text-emerald-400 font-bold">SUSTITUTO ENCONTRADO</span>
              <p className="text-lg font-bold mt-1">$7.000 ARS</p>
              <p className="text-xs text-slate-500">Supermercado B (Ahorras $1.500)</p>
            </div>
          </div>

          <button
            onClick={comprarSustituto}
            disabled={cargando || !walletAddress}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-lg transition-all disabled:opacity-50"
          >
            {cargando
              ? 'Procesando en Soroban...'
              : walletAddress
              ? 'Comprar Sustituto y Tokenizar $1.500 Ahorrados'
              : 'Conecta Freighter para Invertir'}
          </button>

          {mensaje && (
            <p className="text-center text-xs text-emerald-400 font-mono mt-2">
              {mensaje}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
