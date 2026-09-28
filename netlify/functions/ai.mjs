const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(body),
});

function extractText(payload) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((part) => part?.text || '').join('');
  return '';
}

async function openAI(messages, maxTokens = 900) {
  if (!API_KEY) throw new Error('MISSING_API_KEY');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.2, max_tokens: maxTokens }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `AI API error ${response.status}`);
  return data;
}

function parseJson(text) {
  return JSON.parse(text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim());
}

function fallbackSearchIntent(query) {
  const normalized = query.toLowerCase();
  const result = { textQuery: query, categories: [], minPrice: null, maxPrice: null, minRating: null, saleOnly: false, inStockOnly: true, sort: 'default', aiUnavailable: true };
  const price = normalized.match(/(?:dưới|duoi|<=?)\s*(\d+(?:[.,]\d+)?)\s*(k|nghìn|nghin|tr|triệu|trieu)?/i);
  if (price) result.maxPrice = (price[2] || '').toLowerCase().startsWith('tr') ? Number(price[1].replace(',', '.')) * 1_000_000 : Number(price[1].replace(',', '.')) * 1_000;
  if (/bán chạy|ban chay/i.test(normalized)) result.sort = 'sold';
  if (/mới nhất|moi nhat/i.test(normalized)) result.sort = 'newest';
  if (/giá thấp|rẻ|thấp nhất/i.test(normalized)) result.sort = 'price-asc';
  if (/giá cao|cao nhất/i.test(normalized)) result.sort = 'price-desc';
  if (/đánh giá|danh gia|rating/i.test(normalized)) result.sort = 'rating';
  if (/giảm giá|giam gia|sale|khuyến mãi|khuyen mai/i.test(normalized)) result.saleOnly = true;
  return result;
}

async function handleSearchIntent(body) {
  const query = String(body?.query || '').trim();
  if (!query || !API_KEY) return fallbackSearchIntent(query);
  const categories = Array.isArray(body?.categories) ? body.categories : [];
  const prompt = `Bạn là bộ phân tích tìm kiếm cho website UniDrop. Người dùng viết tiếng Việt tự nhiên. Chuyển yêu cầu thành JSON để frontend lọc catalog. Không bịa sản phẩm. textQuery chỉ chứa từ khóa sản phẩm/nhu cầu, không chứa giá, rating, sort hoặc điều kiện tồn kho. Danh mục hợp lệ: ${JSON.stringify(categories)}. Yêu cầu: ${query}. Chỉ trả JSON schema: {"textQuery":string,"categories":string[],"minPrice":number|null,"maxPrice":number|null,"minRating":number|null,"saleOnly":boolean,"inStockOnly":boolean,"sort":"default"|"popular"|"sold"|"newest"|"price-asc"|"price-desc"|"rating"}`;
  try {
    const data = await openAI([{ role: 'system', content: 'Chỉ xuất JSON hợp lệ, không markdown.' }, { role: 'user', content: prompt }], 500);
    return parseJson(extractText(data));
  } catch { return fallbackSearchIntent(query); }
}

async function handleAssistant(body) {
  const message = String(body?.message || '').trim();
  const products = Array.isArray(body?.products) ? body.products : [];
  if (!message) return { answer: 'Bạn muốn mình tư vấn sản phẩm nào?' };
  if (!API_KEY) return { answer: 'AI chưa được kết nối. Bạn vẫn có thể dùng tìm kiếm, bộ lọc và sắp xếp thông thường.', aiUnavailable: true };
  const context = products.slice(0, 50).map((p) => JSON.stringify({ id:p.id,name:p.name,category:p.category,price:p.price,rating:p.rating,sold:p.sold,stock:p.stock,tags:p.tags })).join('\n');
  const prompt = `Bạn là trợ lý mua sắm UniDrop dành cho sinh viên Việt Nam. Chỉ tư vấn dựa trên catalog được cung cấp. Không bịa giá, tồn kho hoặc tính năng. Nếu phù hợp, nêu 2-5 sản phẩm bằng đúng tên. Trả lời ngắn gọn bằng tiếng Việt. Câu hỏi: ${message}\nCatalog:\n${context}`;
  try {
    const data = await openAI([{ role: 'system', content: 'Tư vấn mua sắm hữu ích, trung thực, không bịa dữ liệu.' }, { role: 'user', content: prompt }], 900);
    return { answer: extractText(data) };
  } catch { return { answer: 'Hiện AI chưa phản hồi được. Bạn có thể dùng tìm kiếm và bộ lọc sản phẩm.', aiUnavailable: true }; }
}

async function handleImage(body) {
  const imageData = String(body?.imageData || '');
  const mimeType = String(body?.mimeType || 'image/jpeg');
  if (!imageData.startsWith('data:image/')) return { analysis: null, aiUnavailable: true };
  if (!API_KEY) return { analysis: null, aiUnavailable: true };
  const prompt = 'Phân tích ảnh sản phẩm cho UniDrop. Nhận diện loại sản phẩm, màu sắc chính, phong cách, vật liệu nếu nhìn thấy và từ khóa tìm kiếm. Không khẳng định chi tiết không thể nhìn thấy. Chỉ trả JSON: {"name":"","category":"","colors":[],"style":[],"keywords":[],"description":""}';
  const data = await openAI([{ role: 'user', content: [{ type:'text', text:prompt }, { type:'image_url', image_url:{ url:imageData.includes(',') ? `data:${mimeType};base64,${imageData.split(',')[1]}` : `data:${mimeType};base64,${imageData}` } }] }], 700);
  return { analysis: parseJson(extractText(data)) };
}

export default async (req) => {
  if (req.httpMethod === 'OPTIONS') return { statusCode: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: '' };
  try {
    const body = JSON.parse(req.body || '{}');
    const path = req.path || '';
    if (path.endsWith('/search-intent')) return json(200, await handleSearchIntent(body));
    if (path.endsWith('/assistant')) return json(200, await handleAssistant(body));
    if (path.endsWith('/analyze-image')) return json(200, await handleImage(body));
    return json(404, { error: 'Not found' });
  } catch (error) {
    return json(500, { error: error instanceof Error ? error.message : 'AI service error' });
  }
};
