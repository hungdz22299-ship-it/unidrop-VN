import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

import type { CartItem, Product, Combo } from '@/types';
import { loadJSON, saveJSON } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';

interface CartContextValue {
  items: CartItem[];

  addToCart: (
    product: Product,
    quantity?: number
  ) => void;

  addComboToCart: (
    combo: Combo
  ) => {
    success: boolean;
    error?: string;
  };

  removeFromCart: (
    productId: string
  ) => void;

  updateQuantity: (
    productId: string,
    quantity: number
  ) => void;

  clearCart: () => void;

  totalItems: number;
  totalPrice: number;
}

const CartContext =
  createContext<CartContextValue | null>(null);


/* =========================================================
   KIỂM TRA COMBO CÒN ĐỦ HÀNG KHÔNG
   ========================================================= */

function getComboMaxQuantity(
  combo: Combo,
  products: Product[]
): number {

  if (!combo.items || combo.items.length === 0) {
    return 0;
  }

  let maxQuantity =
    Number.POSITIVE_INFINITY;

  for (const item of combo.items) {

    const product = products.find(
      (p) => p.id === item.productId
    );

    // Không tìm thấy sản phẩm
    if (!product) {
      return 0;
    }

    // Số lượng sản phẩm cần cho 1 combo
    const requiredQuantity =
      Math.max(item.quantity, 1);

    // Nếu sản phẩm hết hàng
    if (
      !product.stock ||
      product.stock < requiredQuantity
    ) {
      return 0;
    }

    // Combo tối đa có thể tạo từ sản phẩm này
    const possibleQuantity =
      Math.floor(
        product.stock /
        requiredQuantity
      );

    maxQuantity = Math.min(
      maxQuantity,
      possibleQuantity
    );
  }

  if (
    !Number.isFinite(maxQuantity)
  ) {
    return 0;
  }

  return Math.max(
    0,
    maxQuantity
  );
}


/* =========================================================
   CART PROVIDER
   ========================================================= */

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {

  const {
    user,
    isLoggedIn,
  } = useAuth();

  const [
    items,
    setItems,
  ] = useState<CartItem[]>([]);

  const key =
    user
      ? `cart_${user.email}`
      : null;


  /* =======================================================
     LOAD CART
     ======================================================= */

  useEffect(() => {

    if (!isLoggedIn || !key) {
      setItems([]);
      return;
    }

    setItems(
      loadJSON<CartItem[]>(
        key,
        []
      )
    );

    const onStorage = (
      event: StorageEvent
    ) => {

      if (
        event.key ===
        `unidrop_${key}`
      ) {
        setItems(
          loadJSON<CartItem[]>(
            key,
            []
          )
        );
      }
    };

    window.addEventListener(
      'storage',
      onStorage
    );

    return () => {
      window.removeEventListener(
        'storage',
        onStorage
      );
    };

  }, [
    isLoggedIn,
    key,
  ]);


  /* =======================================================
     SAVE CART
     ======================================================= */

  const persist = useCallback(
    (
      newItems: CartItem[]
    ) => {

      if (!key) return;

      setItems(
        newItems
      );

      saveJSON(
        key,
        newItems
      );
    },
    [key]
  );


  /* =======================================================
     THÊM SẢN PHẨM THƯỜNG
     ======================================================= */

  const addToCart =
    useCallback(
      (
        product: Product,
        quantity = 1
      ) => {

        if (
          !key ||
          quantity <= 0
        ) {
          return;
        }

        const stock =
          Math.max(
            product.stock ?? 0,
            0
          );

        // Hết hàng
        if (stock <= 0) {
          return;
        }

        const existing =
          items.find(
            (item) =>
              item.productId ===
              product.id &&
              item.kind !== 'combo'
          );

        if (existing) {

          const newQuantity =
            Math.min(
              existing.quantity +
                quantity,
              stock
            );

          const next =
            items.map(
              (item) =>
                item.productId ===
                  product.id &&
                item.kind !== 'combo'
                  ? {
                      ...item,
                      quantity:
                        newQuantity,
                      name:
                        product.name,
                      price:
                        product.price,
                      image:
                        product.image,
                    }
                  : item
            );

          persist(next);

        } else {

          const safeQuantity =
            Math.min(
              quantity,
              stock
            );

          const newItem: CartItem = {
            productId:
              product.id,

            name:
              product.name,

            price:
              product.price,

            image:
              product.image,

            quantity:
              safeQuantity,

            kind:
              'product',
          };

          persist([
            ...items,
            newItem,
          ]);
        }
      },
      [
        items,
        key,
        persist,
      ]
    );


  /* =======================================================
     THÊM COMBO VÀO GIỎ
     ======================================================= */

  const addComboToCart =
    useCallback(
      (
        combo: Combo
      ) => {

        if (!key) {

          return {
            success: false,
            error:
              'Vui lòng đăng nhập để thêm combo vào giỏ hàng.',
          };
        }

        if (
          !combo ||
          !combo.items ||
          combo.items.length === 0
        ) {

          return {
            success: false,
            error:
              'Combo chưa có sản phẩm.',
          };
        }


        /*
         * Lấy danh sách sản phẩm hiện tại
         */
        const products =
          loadJSON<Product[]>(
            'products',
            []
          );


        /*
         * Kiểm tra combo có thể mua được
         */
        const maxComboQuantity =
          getComboMaxQuantity(
            combo,
            products
          );


        /*
         * Nếu có bất kỳ sản phẩm
         * hết hàng / không đủ số lượng
         */
        if (
          maxComboQuantity <= 0
        ) {

          return {
            success: false,
            error:
              'Combo hiện không thể mua vì có sản phẩm hết hàng hoặc không đủ tồn kho.',
          };
        }


        /*
         * Dùng ID riêng cho combo
         *
         * Ví dụ:
         * combo:combo-nhap-hoc
         */
        const comboCartId =
          `combo:${combo.id}`;


        /*
         * Kiểm tra combo đã có trong giỏ chưa
         */
        const existing =
          items.find(
            (item) =>
              item.kind ===
                'combo' &&
              item.comboId ===
                combo.id
          );


        const currentQuantity =
          existing?.quantity ?? 0;


        /*
         * Nếu thêm 1 combo nữa
         * nhưng vượt tồn kho
         */
        if (
          currentQuantity >=
          maxComboQuantity
        ) {

          return {
            success: false,
            error:
              `Combo chỉ còn tối đa ${maxComboQuantity} bộ.`,
          };
        }


        /*
         * Đồng bộ thông tin sản phẩm
         * trong combo với catalog hiện tại
         */
        const comboItems =
          combo.items.map(
            (item) => {

              const product =
                products.find(
                  (p) =>
                    p.id ===
                    item.productId
                );

              return {
                productId:
                  item.productId,

                name:
                  product?.name ??
                  item.name,

                price:
                  product?.price ??
                  item.price,

                image:
                  product?.image ??
                  item.image,

                images:
                  product?.images?.length
                    ? product.images
                    : item.images ??
                      (
                        item.image
                          ? [item.image]
                          : []
                      ),

                quantity:
                  item.quantity,
              };
            }
          );


        /*
         * Ảnh đại diện combo
         */
        const comboImage =
          combo.image ||
          comboItems[0]?.image ||
          '';


        /*
         * Tạo CartItem dạng COMBO
         */
        const newComboItem:
          CartItem = {

          /*
           * Quan trọng:
           * productId không trùng
           * với sản phẩm thật
           */
          productId:
            comboCartId,

          name:
            combo.name,

          price:
            combo.price,

          image:
            comboImage,

          quantity:
            currentQuantity + 1,

          kind:
            'combo',

          comboId:
            combo.id,

          comboItems:
            comboItems,
        };


        /*
         * Nếu combo đã tồn tại:
         * tăng quantity
         *
         * Nếu chưa:
         * thêm dòng mới
         */
        const next =
          existing

            ? items.map(
                (item) =>
                  item.kind ===
                    'combo' &&
                  item.comboId ===
                    combo.id
                    ? newComboItem
                    : item
              )

            : [
                ...items,
                newComboItem,
              ];


        persist(next);


        return {
          success: true,
        };
      },
      [
        items,
        key,
        persist,
      ]
    );


  /* =======================================================
     XÓA KHỎI GIỎ
     ======================================================= */

  const removeFromCart =
    useCallback(
      (
        productId: string
      ) => {

        persist(
          items.filter(
            (item) =>
              item.productId !==
              productId
          )
        );
      },
      [
        items,
        persist,
      ]
    );


  /* =======================================================
     CẬP NHẬT SỐ LƯỢNG
     ======================================================= */

  const updateQuantity =
    useCallback(
      (
        productId: string,
        quantity: number
      ) => {

        if (
          quantity <= 0
        ) {

          removeFromCart(
            productId
          );

          return;
        }


        const currentItem =
          items.find(
            (item) =>
              item.productId ===
              productId
          );


        if (!currentItem) {
          return;
        }


        /* =================================================
           TRƯỜNG HỢP COMBO
           ================================================= */

        if (
          currentItem.kind ===
            'combo' &&
          currentItem.comboItems
        ) {

          const products =
            loadJSON<Product[]>(
              'products',
              []
            );


          let maxComboQuantity =
            Number.POSITIVE_INFINITY;


          for (
            const child
            of currentItem.comboItems
          ) {

            const product =
              products.find(
                (p) =>
                  p.id ===
                  child.productId
              );


            if (!product) {

              maxComboQuantity =
                0;

              break;
            }


            const required =
              Math.max(
                child.quantity,
                1
              );


            const possible =
              Math.floor(
                Math.max(
                  product.stock ?? 0,
                  0
                ) /
                required
              );


            maxComboQuantity =
              Math.min(
                maxComboQuantity,
                possible
              );
          }


          if (
            !Number.isFinite(
              maxComboQuantity
            )
          ) {
            maxComboQuantity = 0;
          }


          const safeQuantity =
            Math.min(
              quantity,
              Math.max(
                0,
                maxComboQuantity
              )
            );


          if (
            safeQuantity <= 0
          ) {

            removeFromCart(
              productId
            );

            return;
          }


          persist(
            items.map(
              (item) =>
                item.productId ===
                productId
                  ? {
                      ...item,
                      quantity:
                        safeQuantity,
                    }
                  : item
            )
          );

          return;
        }


        /* =================================================
           TRƯỜNG HỢP SẢN PHẨM THƯỜNG
           ================================================= */

        const product =
          loadJSON<Product[]>(
            'products',
            []
          ).find(
            (p) =>
              p.id ===
              productId
          );


        const maxStock =
          Math.max(
            product?.stock ??
              quantity,
            0
          );


        const safeQuantity =
          Math.min(
            quantity,
            maxStock
          );


        if (
          safeQuantity <= 0
        ) {

          removeFromCart(
            productId
          );

          return;
        }


        persist(
          items.map(
            (item) =>
              item.productId ===
              productId
                ? {
                    ...item,
                    quantity:
                      safeQuantity,
                  }
                : item
          )
        );

      },
      [
        items,
        persist,
        removeFromCart,
      ]
    );


  /* =======================================================
     XÓA TOÀN BỘ GIỎ
     ======================================================= */

  const clearCart =
    useCallback(
      () => {
        persist([]);
      },
      [persist]
    );


  /* =======================================================
     TỔNG SỐ LƯỢNG
     ======================================================= */

  const totalItems =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.quantity,
      0
    );


  /* =======================================================
     TỔNG TIỀN
     
     Combo được tính là 1 item:
     
     Combo × 2
     499.000 × 2
     = 998.000
     ======================================================= */

  const totalPrice =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.price *
          item.quantity,
      0
    );


  /* =======================================================
     PROVIDER
     ======================================================= */

  return (
    <CartContext.Provider
      value={{
        items,

        addToCart,

        addComboToCart,

        removeFromCart,

        updateQuantity,

        clearCart,

        totalItems,

        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}


/* =========================================================
   HOOK
   ========================================================= */

export function useCart() {

  const ctx =
    useContext(
      CartContext
    );

  if (!ctx) {

    throw new Error(
      'useCart must be used within CartProvider'
    );
  }

  return ctx;
}