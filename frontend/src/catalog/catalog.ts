export const MERCHANTS = ['carrefour', 'coto', 'jumbo', 'dia'] as const;

export type Merchant = (typeof MERCHANTS)[number];

export interface CatalogOffer {
  merchant: Merchant;
  productName: string;
  price: number;
  image: string;
  url: string;
  source: string;
  observedAt: string;
}

export interface CatalogProduct {
  id: string;
  category: string;
  aliases: string[];
  original: CatalogOffer;
  alternatives: CatalogOffer[];
}

export const MERCHANT_LABELS: Record<Merchant, string> = {
  carrefour: 'Carrefour',
  coto: 'Coto',
  jumbo: 'Jumbo',
  dia: 'Día',
};

export const PRODUCT_CATALOG: CatalogProduct[] = [
  {
    id: 'cafe-95g',
    category: 'almacen',
    aliases: ['cafe', 'cafe Nescafe Gold 95g', 'cafe molido 95 g', 'cafe primera marca'],
    original: {
      merchant: 'dia',
      productName: 'Café Nescafe Gold 95g',
      price: 15379,
      image: '/products/cafe Nescafe Gold 95g.jpg',
      url: 'https://diaonline.supermercadosdia.com.ar/nescafe-gold-x-95-gr-308897/p?idsku=308897',
      source: 'Catálogo administrado',
      observedAt: '2026-09-23',
    },
    alternatives: [
      { merchant: 'carrefour', productName: 'Café instantáneo La Virginia especial clásico 170g', price: 9215, image: '/products/cafe-pyme.jpg', url: 'https://www.carrefour.com.ar/cafe-instantaneo-la-virginia-especial-clasico-170-g/p', source: 'Catálogo administrado', observedAt: '2026-09-23' },
      { merchant: 'coto', productName: 'Nescafé Dolca Suave 170g', price: 14230, image: '/products/cafe-tostado.jpg', url: 'https://www.coto.com.ar/productos/nescafe-dolca-suave-x-170gr-/_/R-00575354-00575354-200', source: 'Catálogo administrado', observedAt: '2026-09-23' },
      { merchant: 'jumbo', productName: 'Café Instantáneo Nescafé Gold Signature 95g', price: 13185, image: '/products/cafe-blend.jpg', url: 'https://www.jumbo.com.ar/cafe-signature-ar-95-grs-nescafe-gold/p', source: 'Catálogo administrado', observedAt: '2026-09-23' },
      { merchant: 'dia', productName: 'Cafe Tostado Liofilizado Morenita 80g', price: 8725, image: '/products/cafe-dia.jpg', url: 'https://diaonline.supermercadosdia.com.ar/cafe-tostado-liofilizado-morenita-80-gr-313616/p', source: 'Catálogo administrado', observedAt: '2026-09-23' },
    ],
  },
  {
    id: 'yerba-1kg',
    category: 'almacen',
    aliases: ['yerba', 'yerba mate', 'yerba mate playadito 1kg', 'yerba mate 1 kg'],
    original: {
      merchant: 'carrefour', productName: 'Yerba Mate Premium 1kg', price: 6500, image: '/products/yerba-premium.jpg', url: 'https://www.carrefour.com.ar/', source: 'Catálogo administrado', observedAt: '2026-09-23',
    },
    alternatives: [
      { merchant: 'carrefour', productName: 'Yerba Suave Carrefour 1kg', price: 4300, image: '/products/yerba-carrefour.jpg', url: 'https://www.carrefour.com.ar/', source: 'Catálogo administrado', observedAt: '2026-09-23' },
      { merchant: 'coto', productName: 'Yerba Coto Selección 1kg', price: 4100, image: '/products/yerba-coto.jpg', url: 'https://www.coto.com.ar/', source: 'Catálogo administrado', observedAt: '2026-09-23' },
      { merchant: 'dia', productName: 'Yerba Día Tradicional 1kg', price: 4200, image: '/products/yerba-dia.jpg', url: 'https://diaonline.supermercadosdia.com.ar/', source: 'Catálogo administrado', observedAt: '2026-09-23' },
    ],
  },
  {
    id: 'fideos-500g',
    category: 'almacen',
    aliases: ['fideo', 'fideos', 'pasta', 'fideos tirabuzon 500 g', 'fideos primera marca'],
    original: {
      merchant: 'carrefour', productName: 'Fideos Primera Marca 500g', price: 2300, image: '/products/fideos-premium.jpg', url: 'https://www.carrefour.com.ar/', source: 'Catálogo administrado', observedAt: '2026-09-23',
    },
    alternatives: [
      { merchant: 'carrefour', productName: 'Fideos Carrefour 500g', price: 1600, image: '/products/fideos-carrefour.jpg', url: 'https://www.carrefour.com.ar/', source: 'Catálogo administrado', observedAt: '2026-09-23' },
      { merchant: 'coto', productName: 'Fideos Coto 500g', price: 1650, image: '/products/fideos-coto.jpg', url: 'https://www.coto.com.ar/', source: 'Catálogo administrado', observedAt: '2026-09-23' },
      { merchant: 'dia', productName: 'Fideos Día 500g', price: 1500, image: '/products/fideos-dia.jpg', url: 'https://diaonline.supermercadosdia.com.ar/', source: 'Catálogo administrado', observedAt: '2026-09-23' },
    ],
  },
];
