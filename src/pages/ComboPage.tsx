import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

import {
  getActiveCombos,
  normalizeCombo,
} from '@/services/comboService';

import {
  getProducts,
} from '@/services/productService';

import {
  formatCurrency,
} from '@/lib/format';

import {
  useCart,
} from '@/contexts/CartContext';

import {
  useToast,
} from '@/contexts/ToastContext';

import type {
  Combo,
} from '@/types';


function getComboAvailability(
  combo: Combo,
  products: ReturnType<typeof getProducts>
) {
  if (!combo.items.length) {
    return {
      available: false,
      maxQuantity: 0,
      reason: 'Combo chưa có sản phẩm',
    };
  }

  let maxQuantity =
    Number.POSITIVE_INFINITY;

  for (const item of combo.items) {

    const product =
      products.find(
        (p) =>
          p.id === item.productId
      );

    if (!product) {
      return {
        available: false,
        maxQuantity: 0,
        reason:
          `Thiếu sản phẩm: ${item.name}`,
      };
    }

    const possible =
      Math.floor(
        Math.max(
          product.stock,
          0
        ) /
        Math.max(
          item.quantity,
          1
        )
      );

    maxQuantity =
      Math.min(
        maxQuantity,
        possible
      );
  }

  if (maxQuantity <= 0) {
    return {
      available: false,
      maxQuantity: 0,
      reason:
        'Có sản phẩm hết hàng',
    };
  }

  return {
    available: true,
    maxQuantity,
    reason:
      `Còn tối đa ${maxQuantity} combo`,
  };
}


export function ComboPage() {

  const combos = useMemo(
    () =>
      getActiveCombos()
        .map(normalizeCombo),
    []
  );

  const products = useMemo(
    () =>
      getProducts(),
    []
  );

  const {
    addComboToCart,
  } = useCart();

  const {
    showToast,
  } = useToast();


  const handleAddCombo = (
    combo: Combo
  ) => {

    const result =
      addComboToCart(
        combo
      );

    if (!result.success) {

      showToast(
        result.error ||
          'Không thể thêm combo vào giỏ',
        'error'
      );

    } else {

      showToast(
        `Đã thêm ${combo.name} vào giỏ hàng`,
        'success'
      );
    }
  };


  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">

      <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white sm:p-10">

        <div className="max-w-2xl">

          <div className="mb-3 flex items-center gap-2 text-indigo-100">

            <Sparkles className="h-5 w-5" />

            UniDrop Combo

          </div>

          <h1 className="text-3xl font-black sm:text-4xl">

            Mua theo combo, sống gọn hơn

          </h1>

          <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">

            Các gói được tuyển chọn từ chính những sản phẩm đang có trên UniDrop.

          </p>

        </div>

      </div>


      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

        {combos.map(
          (combo) => {

            const original =
              combo.originalPrice ??
              combo.items.reduce(
                (
                  sum,
                  item
                ) =>
                  sum +
                  item.price *
                    item.quantity,
                0
              );

            const savings =
              Math.max(
                0,
                original -
                  combo.price
              );

            const discountPercent =
              original > 0
                ? Math.round(
                    (
                      savings /
                      original
                    ) *
                      100
                  )
                : 0;

            const availability =
              getComboAvailability(
                combo,
                products
              );


            return (

              <article
                key={combo.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >

                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50">

                  {combo.image ? (

                    <img
                      src={combo.image}
                      alt={combo.name}
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    <Package className="h-16 w-16 text-indigo-300" />

                  )}

                </div>


                <div className="p-5">

                  <div className="flex items-start justify-between gap-3">

                    <h2 className="text-lg font-bold text-gray-900">

                      {combo.name}

                    </h2>


                    {discountPercent > 0 && (

                      <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-bold text-rose-600">

                        -{discountPercent}%

                      </span>

                    )}

                  </div>


                  <p className="mt-1 min-h-10 text-sm text-gray-500">

                    {combo.description}

                  </p>


                  <div className="mt-4 space-y-2">

                    {combo.items
                      .slice(0, 4)
                      .map(
                        (item) => {

                          const product =
                            products.find(
                              (p) =>
                                p.id ===
                                item.productId
                            );

                          const inStock =
                            !!product &&
                            product.stock >=
                              item.quantity;


                          return (

                            <div
                              key={item.productId}
                              className="flex items-center justify-between gap-2 text-sm text-gray-700"
                            >

                              <span className="flex min-w-0 items-center gap-2">

                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    inStock
                                      ? 'bg-emerald-500'
                                      : 'bg-rose-500'
                                  }`}
                                />

                                <span className="truncate">

                                  {item.name}
                                  {' × '}
                                  {item.quantity}

                                </span>

                              </span>


                              {inStock ? (

                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />

                              ) : (

                                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />

                              )}

                            </div>

                          );

                        }
                      )}

                  </div>


                  <div
                    className={`mt-4 rounded-xl px-3 py-2 text-xs font-medium ${
                      availability.available
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >

                    {availability.available
                      ? `✓ ${availability.reason}`
                      : `⚠ ${availability.reason}`}

                  </div>


                  <div className="mt-5 flex items-end justify-between gap-3">

                    <div>

                      <p className="text-xl font-black text-indigo-600">

                        {formatCurrency(
                          combo.price
                        )}

                      </p>


                      {original >
                        combo.price && (

                        <p className="text-xs text-gray-400 line-through">

                          {formatCurrency(
                            original
                          )}

                        </p>

                      )}


                      {savings > 0 && (

                        <p className="text-xs font-semibold text-emerald-600">

                          Tiết kiệm{' '}

                          {formatCurrency(
                            savings
                          )}

                          {' '}

                          ({discountPercent}%)

                        </p>

                      )}

                    </div>


                    <button
                      disabled={
                        !availability.available
                      }
                      onClick={() =>
                        handleAddCombo(
                          combo
                        )
                      }
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >

                      <ShoppingBag className="h-4 w-4" />

                      {availability.available
                        ? 'Thêm combo'
                        : 'Hết hàng'}

                    </button>

                  </div>

                </div>

              </article>

            );

          }
        )}

      </div>


      {combos.length === 0 && (

        <div className="py-20 text-center text-gray-500">

          Chưa có combo đang bán.

        </div>

      )}


      <div className="mt-8 text-center">

        <Link
          to="/san-pham"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >

          Xem toàn bộ sản phẩm →

        </Link>

      </div>

    </div>
  );
}