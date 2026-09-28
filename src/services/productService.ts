import type { Product, ProductDescriptionSection } from '@/types';
import { loadJSON, saveJSON } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

const PRODUCTS_KEY = 'products';
const INITIALIZED = 'products_initialized';
const DATA_VERSION = 'products_data_version';
const CURRENT_DATA_VERSION = 'supabase-products-v1';
const IMAGE_BUCKET = 'product-images';

export type ProductSort = 'default' | 'popular' | 'sold' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
export interface ProductFilters { categories?: string[]; minPrice?: number; maxPrice?: number; minRating?: number; saleOnly?: boolean; inStockOnly?: boolean; }

interface DbProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number | string;
  old_price: number | string | null;
  image: string;
  images: string[] | null;
  rating: number | string;
  reviews: number;
  sold: number;
  stock: number;
  description: string;
  description_sections: ProductDescriptionSection[] | null;
  tags: string[] | null;
  featured: boolean;
  bestseller: boolean;
  is_new: boolean;
  on_sale: boolean;
  created_at: string;
}

function toProduct(row: DbProduct): Product {
  const images = Array.isArray(row.images) ? row.images.filter(Boolean) : [];
  const image = row.image || images[0] || '';
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    price: Number(row.price) || 0,
    oldPrice: row.old_price == null ? undefined : Number(row.old_price),
    image,
    images: images.length ? images : image ? [image] : [],
    rating: Number(row.rating) || 0,
    reviews: Number(row.reviews) || 0,
    sold: Number(row.sold) || 0,
    stock: Number(row.stock) || 0,
    description: row.description || '',
    descriptionSections: Array.isArray(row.description_sections) ? row.description_sections : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    featured: Boolean(row.featured),
    bestseller: Boolean(row.bestseller),
    isNew: Boolean(row.is_new),
    onSale: Boolean(row.on_sale),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function toRow(product: Product): DbProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    price: product.price,
    old_price: product.oldPrice ?? null,
    image: product.image || product.images?.[0] || '',
    images: product.images ?? [],
    rating: product.rating,
    reviews: product.reviews,
    sold: product.sold,
    stock: product.stock,
    description: product.description || '',
    description_sections: product.descriptionSections ?? [],
    tags: product.tags ?? [],
    featured: Boolean(product.featured),
    bestseller: Boolean(product.bestseller),
    is_new: Boolean(product.isNew),
    on_sale: Boolean(product.onSale),
    created_at: product.createdAt,
  };
}

export function getProducts(): Product[] {
  return loadJSON<Product[]>(PRODUCTS_KEY, []);
}

/**
 * Local cache writer. Existing parts of the app can continue to use the
 * synchronous product API while Supabase is synchronized in the background.
 */
export function saveProducts(items: Product[]): void {
  saveJSON(PRODUCTS_KEY, items);
  void syncProductsToCloud(items);
}

async function syncProductsToCloud(items: Product[]): Promise<void> {
  if (!items.length) return;
  const { error } = await supabase.from('products').upsert(items.map(toRow), { onConflict: 'id' });
  if (error) console.error('[UniDrop] Không thể đồng bộ sản phẩm:', error.message);
}

export async function loadProductsFromCloud(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('[UniDrop] Không thể tải sản phẩm từ Supabase:', error.message);
    return getProducts();
  }

  const products = (data as DbProduct[]).map(toProduct);
  const localProducts = getProducts();
  if (products.length === 0 && localProducts.length > 0) {
    // Keep an existing local catalog during first migration instead of wiping it.
    // New products created through Admin are written directly to Supabase.
    return localProducts;
  }
  saveJSON(PRODUCTS_KEY, products);
  return products;
}

export function ensureProductsInitialized(): void {
  const version = loadJSON<string>(DATA_VERSION, '');
  if (version !== CURRENT_DATA_VERSION) {
    // Do not wipe existing local products. Supabase is now the cloud source;
    // keeping the local cache avoids losing products during migration.
    saveJSON(INITIALIZED, true);
    saveJSON(DATA_VERSION, CURRENT_DATA_VERSION);
  }
  if (!loadJSON<boolean>(INITIALIZED, false)) saveJSON(INITIALIZED, true);
}

export async function addProduct(product: Product): Promise<void> {
  const { error } = await supabase.from('products').insert(toRow(product));
  if (error) throw new Error(`Không thể thêm sản phẩm: ${error.message}`);
  saveJSON(PRODUCTS_KEY, [product, ...getProducts()]);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const items = getProducts();
  const current = items.find((p) => p.id === id);
  if (!current) return;
  const updated = { ...current, ...updates, id: current.id };
  const { error } = await supabase.from('products').update(toRow(updated)).eq('id', id);
  if (error) throw new Error(`Không thể cập nhật sản phẩm: ${error.message}`);
  saveJSON(PRODUCTS_KEY, items.map((p) => (p.id === id ? updated : p)));
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(`Không thể xóa sản phẩm: ${error.message}`);
  saveJSON(PRODUCTS_KEY, getProducts().filter((p) => p.id !== id));
}

export async function uploadProductImage(file: Blob, productId: string): Promise<string> {
  const safeId = productId.replace(/[^a-zA-Z0-9_-]/g, '-');
  const path = `products/${safeId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error(`Không thể upload ảnh: ${error.message}`);
  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImageByUrl(url: string): Promise<void> {
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = decodeURIComponent(url.slice(index + marker.length));
  if (!path) return;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
  if (error) console.warn('[UniDrop] Không thể xóa ảnh cũ:', error.message);
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
  const compact = q.replace(/\s+/g, '');
  const budgetMatch = q.match(/(?:duoi|<=?|khong qua|toi da)\s*(\d+(?:[.,]\d+)?)\s*(k|nghin|ngan|trieu|m)?\b/);
  let maxPrice: number | undefined;
  if (budgetMatch) {
    const value = Number(budgetMatch[1].replace(',', '.'));
    const unit = budgetMatch[2];
    maxPrice = unit === 'trieu' || unit === 'm' ? value * 1_000_000 : value * 1_000;
  }
  const stopWords = new Set(['cho','toi','minh','mot','cai','chiec','bo','va','voi','duoi','tren','gia','dong','k','nghin','ngan','tr','trieu','m','khong','qua','da','<=','<','d','vnd']);
  const aliases: Record<string, string[]> = {
    ao:['ao','ao thun','ao khoac'], khoac:['khoac','ao khoac'], nam:['nam','nam gioi'], nu:['nu','nu gioi'], tui:['tui','tui xach','tui dung'], balo:['balo','ba lo'], den:['den','den ngu','den ban'], sach:['sach','ke sach'], ke:['ke','ke sach'], but:['but'], ban:['ban','ban hoc','ban lam viec'], ghe:['ghe'], coc:['coc'], binh:['binh'],
  };
  const numericTokens = new Set((q.match(/\b\d+(?:[.,]\d+)?(?:k|nghin|ngan|trieu|m)?\b/g) ?? []));
  const terms = q.split(/\s+/).filter(Boolean).filter((term) => !stopWords.has(term) && !numericTokens.has(term)).filter((term) => !/^(duoi|tren|khong|qua|toi|da)$/.test(term));
  const normalizedFields = (p: Product) => {
    const name = normalizeText(p.name), description = normalizeText(p.description), tags = normalizeText(p.tags.join(' ')), category = normalizeText(p.category.replace(/-/g, ' '));
    return { name, description, tags, category, compactAll: `${name} ${description} ${tags} ${category}`.replace(/\s+/g, '') };
  };
  return getProducts().map((p) => {
    if (maxPrice != null && p.price > maxPrice) return { p, score: -1, relevant: false };
    const { name, description, tags, category, compactAll } = normalizedFields(p);
    const nameTokens = new Set(name.split(/\s+/).filter(Boolean)), descriptionTokens = new Set(description.split(/\s+/).filter(Boolean)), tagTokens = new Set(tags.split(/\s+/).filter(Boolean)), categoryTokens = new Set(category.split(/\s+/).filter(Boolean));
    const matchesTerm = (term: string) => (aliases[term] ?? [term]).some((variant) => {
      const v = normalizeText(variant), words = v.split(/\s+/).filter(Boolean);
      if (words.length > 1) return name.includes(v) || tags.includes(v) || description.includes(v) || category.includes(v);
      return nameTokens.has(v) || tagTokens.has(v) || descriptionTokens.has(v) || categoryTokens.has(v) || compactAll.includes(v.replace(/\s+/g, ''));
    });
    let matched = 0, score = 0;
    for (const term of terms) {
      if (!matchesTerm(term)) continue;
      matched += 1;
      if (nameTokens.has(term)) score += 6; else if (tagTokens.has(term)) score += 4; else if (descriptionTokens.has(term)) score += 2; else if (categoryTokens.has(term)) score += 2; else score += 1;
    }
    if (compact && compactAll.includes(compact)) score += 8;
    const relevant = terms.length === 0 ? compact.length > 0 && compactAll.includes(compact) : matched === terms.length;
    return { p, score, relevant };
  }).filter(({ relevant }) => relevant).sort((a,b) => b.score-a.score || b.p.sold-a.p.sold || b.p.rating-a.p.rating).map(({ p }) => p);
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
    case 'popular': return result.sort((a,b) => Number(Boolean(b.featured))-Number(Boolean(a.featured)) || b.sold-a.sold || b.rating-a.rating);
    case 'sold': return result.sort((a,b) => b.sold-a.sold);
    case 'newest': return result.sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
    case 'price-asc': return result.sort((a,b) => a.price-b.price);
    case 'price-desc': return result.sort((a,b) => b.price-a.price);
    case 'rating': return result.sort((a,b) => b.rating-a.rating || b.reviews-a.reviews);
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
  }).sort((a,b) => b.score-a.score || b.p.sold-a.p.sold).slice(0, limit).map(({ p }) => p);
}
