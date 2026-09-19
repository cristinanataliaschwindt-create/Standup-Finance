'use client';

import { useState } from 'react';

export default function Home() {
  const [ahorroTotal, setAhorroTotal] = useState<number>(0);
  const [cargando, setCargando] = useState<boolean>(false);

  // Simulación de compra del producto sustituto
  const comprarSustituto = async () => {
    setCargando(true);
    try {
      // 1. Simulación: El scraper detectó que la Opción B ahorra $1.500
      const diferenciaAhorro = 1500;

      // 2. Aquí conectamos la llamada a la blockchain
      // (Por ahora simulamos la actualización en pantalla mientras vinculamos la wallet)
      setTimeout(() => {
        setAhorroTotal((prev) => prev + diferenciaAhorro);
        setCargando(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold text-emerald-400">Sustitutos 🚀</h1>
          <p className="text-slate-400 text-sm">
            Comparador de precios con micro-inversión automatizada en Stellar
          </p>
        </header>

        {/* Métrica principal de Ahorro */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-2">
          <span className="text-slate-400 text-sm uppercase tracking-wider">Ahorro Capitalizado en Soroban</span>
          <div className="text-5xl font-extrabold text-emerald-400">
            ${ahorroTotal.toLocaleString('es-AR')} ARS
          </div>
          <p className="text-xs text-slate-500">Convertido automáticamente a USDC / Renta Pasiva</p>
        </section>

        {/* Producto Comparado (Scraping Mock) */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Producto buscado: Café Molido 500g</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-800 p-4 rounded-lg bg-slate-950/50">
              <span className="text-xs text-rose-400 font-bold">OPCIÓN HABITUAL</span>
              <p className="text-lg font-bold mt-1">$8.500 ARS</p>
              <p className="text-xs text-slate-500">Supermercado A</p>
            </div>

            <div className="border-2 border-emerald-500/50 p-4 rounded-lg bg-emerald-950/10 relative">
              <span className="text-xs text-emerald-400 font-bold">SUSTITUTO ENCONTRADO</span>
              <p className="text-lg font-bold mt-1">$7.000 ARS</p>
              <p className="text-xs text-slate-500">Supermercado B (Ahorras $1.500)</p>
            </div>
          </div>

          <button
            onClick={comprarSustituto}
            disabled={cargando}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-lg transition-all disabled:opacity-50"
          >
            {cargando ? 'Ejecutando contrato en Soroban...' : 'Comprar Sustituto y Tokenizar $1.500 Ahorrados'}
          </button>
        </section>
      </div>
    </main>
  );
}