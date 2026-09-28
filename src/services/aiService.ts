import type { Product } from '@/types';

const AI_BASE_URL = (import.meta.env.VITE_AI_API_URL || '/api/ai').replace(/\/$/, '');

export interface AISearchIntent {
  textQuery: string;
  categories: string[];
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  saleOnly: boolean;
  inStockOnly: boolean;
  sort: 'default' | 'popular' | 'sold' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
  aiUnavailable?: boolean;
}

export interface AIImageAnalysis {
  name: string;
  category: string;
  colors: string[];
  style: string[];
  keywords: string[];
  description: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${AI_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Không thể kết nối AI.');
  return data as T;
}

export function aiSearchIntent(query: string, categories: { slug: string; name: string }[]) {
  return post<AISearchIntent>('/search-intent', { query, categories });
}

export function aiShoppingAssistant(message: string, products: Product[]) {
  return post<{ answer: string; aiUnavailable?: boolean }>('/assistant', {
    message,
    products: products.slice(0, 50).map((p) => ({
      id: p.id, name: p.name, category: p.category, price: p.price,
      rating: p.rating, sold: p.sold, stock: p.stock, tags: p.tags,
    })),
  });
}

export function aiAnalyzeImage(imageData: string, mimeType: string) {
  return post<{ analysis: AIImageAnalysis | null; aiUnavailable?: boolean }>('/analyze-image', { imageData, mimeType });
}
