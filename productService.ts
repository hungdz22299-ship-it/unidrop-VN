import type { Product } from '@/types';
import { loadJSON, saveJSON } from '@/lib/storage';
const PRODUCTS_KEY = 'products';
const INITIALIZED = 'products_initialized';
const DATA_VERSION = 'products_data_version';
const CURRENT_DATA_VERSION = 'empty-catalog-v1';

export type ProductSort = 'default' | 'popular' | 'sold' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
export interface ProductFilters { categories?: string[]; minPrice?: number; maxPrice?: number; minRating?: number; saleOnly?: boolean; inStockOnly?: boolean; }

export function getProducts(): Product[] { return loadJSON<Product[]>(PRODUCTS_KEY, []); }
export function saveProducts(items: Product[]): void { saveJSON(PRODUCTS_KEY, items); }

export function ensureProductsInitialized(): void {
  const version = loadJSON<string>(DATA_VERSION, '');

  // UniDrop hiện không còn sản phẩm mẫu. Khi nâng cấp từ phiên bản cũ,
  // xóa catalog mẫu một lần rồi giữ nguyên các sản phẩm người dùng tự thêm.
  if (version !== CURRENT_DATA_VERSION) {
    saveProducts([]);
    saveJSON(INITIALIZED, true);
    saveJSON(DATA_VERSION, CURRENT_DATA_VERSION);
    return;
  }

  if (!loadJSON<boolean>(INITIALIZED, false)) {
    saveProducts([]);
    saveJSON(INITIALIZED, true);
  }

  saveJSON(DATA_VERSION, CURRENT_DATA_VERSION);
}

export function getProductById(id: string): Product | undefined { return getProducts().find((p) => p.id === id); }
export function getProductBySlug(slug: string): Product | undefined { return getProducts().find((p) => p.slug === slug || p.id === slug); }
export function getProductsByCategory(categorySlug: string): Product[] { return getProducts().filter((p) => p.category === categorySlug); }

export function normalizeText(value: string): string {
  return value.toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

export function searchProducts(query: string): Product[] {
  const raw = query.trim();
  const q = normalizeText(raw);
  if (!q) return [];

  // Hỗ trợ truy vấn kiểu: "áo khoác nam dưới 300k", "tai nghe", "tainghe".
  const compact = q.replace(/\s+/g, '');
  const budgetMatch = q.match(/(?:duoi|<=?|khong qua|toi da)\s*(\d+(?:[.,]\d+)?)\s*(k|nghin|ngan|trieu|m)?\b/);
  let maxPrice: number | undefined;
  if (budgetMatch) {
    const value = Number(budgetMatch[1].replace(',', '.'));
    const unit = budgetMatch[2];
    maxPrice = unit === 'trieu' || unit === 'm' ? value * 1_000_000 : value * 1_000;
  }

  const stopWords = new Set([
    'cho', 'toi', 'minh', 'mot', 'cai', 'chiec', 'bo', 'va', 'voi', 'duoi',
    'tren', 'gia', 'dong', 'k', 'nghin', 'ngan', 'tr', 'trieu', 'm',
    'khong', 'qua', 'toi', 'da', '<=', '<', 'd', 'vnd'
  ]);
  const aliases: Record<string, string[]> = {
    ao: ['ao', 'ao thun', 'ao khoac'], khoac: ['khoac', 'ao khoac'], nam: ['nam', 'nam gioi'],
    nu: ['nu', 'nu gioi'], tui: ['tui', 'tui xach', 'tui dung'], balo: ['balo', 'ba lo'],
    den: ['den', 'den ngu', 'den ban'], sach: ['sach', 'ke sach'], ke: ['ke', 'ke sach'],
    but: ['but'], ban: ['ban', 'ban hoc', 'ban lam viec'], ghe: ['ghe'], coc: ['coc'], binh: ['binh'],
  };

  const numericTokens = new Set((q.match(/\b\d+(?:[.,]\d+)?(?:k|nghin|ngan|trieu|m)?\b/g) ?? []));
  const terms = q.split(/\s+/)
    .filter(Boolean)
    .filter((term) => !stopWords.has(term) && !numericTokens.has(term))
    .filter((term) => !/^(duoi|tren|khong|qua|toi|da)$/.test(term));

  // "tainghe" phải khớp được với "tai nghe".
  const normalizedFields = (p: Product) => {
    const name = normalizeText(p.name);
    const description = normalizeText(p.description);
    const tags = normalizeText(p.tags.join(' '));
    const category = normalizeText(p.category.replace(/-/g, ' '));
    return { name, description, tags, category, compactAll: `${name} ${description} ${tags} ${category}`.replace(/\s+/g, '') };
  };

  return getProducts()
    .map((p) => {
      if (maxPrice != null && p.price > maxPrice) return { p, score: -1, relevant: false };
      const { name, description, tags, category, compactAll } = normalizedFields(p);
      const nameTokens = new Set(name.split(/\s+/).filter(Boolean));
      const descriptionTokens = new Set(description.split(/\s+/).filter(Boolean));
      const tagTokens = new Set(tags.split(/\s+/).filter(Boolean));
      const categoryTokens = new Set(category.split(/\s+/).filter(Boolean));

      const matchesTerm = (term: string) => {
        const variants = aliases[term] ?? [term];
        return variants.some((variant) => {
          const v = normalizeText(variant);
          const words = v.split(/\s+/).filter(Boolean);
          if (words.length > 1) return name.includes(v) || tags.includes(v) || description.includes(v) || category.includes(v);
          return nameTokens.has(v) || tagTokens.has(v) || descriptionTokens.has(v) || categoryTokens.has(v) || compactAll.includes(v.replace(/\s+/g, ''));
        });
      };

      let matched = 0;
      let score = 0;
      for (const term of terms) {
        if (!matchesTerm(term)) continue;
        matched += 1;
        if (nameTokens.has(term)) score += 6;
        else if (tagTokens.has(term)) score += 4;
        else if (descriptionTokens.has(term)) score += 2;
        else if (categoryTokens.has(term)) score += 2;
        else score += 1;
      }

      const queryCompact = compact;
      if (queryCompact && compactAll.includes(queryCompact)) score += 8;
      const relevant = terms.length === 0 ? queryCompact.length > 0 && compactAll.includes(queryCompact) : matched === terms.length;
      return { p, score, relevant };
    })
    .filter(({ relevant }) => relevant)
    .sort((a, b) => b.score - a.score || b.p.sold - a.p.sold || b.p.rating - a.p.rating)
    .map(({ p }) => p);
}
export function filterProducts(items: Product[], filters: ProductFilters = {}): Product[] {
  const categories = filters.categories?.filter(Boolean) ?? [];
  return items.filter((p) => {
    if (categories.length && !categories.includes(p.category)) return false;
    if (filters.minPrice != null && p.price < filters.minPrice) return false;
    if (filters.maxPrice != null && p.price > filters.maxPrice) return false;
    if (filters.minRating != null && p.rating < filters.minRating) return false;
    if (filters.saleOnly && !p.onSale && !p.oldPrice) return false;
    if (filters.inStockOnly && p.stock <= 0) return false;
    return true;
  });
}

export function sortProducts(items: Product[], sort: ProductSort = 'default'): Product[] {
  const result = [...items];
  switch (sort) {
    case 'popular': return result.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.sold - a.sold || b.rating - a.rating);
    case 'sold': return result.sort((a, b) => b.sold - a.sold);
    case 'newest': return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'price-asc': return result.sort((a, b) => a.price - b.price);
    case 'price-desc': return result.sort((a, b) => b.price - a.price);
    case 'rating': return result.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    default: return result;
  }
}

export function queryProducts(query = '', filters: ProductFilters = {}, sort: ProductSort = 'default'): Product[] {
  const source = query.trim() ? searchProducts(query) : getProducts();
  return sortProducts(filterProducts(source, filters), sort);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const all = getProducts().filter((p) => p.id !== product.id);
  const tags = new Set(product.tags.map(normalizeText));
  return all.map((p) => {
    const sharedTags = p.tags.reduce((n, tag) => n + (tags.has(normalizeText(tag)) ? 1 : 0), 0);
    const sameCategory = p.category === product.category ? 3 : 0;
    return { p, score: sameCategory + sharedTags + p.rating / 10 };
  }).sort((a, b) => b.score - a.score || b.p.sold - a.p.sold).slice(0, limit).map(({ p }) => p);
}

export function addProduct(product: Product): void { saveProducts([product, ...getProducts()]); }
export function updateProduct(id: string, updates: Partial<Product>): void { const items = getProducts(); const idx = items.findIndex((p) => p.id === id); if (idx !== -1) { items[idx] = { ...items[idx], ...updates }; saveProducts(items); } }
export function deleteProduct(id: string): void { saveProducts(getProducts().filter((p) => p.id !== id)); }
