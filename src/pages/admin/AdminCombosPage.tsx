import { useMemo, useState } from 'react';
import { Edit2, PackagePlus, Plus, Trash2, X } from 'lucide-react';
import { getProducts } from '@/services/productService';
import {
  createCombo,
  deleteCombo,
  getCombos,
  updateCombo,
} from '@/services/comboService';
import { formatCurrency } from '@/lib/format';
import { useToast } from '@/contexts/ToastContext';
import type { Combo, ComboItem, Product } from '@/types';

const blank = {
  name: '',
  slug: '',
  description: '',
  image: '',
  price: 0,
  active: true,
};

export function AdminCombosPage() {
  const { showToast } = useToast();

  const products = useMemo(() => getProducts(), []);

  const [combos, setCombos] = useState(getCombos());
  const [editing, setEditing] = useState<Combo | null>(null);
  const [form, setForm] = useState(blank);
  const [items, setItems] = useState<ComboItem[]>([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const refresh = () => {
    setCombos(getCombos());
  };

  const openCreate = () => {
    setEditing(null);
    setForm(blank);
    setItems([]);
    setProductId('');
    setQuantity(1);
  };

  const openEdit = (combo: Combo) => {
    setEditing(combo);

    setForm({
      name: combo.name,
      slug: combo.slug,
      description: combo.description,
      image: combo.image,
      price: combo.price,
      active: combo.active,
    });

    setItems(
      combo.items.map((item) => ({
        ...item,
        images: item.images || [item.image],
      }))
    );

    setProductId('');
    setQuantity(1);
  };

  /*
   * THÊM SẢN PHẨM VÀO COMBO
   *
   * Một combo có thể có nhiều sản phẩm.
   * Mỗi sản phẩm có thể có nhiều ảnh.
   */
  const addProduct = () => {
    const product = products.find((p) => p.id === productId);

    if (!product) {
      showToast('Vui lòng chọn sản phẩm', 'error');
      return;
    }

    setItems((current) => {
      const found = current.find(
        (item) => item.productId === product.id
      );

      // Nếu sản phẩm đã có trong combo
      if (found) {
        return current.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,

                // Cập nhật đầy đủ ảnh mới nhất
                image: product.image,
                images: product.images?.length
                  ? product.images
                  : [product.image],
              }
            : item
        );
      }

      // Nếu sản phẩm chưa có trong combo
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          price: product.price,

          // Ảnh đại diện
          image: product.image,

          // TOÀN BỘ ảnh của sản phẩm
          images: product.images?.length
            ? product.images
            : [product.image],

          quantity,
        },
      ];
    });

    setProductId('');
    setQuantity(1);
  };

  const removeProduct = (id: string) => {
    setItems((current) =>
      current.filter((item) => item.productId !== id)
    );
  };

  const originalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showToast('Vui lòng nhập tên combo', 'error');
      return;
    }

    if (!items.length) {
      showToast(
        'Hãy thêm ít nhất 1 sản phẩm vào combo',
        'error'
      );
      return;
    }

    const price =
      Number(form.price) > 0
        ? Math.min(Number(form.price), originalPrice)
        : originalPrice;

    const slug =
      form.slug.trim() ||
      form.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

    const payload = {
      ...form,
      name: form.name.trim(),
      slug,
      items,
      price,
    };

    try {
      if (editing) {
        await updateCombo(editing.id, payload);
      } else {
        await createCombo(payload);
      }

      refresh();
      openCreate();

      showToast(
        editing
          ? 'Đã cập nhật combo'
          : 'Đã tạo combo',
        'success'
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Không thể lưu combo',
        'error'
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa combo này?')) return;

    try {
      await deleteCombo(id);

      refresh();

      showToast(
        'Đã xóa combo',
        'info'
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Không thể xóa combo',
        'error'
      );
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý Combo
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Tạo combo bằng nhiều sản phẩm đang có trong kho.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Combo mới
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">

        {/* DANH SÁCH COMBO */}
        <div className="space-y-4">

          {combos.map((combo) => (
            <div
              key={combo.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >

              <div className="flex items-start justify-between gap-4">

                <div>
                  <h2 className="font-bold text-gray-900">
                    {combo.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {combo.description}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    combo.active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {combo.active
                    ? 'Đang bán'
                    : 'Ẩn'}
                </span>

              </div>

              {/* SẢN PHẨM TRONG COMBO */}
              <div className="mt-4 space-y-3">

                {combo.items.map((item) => (

                  <div
                    key={item.productId}
                    className="rounded-xl bg-gray-50 p-3"
                  >

                    <div className="flex items-center gap-3">

                      {/* NHIỀU ẢNH */}
                      <div className="flex shrink-0 gap-1">

                        {(item.images || [item.image])
                          .slice(0, 4)
                          .map((img, index) => (
                            <img
                              key={`${item.productId}-${index}`}
                              src={img}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ))}

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-medium text-gray-900">
                          {item.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {formatCurrency(item.price)}
                        </p>

                      </div>

                      <span className="font-semibold">
                        ×{item.quantity}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

              <div className="mt-4 flex items-center justify-between">

                <strong className="text-indigo-600">
                  {formatCurrency(combo.price)}
                </strong>

                <div className="flex gap-2">

                  <button
                    onClick={() => openEdit(combo)}
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Edit2 className="mr-1 inline h-4 w-4" />
                    Sửa
                  </button>

                  <button
                    onClick={() => handleDelete(combo.id)}
                    className="rounded-lg border border-rose-100 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="mr-1 inline h-4 w-4" />
                    Xóa
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>

        {/* FORM COMBO */}
        <form
          onSubmit={submit}
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
        >

          <div className="flex items-center justify-between">

            <h2 className="font-bold text-gray-900">
              {editing
                ? 'Chỉnh sửa combo'
                : 'Tạo combo'}
            </h2>

            {editing && (
              <button
                type="button"
                onClick={openCreate}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}

          </div>

          <div className="mt-4 space-y-3">

            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              placeholder="Tên combo"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
            />

            <input
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value,
                })
              }
              placeholder="Slug (có thể bỏ trống)"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
            />

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              placeholder="Mô tả combo"
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
            />

            <input
              value={form.image}
              onChange={(e) =>
                setForm({
                  ...form,
                  image: e.target.value,
                })
              }
              placeholder="URL ảnh combo (tùy chọn)"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm"
            />

            <label className="block text-sm font-medium text-gray-700">

              Giá combo

              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: Number(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5"
              />

              <span className="mt-1 block text-xs text-gray-400">
                Để 0 = tự lấy tổng giá sản phẩm.
              </span>

            </label>

            <label className="flex items-center gap-2 text-sm">

              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) =>
                  setForm({
                    ...form,
                    active: e.target.checked,
                  })
                }
              />

              Hiển thị combo cho khách

            </label>

          </div>

          {/* THÊM SẢN PHẨM */}
          <div className="mt-6 border-t pt-5">

            <h3 className="flex items-center gap-2 font-semibold">

              <PackagePlus className="h-4 w-4 text-indigo-600" />

              Thêm sản phẩm hiện có

            </h3>

            <div className="mt-3 flex gap-2">

              <select
                value={productId}
                onChange={(e) =>
                  setProductId(e.target.value)
                }
                className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              >

                <option value="">
                  Chọn sản phẩm...
                </option>

                {products.map((p: Product) => (
                  <option
                    key={p.id}
                    value={p.id}
                  >
                    {p.name} — {formatCurrency(p.price)}
                  </option>
                ))}

              </select>

              <input
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(
                      1,
                      Number(e.target.value)
                    )
                  )
                }
                className="w-20 rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              />

              <button
                type="button"
                onClick={addProduct}
                className="rounded-xl bg-gray-900 px-3 text-white hover:bg-gray-800"
              >
                +
              </button>

            </div>

          </div>

          {/* SẢN PHẨM ĐÃ CHỌN */}
          <div className="mt-4 space-y-3">

            {items.map((item) => (

              <div
                key={item.productId}
                className="rounded-xl border border-gray-100 p-3"
              >

                <div className="flex items-center gap-3">

                  {/* HIỂN THỊ NHIỀU ẢNH */}
                  <div className="flex shrink-0 gap-1">

                    {(item.images || [item.image])
                      .slice(0, 4)
                      .map((img, index) => (
                        <img
                          key={`${item.productId}-${index}`}
                          src={img}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ))}

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-medium">
                      {item.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {formatCurrency(item.price)}
                      {' × '}
                      {item.quantity}
                    </p>

                    <p className="mt-1 text-xs text-indigo-500">
                      {(item.images || [item.image]).length} ảnh
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeProduct(item.productId)
                    }
                    className="text-gray-400 hover:text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </button>

                </div>

              </div>

            ))}

          </div>

          {/* GIÁ */}
          <div className="mt-5 rounded-xl bg-indigo-50 p-3 text-sm">

            <div className="flex justify-between">
              <span>
                Tổng giá sản phẩm
              </span>

              <strong>
                {formatCurrency(originalPrice)}
              </strong>
            </div>

            <div className="mt-1 flex justify-between">

              <span>
                Giá combo
              </span>

              <strong className="text-indigo-700">
                {formatCurrency(
                  form.price || originalPrice
                )}
              </strong>

            </div>

          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            {editing
              ? 'Lưu thay đổi'
              : 'Tạo combo'}
          </button>

        </form>

      </div>

    </div>
  );
}