import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Package,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';

import { getActiveCombos, normalizeCombo } from '@/services/comboService';
import { getProducts } from '@/services/productService';
import { formatCurrency } from '@/lib/format';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import type { Combo } from '@/types';

export function ComboPage() {
  const combos = useMemo(
    () => getActiveCombos().map(normalizeCombo),
    []
  );

  const products = useMemo(() => getProducts(), []);

  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);

  const handleAddCombo = (combo: Combo) => {
    let added = 0;

    combo.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);

      if (product && product.stock > 0) {
        addToCart(product, Math.min(item.quantity, product.stock));
        added += 1;
      }
    });

    if (!added) {
      showToast('Combo chưa có sản phẩm khả dụng', 'error');
      return;
    }

    showToast(
      `Đã thêm ${added} sản phẩm của ${combo.name} vào giỏ`,
      'success'
    );

    setSelectedCombo(null);
  };

  const getOriginalPrice = (combo: Combo) =>
    combo.originalPrice ??
    combo.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

  const getSavings = (combo: Combo) => {
    const original = getOriginalPrice(combo);
    return Math.max(0, original - combo.price);
  };

  const getDiscountPercent = (combo: Combo) => {
    const original = getOriginalPrice(combo);

    if (!original || original <= combo.price) {
      return 0;
    }

    return Math.round(((original - combo.price) / original) * 100);
  };

  const getItemImages = (item: Combo['items'][number]) => {
    const images = item.images?.length
      ? item.images
      : item.image
        ? [item.image]
        : [];

    return images.filter(Boolean);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      {/* =========================
          HERO
      ========================== */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-indigo-100 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            UniDrop Combo
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
            Mua theo combo,
            <br className="hidden sm:block" />
            sống gọn hơn ✨
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
            Những sản phẩm được tuyển chọn sẵn thành từng bộ tiện ích,
            giúp bạn mua nhanh hơn và tiết kiệm hơn.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-sm font-bold">💰 Tiết kiệm hơn</p>
              <p className="mt-0.5 text-xs text-indigo-100">
                Giá combo tốt hơn
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-sm font-bold">📦 Chọn sẵn cho bạn</p>
              <p className="mt-0.5 text-xs text-indigo-100">
                Không cần chọn từng món
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-sm font-bold">✨ Tiện lợi</p>
              <p className="mt-0.5 text-xs text-indigo-100">
                Thêm cả combo vào giỏ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          SECTION TITLE
      ========================== */}
      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            GỢI Ý CHO BẠN
          </p>

          <h2 className="mt-1 text-2xl font-black text-gray-900 sm:text-3xl">
            Khám phá các Combo
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Bấm vào combo để xem chi tiết các sản phẩm bên trong.
          </p>
        </div>

        <Link
          to="/san-pham"
          className="hidden shrink-0 text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:block"
        >
          Xem sản phẩm →
        </Link>
      </div>

      {/* =========================
          COMBO GRID
      ========================== */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {combos.map((combo) => {
          const original = getOriginalPrice(combo);
          const savings = getSavings(combo);
          const discount = getDiscountPercent(combo);

          /*
           * Lấy tối đa 4 ảnh sản phẩm để tạo
           * ảnh preview cho Combo.
           */
          const previewItems = combo.items.slice(0, 4);

          return (
            <article
              key={combo.id}
              className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* =========================
                  IMAGE PREVIEW
              ========================== */}
              <button
                type="button"
                onClick={() => setSelectedCombo(combo)}
                className="block w-full text-left"
              >
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50">
                  {/* Discount badge */}
                  {discount > 0 && (
                    <div className="absolute left-4 top-4 z-10 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                      🔥 Tiết kiệm {discount}%
                    </div>
                  )}

                  {/* Product image collage */}
                  <div
                    className={`grid h-full ${
                      previewItems.length === 1
                        ? 'grid-cols-1'
                        : previewItems.length === 2
                          ? 'grid-cols-2'
                          : previewItems.length === 3
                            ? 'grid-cols-3'
                            : 'grid-cols-2'
                    } gap-2 p-3`}
                  >
                    {previewItems.map((item, index) => {
                      const images = getItemImages(item);
                      const image = images[0];

                      return (
                        <div
                          key={`${item.productId}-${index}`}
                          className={`relative overflow-hidden rounded-2xl bg-white ${
                            previewItems.length === 4
                              ? 'h-[calc(50%-4px)]'
                              : 'h-full'
                          }`}
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={item.name}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-10 w-10 text-indigo-200" />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {previewItems.length === 0 && (
                      <div className="col-span-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-indigo-200" />
                      </div>
                    )}
                  </div>

                  {/* More items */}
                  {combo.items.length > 4 && (
                    <div className="absolute bottom-4 right-4 rounded-full bg-black/65 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                      +{combo.items.length - 4} sản phẩm
                    </div>
                  )}

                  {/* View detail overlay */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/35 to-transparent pb-4 pt-10 opacity-0 transition group-hover:opacity-100">
                    <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-900 shadow-lg">
                      👀 Xem sản phẩm trong combo
                    </span>
                  </div>
                </div>
              </button>

              {/* =========================
                  CARD CONTENT
              ========================== */}
              <div className="p-5">
                <button
                  type="button"
                  onClick={() => setSelectedCombo(combo)}
                  className="text-left"
                >
                  <h2 className="text-lg font-black text-gray-900 transition hover:text-indigo-600">
                    {combo.name}
                  </h2>

                  <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
                    {combo.description ||
                      'Bộ sản phẩm được tuyển chọn tiện lợi cho bạn.'}
                  </p>
                </button>

                {/* Product thumbnails */}
                <div className="mt-4 flex items-center gap-2">
                  {combo.items.slice(0, 5).map((item) => {
                    const images = getItemImages(item);
                    const image = images[0];

                    return (
                      <div
                        key={item.productId}
                        title={`${item.name} × ${item.quantity}`}
                        className="h-10 w-10 overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {combo.items.length > 5 && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-xs font-bold text-gray-500">
                      +{combo.items.length - 5}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <Package className="h-4 w-4 text-indigo-500" />
                  <span>
                    {combo.items.length} sản phẩm trong combo
                  </span>
                </div>

                {/* Price */}
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-2xl font-black text-indigo-600">
                      {formatCurrency(combo.price)}
                    </p>

                    {original > combo.price && (
                      <p className="mt-0.5 text-sm text-gray-400 line-through">
                        {formatCurrency(original)}
                      </p>
                    )}

                    {savings > 0 && (
                      <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                        Tiết kiệm {formatCurrency(savings)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCombo(combo)}
                    className="flex shrink-0 items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-600 transition hover:bg-indigo-100"
                  >
                    Xem chi tiết
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Add combo */}
                <button
                  type="button"
                  onClick={() => handleAddCombo(combo)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 active:scale-[0.98]"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Thêm combo vào giỏ
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty state */}
      {combos.length === 0 && (
        <div className="rounded-3xl border border-dashed border-gray-200 py-20 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-300" />

          <h3 className="mt-4 text-lg font-bold text-gray-800">
            Chưa có combo đang bán
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Các combo mới sẽ xuất hiện tại đây.
          </p>
        </div>
      )}

      {/* Mobile product link */}
      <div className="mt-8 text-center sm:hidden">
        <Link
          to="/san-pham"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Xem toàn bộ sản phẩm →
        </Link>
      </div>

      {/* =========================
          COMBO DETAIL MODAL
      ========================== */}
      {selectedCombo && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCombo(null);
            }
          }}
        >
          <div className="max-h-[92vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-3xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                  <Package className="h-5 w-5 text-indigo-600" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-indigo-600">
                    CHI TIẾT COMBO
                  </p>

                  <h2 className="text-lg font-black text-gray-900">
                    {selectedCombo.name}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCombo(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal content */}
            <div className="max-h-[calc(92vh-150px)] overflow-y-auto px-5 py-5 sm:px-6">
              {/* Description */}
              <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
                <p className="text-sm leading-6 text-gray-600">
                  {selectedCombo.description ||
                    'Bộ sản phẩm được UniDrop tuyển chọn để giúp bạn mua sắm tiện lợi và tiết kiệm hơn.'}
                </p>
              </div>

              {/* Product list */}
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-black text-gray-900">
                    Sản phẩm trong combo
                  </h3>

                  <span className="text-sm text-gray-500">
                    {selectedCombo.items.length} sản phẩm
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedCombo.items.map((item) => {
                    const images = getItemImages(item);
                    const product = products.find(
                      (p) => p.id === item.productId
                    );

                    return (
                      <div
                        key={item.productId}
                        className="rounded-2xl border border-gray-100 bg-white p-3 transition hover:border-indigo-100 hover:bg-indigo-50/30"
                      >
                        <div className="flex gap-3">
                          {/* Main image */}
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                            {images[0] ? (
                              <img
                                src={images[0]}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package className="h-7 w-7 text-gray-300" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  {item.name}
                                </h4>

                                <p className="mt-1 text-xs text-gray-500">
                                  Số lượng: ×{item.quantity}
                                </p>
                              </div>

                              <p className="shrink-0 font-bold text-indigo-600">
                                {formatCurrency(
                                  item.price * item.quantity
                                )}
                              </p>
                            </div>

                            {/* All product images */}
                            {images.length > 1 && (
                              <div className="mt-2 flex gap-1.5">
                                {images.slice(0, 5).map((image, index) => (
                                  <div
                                    key={`${item.productId}-detail-${index}`}
                                    className="h-9 w-9 overflow-hidden rounded-lg border border-gray-100 bg-white"
                                  >
                                    <img
                                      src={image}
                                      alt={`${item.name} ${index + 1}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Stock */}
                            {product && (
                              <div className="mt-2">
                                {product.stock > 0 ? (
                                  <span className="text-xs font-medium text-emerald-600">
                                    ✓ Còn hàng
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium text-red-500">
                                    Hết hàng
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price summary */}
              <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                {(() => {
                  const original = getOriginalPrice(selectedCombo);
                  const savings = getSavings(selectedCombo);
                  const discount = getDiscountPercent(selectedCombo);

                  return (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Tổng giá sản phẩm
                        </span>

                        <span className="text-gray-700 line-through">
                          {formatCurrency(original)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-semibold text-gray-700">
                          Giá Combo
                        </span>

                        <span className="text-2xl font-black text-indigo-600">
                          {formatCurrency(selectedCombo.price)}
                        </span>
                      </div>

                      {savings > 0 && (
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2">
                          <span className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                            <Check className="h-4 w-4" />
                            Bạn tiết kiệm
                          </span>

                          <span className="font-black text-emerald-600">
                            {formatCurrency(savings)}
                            {discount > 0 && ` (${discount}%)`}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Modal footer */}
            <div className="border-t border-gray-100 bg-white p-4 sm:p-5">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCombo(null)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={() => handleAddCombo(selectedCombo)}
                  className="flex-[2] rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                >
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Thêm combo vào giỏ
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}