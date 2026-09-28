import { useState, useMemo } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, uploadProductImage, deleteProductImageByUrl } from '@/services/productService';
import { useToast } from '@/contexts/ToastContext';
import { Modal } from '@/components/Modal';
import { formatCurrency, formatNumber } from '@/lib/format';
import { categories } from '@/data/categories';
import type { Product, ProductDescriptionSection } from '@/types';
import { Plus, Edit2, Trash2, Search, Package, Upload } from 'lucide-react';

const emptyForm: Omit<Product, 'createdAt'> = {
  id: '',
  name: '',
  slug: '',
  category: 'goc-hoc-tap',
  price: 0,
  oldPrice: undefined,
  image: '',
  images: [],
  rating: 5,
  reviews: 0,
  sold: 0,
  stock: 100,
  description: '',
  descriptionSections: [],
  tags: [],
  featured: false,
  bestseller: false,
  isNew: true,
  onSale: false,
};

export function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>(getProducts());
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState('');
  const [descriptionSections, setDescriptionSections] = useState<ProductDescriptionSection[]>([]);
  const [uploadFolderId, setUploadFolderId] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, search]);

  const refresh = () => setProducts(getProducts());

  const handleAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setUploadFolderId(`draft-${crypto.randomUUID()}`);
    setTagInput('');
    setDescriptionSections([]);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setForm({ ...product });
    setEditingId(product.id);
    setUploadFolderId(product.id);
    setTagInput(product.tags.join(', '));
    setDescriptionSections(product.descriptionSections ?? []);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await deleteProduct(id);
      refresh();
      showToast('Đã xóa sản phẩm', 'info');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể xóa sản phẩm', 'error');
    }
  };

  const compressImage = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const maxSize = 1400;
          const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * ratio));
          canvas.height = Math.max(1, Math.round(image.height * ratio));
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Không thể xử lý ảnh')); return; }
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Không thể nén ảnh')), 'image/jpeg', 0.84);
        };
        image.onerror = () => reject(new Error('Ảnh không hợp lệ'));
        image.src = String(reader.result);
      };
      reader.onerror = () => reject(new Error('Không thể đọc ảnh'));
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files).slice(0, Math.max(0, 12 - (form.images?.length ?? 0)));
    if (files.length > selected.length) showToast('Tối đa 12 ảnh cho một sản phẩm', 'info');
    const invalid = selected.find((file) => !file.type.startsWith('image/'));
    if (invalid) { showToast('Vui lòng chỉ chọn tệp hình ảnh', 'error'); return; }
    if (!uploadFolderId) { showToast('Vui lòng mở lại biểu mẫu sản phẩm', 'error'); return; }

    try {
      const uploaded = await Promise.all(selected.map(async (file) => uploadProductImage(await compressImage(file), uploadFolderId)));
      setForm((current) => {
        const existing = current.images ?? [];
        const merged = [...existing, ...uploaded].filter(Boolean).slice(0, 12);
        return { ...current, image: merged[0] ?? current.image, images: merged };
      });
      showToast(`Đã upload ${uploaded.length} ảnh lên Supabase`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể upload ảnh', 'error');
    }
  };

  const removeImage = (index: number) => {
    setForm((current) => {
      const currentImages = current.images ?? [];
      const removed = currentImages[index];
      const images = currentImages.filter((_, i) => i !== index);
      if (removed) void deleteProductImageByUrl(removed);
      return { ...current, images, image: images[0] ?? '' };
    });
  };

  const setPrimaryImage = (index: number) => {
    setForm((current) => {
      const images = [...(current.images ?? [])];
      if (!images[index]) return current;
      const [primary] = images.splice(index, 1);
      images.unshift(primary);
      return { ...current, image: primary, images };
    });
  };

  const addDescriptionSection = () => {
    setDescriptionSections((items) => [...items, { title: '', content: '' }]);
  };

  const updateDescriptionSection = (index: number, field: keyof ProductDescriptionSection, value: string) => {
    setDescriptionSections((items) =>
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeDescriptionSection = (index: number) => {
    setDescriptionSections((items) => items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    const images = (form.images ?? []).filter(Boolean);
    const primaryImage = form.image || images[0] || '';
    const cleanSections = descriptionSections
      .map((item) => ({ title: item.title.trim(), content: item.content.trim() }))
      .filter((item) => item.title || item.content);

    try {
      if (editingId) {
        await updateProduct(editingId, { ...form, image: primaryImage, images, slug, tags, descriptionSections: cleanSections });
        showToast('Đã cập nhật sản phẩm', 'success');
      } else {
        const newProduct: Product = {
          ...form,
          id: `p${Date.now()}`,
          image: primaryImage,
          slug,
          tags,
          images,
          descriptionSections: cleanSections,
          createdAt: new Date().toISOString(),
        };
        await addProduct(newProduct);
        showToast('Đã thêm sản phẩm mới', 'success');
      }
      refresh();
      setShowForm(false);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể lưu sản phẩm', 'error');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="mt-1 text-sm text-gray-500">{products.length} sản phẩm</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Sản phẩm</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Tồn kho</th>
              <th className="px-4 py-3">Đã bán</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-medium text-gray-900">{product.name}</p>
                      <div className="flex gap-1">
                        {product.bestseller && <span className="rounded bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">HOT</span>}
                        {product.isNew && <span className="rounded bg-indigo-100 px-1.5 text-[10px] font-bold text-indigo-700">MỚI</span>}
                        {product.onSale && <span className="rounded bg-rose-100 px-1.5 text-[10px] font-bold text-rose-700">SALE</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{categories.find((c) => c.slug === product.category)?.name || product.category}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(product.price)}</td>
                <td className="px-4 py-3">
                  <span className={product.stock < 50 ? 'font-semibold text-rose-600' : 'text-gray-600'}>{product.stock}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{formatNumber(product.sold)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-gray-400">
            <Package className="mb-2 h-10 w-10" />
            <p className="text-sm">Không có sản phẩm nào</p>
          </div>
        )}
      </div>

      {/* Product form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Tên sản phẩm</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Danh mục</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Giá (VND)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                required
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Giá cũ (VND)</label>
              <input
                type="number"
                value={form.oldPrice || ''}
                onChange={(e) => setForm({ ...form, oldPrice: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Tồn kho</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Ảnh sản phẩm</label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <Upload className="h-4 w-4" />
                Chọn nhiều ảnh
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    void handleImageUpload(e.target.files);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
              <span className="text-xs text-gray-400">Tối đa 12 ảnh • ảnh sẽ được nén tự động</span>
            </div>

            {(form.images?.length ?? 0) > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {form.images.map((img, index) => (
                  <div key={`${img.slice(0, 30)}-${index}`} className="relative">
                    <img src={img} alt={`Ảnh ${index + 1}`} className={`aspect-square w-full rounded-xl object-cover ring-1 ${index === 0 ? 'ring-2 ring-indigo-600' : 'ring-gray-200'}`} />
                    {index === 0 && (
                      <span className="absolute left-1.5 top-1.5 rounded-md bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Ảnh chính</span>
                    )}
                    <div className="absolute inset-x-1 bottom-1 flex gap-1">
                      {index !== 0 && (
                        <button type="button" onClick={() => setPrimaryImage(index)} className="flex-1 rounded-md bg-white/95 px-1 py-1 text-[10px] font-semibold text-gray-700 shadow hover:bg-white">
                          Đặt chính
                        </button>
                      )}
                      <button type="button" onClick={() => removeImage(index)} className="rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-rose-600 shadow hover:bg-white">
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <input
                type="url"
                placeholder="Hoặc thêm ảnh bằng URL https://..."
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  const value = e.currentTarget.value.trim();
                  if (!value) return;
                  setForm((current) => {
                    const images = [...(current.images ?? []), value].slice(0, 12);
                    return { ...current, image: current.image || value, images };
                  });
                  e.currentTarget.value = '';
                }}
              />
              <span className="self-center text-xs text-gray-400">Enter để thêm</span>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label className="block text-sm font-medium text-gray-700">Mô tả sản phẩm</label>
              <button
                type="button"
                onClick={addDescriptionSection}
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                + Thêm phần mô tả
              </button>
            </div>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Mô tả ngắn tổng quan về sản phẩm..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />

            {descriptionSections.length > 0 && (
              <div className="mt-3 space-y-3">
                {descriptionSections.map((section, index) => (
                  <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-500">Phần mô tả {index + 1}</span>
                      <button type="button" onClick={() => removeDescriptionSection(index)} className="text-xs font-medium text-rose-600 hover:underline">
                        Xóa phần này
                      </button>
                    </div>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateDescriptionSection(index, 'title', e.target.value)}
                      placeholder="Tiêu đề, ví dụ: Đặc điểm nổi bật"
                      className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                    <textarea
                      value={section.content}
                      onChange={(e) => updateDescriptionSection(index, 'content', e.target.value)}
                      rows={3}
                      placeholder="Nội dung chi tiết..."
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tags (phân tách bằng dấu phẩy)</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="sổ tay, a5, campus"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { key: 'featured', label: 'Nổi bật' },
              { key: 'bestseller', label: 'Bán chạy' },
              { key: 'isNew', label: 'Mới' },
              { key: 'onSale', label: 'Đang giảm giá' },
            ].map((flag) => (
              <label key={flag.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form[flag.key as keyof typeof form] as boolean}
                  onChange={(e) => setForm({ ...form, [flag.key]: e.target.checked })}
                  className="h-4 w-4 accent-indigo-600"
                />
                {flag.label}
              </label>
            ))}
          </div>

          <div className="flex gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {editingId ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
