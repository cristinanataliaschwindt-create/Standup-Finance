import { NextResponse } from 'next/server';

const DICTIONARY: Record<string, { sustituto: string; precio: number }> = {
  // Ejemplos exactos para la demostración en Carrefour
  "Café Premium La Morenita 500g": {
    sustituto: "Café Pyme El Sol 500g",
    precio: 5500,
  },
  "Yerba Mate Playadito 1kg": {
    sustituto: "Yerba Mate La Especial 1kg",
    precio: 3000,
  }
};

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { originalName, originalPrice } = body;

    const match = Object.entries(DICTIONARY).find(([key]) => 
      // Búsqueda exacta o que el nombre contenga la clave (útil si el DOM trae basura)
      originalName.toLowerCase().includes(key.toLowerCase())
    );

    if (match) {
      const [key, data] = match;
      if (originalPrice > data.precio) {
        const ahorro = originalPrice - data.precio;
        return NextResponse.json({
          found: true,
          original: originalName,
          precioOriginal: originalPrice,
          sustituto: data.sustituto,
          precioSustituto: data.precio,
          ahorro: ahorro
        }, {
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    return NextResponse.json({ found: false }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { 
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}
