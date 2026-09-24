import { parsePrice } from './engine';

export interface DetectedCarrefourProduct {
  name: string;
  price: number;
}

const NAME_SELECTORS = [
  '[data-testid="product-name"]',
  '[data-testid="product-title"]',
  '[class*="product-name"]',
  'h1',
];

const PRICE_SELECTORS = [
  '[data-testid="product-price"]',
  '[class*="product-price"]',
  '[class*="price"]',
];

export function extractCarrefourProduct(root: ParentNode): DetectedCarrefourProduct | null {
  const name = findText(root, NAME_SELECTORS);
  const priceText = findText(root, PRICE_SELECTORS);
  const price = parsePrice(priceText);

  return name && price ? { name, price } : null;
}

function findText(root: ParentNode, selectors: string[]): string | null {
  for (const selector of selectors) {
    const element = root.querySelector(selector);
    const text = element?.textContent?.replace(/\s+/g, ' ').trim();
    if (text) return text;
  }

  return null;
}