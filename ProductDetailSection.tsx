import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Product } from '@/types';
import { formatCurrency } from '@/lib/format';
import { SafeImage } from '@/components/SafeImage';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductDetailSectionProps {
  product: Product;
}

export function ProductDetailSection({ product }: ProductDetailSectionProps) {
  const discount = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  const gallery = Array.from(new Set([product.image, ...(product.images ?? [])])).filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  const select = (index: number) => setActiveIndex(Math.max(0, Math.min(index, gallery.length - 1)));
  const previous = () => select(activeIndex - 1 < 0 ? gallery.length - 1 : activeIndex - 1);
  const next = () => select(activeIndex + 1 >= gallery.length ? 0 : activeIndex + 1);

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
      <div className="min-w-0 space-y-3">
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
          <SafeImage src={gallery[activeIndex]} alt={`${product.name} - ảnh ${activeIndex + 1}`} loading="eager" className="aspect-square w-full" />
          {gallery.length > 1 && (
            <>
              <button type="button" onClick={previous} aria-label="Ảnh trước" className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"><ChevronLeft className="h-5 w-5" /></button>
              <button type="button" onClick={next} aria-label="Ảnh sau" className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"><ChevronRight className="h-5 w-5" /></button>
            </>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {gallery.map((img, idx) => (
            <button key={`${img}-${idx}`} type="button" onClick={() => select(idx)} className={`overflow-hidden rounded-xl border-2 bg-gray-50 ${idx === activeIndex ? 'border-indigo-600' : 'border-transparent'}`} aria-label={`Chọn ảnh ${idx + 1}`}>
              <SafeImage src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="aspect-square w-full" />
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400">{activeIndex + 1}/{gallery.length} ảnh</p>
      </div>

      <div className="min-w-0 space-y-5">
        <div>
          <div className="mb-2 flex flex-wrap gap-2">
            {product.isNew && <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">Mới</span>}
            {product.bestseller && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Bestseller</span>}
            {product.onSale && <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">Đang giảm giá</span>}
          </div>
          <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">{product.name}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1"><Star className="h-5 w-5 fill-amber-400 text-amber-400" /><span className="font-bold">{product.rating}</span></div>
          <span className="text-gray-300">|</span><span className="text-sm text-gray-600">{product.reviews} đánh giá</span>
          <span className="text-gray-300">|</span><span className="text-sm text-gray-600">Đã bán {product.sold}</span>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-bold text-indigo-600 sm:text-3xl">{formatCurrency(product.price)}</span>
            {product.oldPrice && <><span className="text-base text-gray-400 line-through">{formatCurrency(product.oldPrice)}</span><span className="rounded-lg bg-orange-500 px-2 py-0.5 text-sm font-bold text-white">-{discount}%</span></>}
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-gray-900">Mô tả sản phẩm</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{product.description}</p>

          {(product.descriptionSections ?? []).length > 0 && (
            <div className="mt-5 space-y-4">
              {(product.descriptionSections ?? []).map((section, index) => (
                <div key={`${section.title}-${index}`} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  {section.title && <h4 className="mb-1.5 font-semibold text-gray-900">{section.title}</h4>}
                  {section.content && <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{section.content}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-gray-900">Thông tin nhanh</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-gray-50 p-3"><span className="text-gray-500">Danh mục</span><Link to={`/danh-muc/${product.category}`} className="mt-1 block font-medium text-indigo-600 hover:underline">{product.category}</Link></div>
            <div className="rounded-lg bg-gray-50 p-3"><span className="text-gray-500">Tồn kho</span><span className={`mt-1 block font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{product.stock > 0 ? `${product.stock} sản phẩm` : 'Hết hàng'}</span></div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => <Link key={tag} to={`/tim-kiem?q=${encodeURIComponent(tag)}`} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200">#{tag}</Link>)}
        </div>
      </div>
    </div>
  );
}
