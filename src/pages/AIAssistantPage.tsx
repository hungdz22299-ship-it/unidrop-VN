import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Camera, ChevronRight, Image as ImageIcon, Search, Send, Sparkles, X } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { categories } from '@/data/categories';
import { queryProducts, type ProductSort } from '@/services/productService';
import { aiAnalyzeImage, aiSearchIntent, aiShoppingAssistant, type AIImageAnalysis } from '@/services/aiService';
import type { Product } from '@/types';
import type { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/format';

export function AIAssistantPage() {
  const [mode, setMode] = useState<'search' | 'assistant' | 'image'>('search');
  const [query, setQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [intent, setIntent] = useState<Awaited<ReturnType<typeof aiSearchIntent>> | null>(null);
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [analysis, setAnalysis] = useState<AIImageAnalysis | null>(null);
  const [imageResults, setImageResults] = useState<Product[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const popularProducts = useMemo(() => queryProducts('', {}, 'popular').slice(0, 50), []);

  const modes: Array<[typeof mode, string, LucideIcon]> = [
    ['search', 'AI tìm kiếm', Search],
    ['assistant', 'Trợ lý mua sắm', Bot],
    ['image', 'Phân tích ảnh', Camera],
  ];

  const runSearch = async () => {
    if (!query.trim()) return;
    setSearchLoading(true); setSearchError('');
    try {
      const ai = await aiSearchIntent(query, categories.map((c) => ({ slug: c.slug, name: c.name })));
      setIntent(ai);
      const normalizedTextQuery = typeof ai.textQuery === 'string' ? ai.textQuery.trim() : '';
      const safeTextQuery = normalizedTextQuery || query.trim();
      const safeCategories = Array.isArray(ai.categories) ? ai.categories.filter((slug) => categories.some((c) => c.slug === slug)) : [];
      const list = queryProducts(safeTextQuery, {
        categories: safeCategories,
        minPrice: Number.isFinite(ai.minPrice ?? NaN) ? ai.minPrice ?? undefined : undefined,
        maxPrice: Number.isFinite(ai.maxPrice ?? NaN) ? ai.maxPrice ?? undefined : undefined,
        minRating: Number.isFinite(ai.minRating ?? NaN) ? ai.minRating ?? undefined : undefined,
        saleOnly: Boolean(ai.saleOnly),
        inStockOnly: ai.inStockOnly !== false,
      }, ai.sort as ProductSort);

      // Nếu AI trả về ý định quá rộng hoặc lỗi, thử tìm trực tiếp theo
      // câu người dùng. Tuyệt đối không hiển thị sản phẩm không liên quan.
      setResults(list.length > 0 ? list : queryProducts(query.trim()));
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Không thể kết nối AI.');
      setResults(queryProducts(query));
    } finally { setSearchLoading(false); }
  };

  const askAssistant = async () => {
    if (!message.trim()) return;
    setAssistantLoading(true);
    try {
      const data = await aiShoppingAssistant(message, popularProducts);
      setAnswer(data.answer);
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : 'Không thể kết nối AI.');
    } finally { setAssistantLoading(false); }
  };

  const analyzeFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setImageError('Vui lòng chọn một file ảnh.'); return; }
    if (file.size > 8 * 1024 * 1024) { setImageError('Ảnh tối đa 8MB.'); return; }
    setImageLoading(true); setImageError(''); setAnalysis(null); setImageResults([]);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = await aiAnalyzeImage(String(reader.result), file.type);
        if (!data.analysis) throw new Error('AI chưa được cấu hình trên server.');
        setAnalysis(data.analysis);
        const terms = [...data.analysis.keywords, ...data.analysis.colors, ...data.analysis.style, data.analysis.name].join(' ');
        setImageResults(queryProducts(terms).slice(0, 8));
      } catch (error) {
        setImageError(error instanceof Error ? error.message : 'Không thể phân tích ảnh.');
      } finally { setImageLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-gray-500"><Link to="/" className="hover:text-indigo-600">Trang chủ</Link><ChevronRight className="h-4 w-4" /><span className="font-medium text-gray-800">UniDrop AI</span></nav>
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-700 to-violet-700 p-6 text-white sm:p-8">
        <div className="flex items-start gap-4"><div className="rounded-2xl bg-white/15 p-3"><Sparkles className="h-7 w-7" /></div><div><p className="text-sm font-semibold text-indigo-100">Trợ lý mua sắm UniDrop</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Tìm đúng món nhanh hơn bằng AI</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">Hiểu yêu cầu tự nhiên, tư vấn theo catalog UniDrop và phân tích ảnh sản phẩm. Giỏ hàng, yêu thích, đơn hàng và dữ liệu tài khoản vẫn chạy cục bộ như trước.</p></div></div>
      </div>
      <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
        {modes.map(([key, label, Icon]) => <button key={key} onClick={() => setMode(key)} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold ${mode === key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}><Icon className="h-4 w-4" />{label}</button>)}
      </div>

      {mode === 'search' && <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-bold">AI tìm kiếm sản phẩm</h2><p className="mt-1 text-sm text-gray-500">Ví dụ: “áo khoác nam dưới 300k”, “đồ setup bàn dưới 500k”.</p><div className="mt-4 flex gap-2"><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runSearch()} placeholder="Bạn đang cần tìm gì?" className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /><button onClick={runSearch} disabled={searchLoading} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60"><Search className="h-4 w-4" />{searchLoading ? 'Đang hiểu...' : 'Tìm bằng AI'}</button></div>{searchError && <p className="mt-3 text-sm text-amber-600">{searchError}</p>}{intent && <div className="mt-4 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">AI hiểu: {intent.categories.length ? intent.categories.join(', ') : 'toàn bộ danh mục'}{intent.maxPrice ? ` · tối đa ${formatCurrency(intent.maxPrice)}` : ''}{intent.minRating ? ` · từ ${intent.minRating}★` : ''}{intent.saleOnly ? ' · đang giảm giá' : ''}</div>}{results.length > 0 && <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{results.map((p) => <ProductCard key={p.id} product={p} />)}</div>}{query && !searchLoading && results.length === 0 && <p className="mt-6 text-center text-sm text-gray-500">Chưa tìm thấy sản phẩm phù hợp.</p>}</section>}

      {mode === 'assistant' && <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-bold">Trợ lý mua sắm</h2><p className="mt-1 text-sm text-gray-500">Hỏi về nhu cầu sinh viên, ngân sách hoặc cách chọn sản phẩm.</p><div className="mt-4 flex gap-2"><textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ví dụ: Sinh viên năm nhất nên mua gì để setup góc học tập?" rows={4} className="min-w-0 flex-1 rounded-xl border border-gray-200 p-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /><button onClick={askAssistant} disabled={assistantLoading} className="self-end rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white disabled:opacity-60"><Send className="mr-2 inline h-4 w-4" />{assistantLoading ? 'Đang trả lời...' : 'Hỏi AI'}</button></div>{answer && <div className="mt-5 whitespace-pre-wrap rounded-2xl bg-indigo-50 p-5 text-sm leading-7 text-gray-800">{answer}</div>}</section>}

      {mode === 'image' && <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-bold">AI phân tích ảnh sản phẩm</h2><p className="mt-1 text-sm text-gray-500">Tải ảnh lên để nhận diện loại sản phẩm, màu sắc, phong cách và tìm sản phẩm tương tự trong catalog.</p><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && analyzeFile(e.target.files[0])} /><button onClick={() => fileRef.current?.click()} disabled={imageLoading} className="mt-5 flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-12 text-center hover:border-indigo-400 hover:bg-indigo-50/40"><ImageIcon className="h-10 w-10 text-indigo-500" /><span className="mt-3 font-semibold">{imageLoading ? 'AI đang phân tích...' : 'Chọn ảnh sản phẩm'}</span><span className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP · tối đa 8MB</span></button>{imageError && <p className="mt-3 text-sm text-rose-600">{imageError}</p>}{analysis && <div className="mt-6 rounded-2xl bg-gray-50 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Kết quả phân tích</p><h3 className="mt-1 text-lg font-bold">{analysis.name || 'Sản phẩm nhận diện được'}</h3></div><button onClick={() => {setAnalysis(null); setImageResults([]);}} aria-label="Xóa kết quả" className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-gray-700"><X className="h-4 w-4" /></button></div><p className="mt-3 text-sm text-gray-600">{analysis.description}</p><div className="mt-3 flex flex-wrap gap-2">{[...analysis.colors, ...analysis.style, ...analysis.keywords].slice(0, 12).map((tag) => <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs text-gray-600">{tag}</span>)}</div></div>}{imageResults.length > 0 && <div className="mt-6"><h3 className="mb-3 text-lg font-bold">Sản phẩm tương tự</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{imageResults.map((p) => <ProductCard key={p.id} product={p} />)}</div></div>}</section>}
    </div>
  );
}
