import type { Combo, ComboItem } from '@/types';
import { getProducts } from '@/services/productService';
import { loadJSON, saveJSON } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

const COMBOS_KEY = 'unidrop_combos';

interface DbCombo {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  items: ComboItem[];
  price: number;
  active: boolean;
  created_at: string;
}

/* =========================================================
   DEFAULT COMBOS
========================================================= */

const DEFAULT_COMBOS: Combo[] = [
  [
    'combo-nhap-hoc',
    'Combo Nhập Học',
    'combo-nhap-hoc',
    'Bộ sản phẩm cơ bản cho sinh viên bắt đầu năm học mới.',
  ],
  [
    'combo-goc-hoc-tap',
    'Combo Góc Học Tập',
    'combo-goc-hoc-tap',
    'Gọn gàng, tiện dụng cho góc học tập.',
  ],
  [
    'combo-phong-tro',
    'Combo Phòng Trọ Gọn Gàng',
    'combo-phong-tro-gon-gang',
    'Tối ưu không gian sống nhỏ.',
  ],
  [
    'combo-cong-nghe',
    'Combo Công Nghệ Sinh Viên',
    'combo-cong-nghe-sinh-vien',
    'Phụ kiện công nghệ thiết thực cho sinh viên.',
  ],
  [
    'combo-decor',
    'Combo Decor Phòng',
    'combo-decor-phong',
    'Làm mới không gian theo phong cách riêng.',
  ],
  [
    'combo-qua-tang',
    'Combo Quà Tặng Sinh Viên',
    'combo-qua-tang-sinh-vien',
    'Một bộ quà nhỏ gọn, dễ thương và thiết thực.',
  ],
].map(([id, name, slug, description]) => ({
  id,
  name,
  slug,
  description,
  image: '',
  items: [],
  price: 0,
  active: true,
  createdAt: new Date().toISOString(),
}));

/* =========================================================
   HELPERS
========================================================= */

/**
 * Lấy danh sách ảnh chuẩn của một sản phẩm.
 *
 * Ưu tiên:
 * 1. product.images
 * 2. product.image
 */
function getProductImages(product: {
  image?: string;
  images?: string[];
}): string[] {
  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : [];

  if (images.length > 0) {
    return images;
  }

  return product.image ? [product.image] : [];
}

/**
 * Đồng bộ ComboItem với dữ liệu sản phẩm hiện tại.
 *
 * Điều này giúp:
 * - Combo cũ chưa có images vẫn hoạt động.
 * - Combo lấy từ Supabase vẫn có đủ ảnh.
 * - Nếu sản phẩm đổi tên/giá/ảnh thì Combo hiển thị dữ liệu mới.
 */
function normalizeComboItem(item: ComboItem): ComboItem {
  const products = getProducts();

  const product = products.find(
    (product) => product.id === item.productId
  );

  if (!product) {
    return {
      ...item,
      images:
        Array.isArray(item.images) && item.images.length > 0
          ? item.images
          : item.image
            ? [item.image]
            : [],
    };
  }

  const images = getProductImages(product);

  return {
    ...item,

    productId: product.id,
    name: product.name,
    price: product.price,

    image:
      product.image ||
      item.image ||
      images[0] ||
      '',

    images:
      images.length > 0
        ? images
        : Array.isArray(item.images)
          ? item.images
          : item.image
            ? [item.image]
            : [],

    quantity:
      Number(item.quantity) > 0
        ? Number(item.quantity)
        : 1,
  };
}

/**
 * Chuẩn hóa toàn bộ Combo.
 */
function normalizeComboItems(combo: Combo): Combo {
  return {
    ...combo,

    image: combo.image || '',

    items: Array.isArray(combo.items)
      ? combo.items.map(normalizeComboItem)
      : [],
  };
}

/* =========================================================
   DATABASE CONVERSION
========================================================= */

const toRow = (combo: Combo): DbCombo => ({
  id: combo.id,
  name: combo.name,
  slug: combo.slug,
  description: combo.description,
  image: combo.image || null,

  items: combo.items.map((item) => ({
    ...item,

    images:
      Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : item.image
          ? [item.image]
          : [],
  })),

  price: combo.price,
  active: combo.active,
  created_at: combo.createdAt,
});

const toCombo = (row: DbCombo): Combo => {
  const rawItems = Array.isArray(row.items)
    ? row.items
    : [];

  return normalizeComboItems({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    image: row.image || '',

    items: rawItems.map((item) => ({
      productId: item.productId,
      name: item.name || '',
      price: Number(item.price) || 0,
      image: item.image || '',

      images:
        Array.isArray(item.images)
          ? item.images.filter(Boolean)
          : item.image
            ? [item.image]
            : [],

      quantity:
        Number(item.quantity) > 0
          ? Number(item.quantity)
          : 1,
    })),

    price: Number(row.price) || 0,
    active: row.active !== false,
    createdAt: row.created_at,
  });
};

/* =========================================================
   LOCAL STORAGE
========================================================= */

export function getCombos(): Combo[] {
  const combos = loadJSON<Combo[]>(
    COMBOS_KEY,
    DEFAULT_COMBOS
  );

  return combos.map(normalizeComboItems);
}

export function saveCombos(combos: Combo[]): void {
  saveJSON(
    COMBOS_KEY,
    combos.map(normalizeComboItems)
  );
}

export function getActiveCombos(): Combo[] {
  return getCombos().filter(
    (combo) => combo.active
  );
}

export function getComboBySlug(
  slug: string
): Combo | undefined {
  return getCombos().find(
    (combo) =>
      combo.slug === slug ||
      combo.id === slug
  );
}

/* =========================================================
   SUPABASE
========================================================= */

export async function loadCombosFromCloud(): Promise<Combo[]> {
  const {
    data,
    error,
  } = await supabase
    .from('combos')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    console.warn(
      '[UniDrop] Không thể tải combo từ Supabase:',
      error.message
    );

    return getCombos();
  }

  const cloudCombos = (data as DbCombo[])
    .map(toCombo)
    .map(normalizeComboItems);

  if (!cloudCombos.length) {
    return getCombos();
  }

  const localCombos = getCombos();

  const cloudIds = new Set(
    cloudCombos.map((combo) => combo.id)
  );

  const merged = [
    ...cloudCombos,
    ...localCombos.filter(
      (combo) => !cloudIds.has(combo.id)
    ),
  ];

  saveCombos(merged);

  return merged;
}

/* =========================================================
   CREATE / UPDATE / DELETE
========================================================= */

async function writeCombo(
  combo: Combo
): Promise<void> {
  const normalized = normalizeComboItems(combo);

  const {
    error,
  } = await supabase
    .from('combos')
    .upsert(
      toRow(normalized),
      {
        onConflict: 'id',
      }
    );

  if (error) {
    throw new Error(
      `Không thể lưu combo: ${error.message}`
    );
  }
}

export async function createCombo(
  input: Omit<Combo, 'id' | 'createdAt'>
): Promise<Combo> {
  const combo: Combo = normalizeComboItems({
    ...input,

    id: `combo-${Date.now()}`,

    createdAt:
      new Date().toISOString(),
  });

  await writeCombo(combo);

  saveCombos([
    combo,
    ...getCombos(),
  ]);

  return combo;
}

export async function updateCombo(
  id: string,
  updates: Partial<Combo>
): Promise<void> {
  const current = getCombos().find(
    (combo) => combo.id === id
  );

  if (!current) {
    return;
  }

  const updated = normalizeComboItems({
    ...current,
    ...updates,
    id,
  });

  await writeCombo(updated);

  saveCombos(
    getCombos().map((combo) =>
      combo.id === id
        ? updated
        : combo
    )
  );
}

export async function deleteCombo(
  id: string
): Promise<void> {
  const {
    error,
  } = await supabase
    .from('combos')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(
      `Không thể xóa combo: ${error.message}`
    );
  }

  saveCombos(
    getCombos().filter(
      (combo) => combo.id !== id
    )
  );
}

/* =========================================================
   PRICE
========================================================= */

export function calculateComboOriginalPrice(
  combo: Combo
): number {
  const products = getProducts();

  return combo.items.reduce(
    (sum, item) => {
      const product = products.find(
        (product) =>
          product.id === item.productId
      );

      const price =
        product?.price ??
        item.price ??
        0;

      const quantity =
        Number(item.quantity) > 0
          ? Number(item.quantity)
          : 1;

      return sum + price * quantity;
    },
    0
  );
}

export function normalizeCombo(
  combo: Combo
): Combo {
  const normalized =
    normalizeComboItems(combo);

  const originalPrice =
    calculateComboOriginalPrice(
      normalized
    );

  const safePrice =
    normalized.price > 0
      ? Math.min(
          normalized.price,
          originalPrice ||
            normalized.price
        )
      : originalPrice;

  return {
    ...normalized,
    price: safePrice,
    originalPrice,
  };
}

/* =========================================================
   CART
========================================================= */

export function comboToCartProducts(
  combo: Combo
): ComboItem[] {
  const products = getProducts();

  return combo.items.map((item) => {
    const product = products.find(
      (product) =>
        product.id === item.productId
    );

    if (!product) {
      return {
        ...item,

        images:
          Array.isArray(item.images) &&
          item.images.length > 0
            ? item.images
            : item.image
              ? [item.image]
              : [],
      };
    }

    const images =
      getProductImages(product);

    return {
      ...item,

      name: product.name,

      price: product.price,

      image:
        product.image ||
        item.image ||
        images[0] ||
        '',

      images:
        images.length > 0
          ? images
          : item.images?.length
            ? item.images
            : item.image
              ? [item.image]
              : [],
    };
  });
}