import http from 'node:http';

const PORT = Number(process.env.AI_PORT || 8787);
const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-5-mini';
const ORIGIN = process.env.AI_ALLOWED_ORIGIN || '*';

function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  });
  res.end(JSON.stringify(data));
}

async function readBody(req, maxBytes = 12 * 1024 * 1024) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) throw new Error('REQUEST_TOO_LARGE');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function extractText(payload) {
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((part) => part?.text || '').join('');
  return '';
}

async function openAI(messages, options = {}) {
  if (!API_KEY) throw new Error('MISSING_API_KEY');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: options.temperature ?? 0.2,
      max_tokens: options.maxTokens ?? 900,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || `AI API error ${response.status}`;
    throw new Error(message);
  }
  return data;
}

function parseJson(text) {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
}

function fallbackSearchIntent(query) {
  const normalized = query.toLowerCase();
  const intent = {
    textQuery: query,
    categories: [],
    minPrice: null,
    maxPrice: null,
    minRating: null,
    saleOnly: false,
    inStockOnly: true,
    sort: 'default',
  };
  const price = normalized.match(/(?:dưới|duoi|<=?)\s*(\d+(?:[.,]\d+)?)\s*(k|nghìn|nghin|tr|triệu|trieu)?/i);
  if (price) {
    const n = Number(price[1].replace(',', '.'));
    const unit = (price[2] || '').toLowerCase();
    intent.maxPrice = unit.startsWith('tr') ? n * 1_000_000 : n * 1_000;
  }
  if (/bán chạy|ban chay|phổ biến|pho bien/i.test(normalized)) intent.sort = 'sold';
  if (/mới nhất|moi nhat/i.test(normalized)) intent.sort = 'newest';
  if (/giá thấp|rẻ|rẻ|thấp nhất|thap nhat/i.test(normalized)) intent.sort = 'price-asc';
  if (/giá cao|cao nhất|cao nhat/i.test(normalized)) intent.sort = 'price-desc';
  if (/đánh giá|danh gia|rating/i.test(normalized)) intent.sort = 'rating';
  if (/giảm giá|giam gia|sale|khuyến mãi|khuyen mai/i.test(normalized)) intent.saleOnly = true;
  return intent;
}

async function handleSearchIntent(body) {
  const query = String(body?.query || '').trim();
  if (!query) return fallbackSearchIntent('');
  if (!API_KEY) return { ...fallbackSearchIntent(query), aiUnavailable: true };
  const categories = Array.isArray(body?.categories) ? body.categories : [];
  const prompt = `Bạn là bộ phân tích tìm kiếm cho website UniDrop. Người dùng viết tiếng Việt tự nhiên. Hãy chuyển yêu cầu thành JSON để frontend lọc catalog cục bộ. Không bịa sản phẩm. textQuery chỉ chứa từ khóa sản phẩm/nhu cầu, KHÔNG chứa giá, số rating, từ khóa sắp xếp hay điều kiện còn hàng.\n\nDanh mục hợp lệ: ${JSON.stringify(categories)}\n\nYêu cầu: ${query}\n\nChỉ trả JSON đúng schema:\n{"textQuery":string,"categories":string[],"minPrice":number|null,"maxPrice":number|null,"minRating":number|null,"saleOnly":boolean,"inStockOnly":boolean,"sort":"default"|"popular"|"sold"|"newest"|"price-asc"|"price-desc"|"rating"}`;
  try {
    const data = await openAI([{ role: 'system', content: 'Chỉ xuất JSON hợp lệ, không markdown.' }, { role: 'user', content: prompt }], { maxTokens: 500 });
    return parseJson(extractText(data));
  } catch {
    return { ...fallbackSearchIntent(query), aiUnavailable: true };
  }
}

async function handleAssistant(body) {
  const message = String(body?.message || '').trim();
  const products = Array.isArray(body?.products) ? body.products : [];
  if (!message) return { answer: 'Bạn muốn mình tư vấn sản phẩm nào?' };
  if (!API_KEY) return { answer: 'AI chưa được kết nối. Bạn vẫn có thể dùng tìm kiếm, bộ lọc và sắp xếp thông thường.' , aiUnavailable: true };
  const context = products.slice(0, 50).map((p) => ({ id: p.id, name: p.name, category: p.category, price: p.price, rating: p.rating, sold: p.sold, stock: p.stock, tags: p.tags })).map(JSON.stringify).join('\n');
  const prompt = `Bạn là trợ lý mua sắm của UniDrop dành cho sinh viên Việt Nam. Chỉ tư vấn dựa trên catalog được cung cấp. Không bịa giá, tồn kho hoặc tính năng. Nếu phù hợp, nêu 2-5 sản phẩm bằng đúng tên trong catalog. Trả lời ngắn gọn, tự nhiên bằng tiếng Việt.\n\nCâu hỏi: ${message}\n\nCatalog:\n${context}`;
  try {
    const data = await openAI([{ role: 'system', content: 'Tư vấn mua sắm hữu ích, trung thực, không bịa dữ liệu.' }, { role: 'user', content: prompt }], { maxTokens: 900 });
    return { answer: extractText(data) };
  } catch (error) {
    return { answer: 'Hiện AI chưa phản hồi được. Bạn có thể dùng tìm kiếm và bộ lọc sản phẩm.', aiUnavailable: true, error: error.message };
  }
}

async function handleImage(body) {
  const imageData = String(body?.imageData || '');
  const mimeType = String(body?.mimeType || 'image/jpeg');
  if (!imageData.startsWith('data:image/')) throw new Error('INVALID_IMAGE');
  if (!API_KEY) return { analysis: null, aiUnavailable: true };
  const prompt = `Phân tích ảnh sản phẩm cho UniDrop. Nhận diện loại sản phẩm, màu sắc chính, phong cách, vật liệu nếu nhìn thấy và các từ khóa tìm kiếm. Không khẳng định chi tiết không thể nhìn thấy. Chỉ trả JSON:\n{"name":"","category":"","colors":[],"style":[],"keywords":[],"description":""}`;
  const dataUrl = imageData.includes(',') ? `data:${mimeType};base64,${imageData.split(',')[1]}` : `data:${mimeType};base64,${imageData}`;
  const data = await openAI([{ role: 'user', content: [
    { type: 'text', text: prompt },
    { type: 'image_url', image_url: { url: dataUrl } },
  ] }], { maxTokens: 700 });
  return { analysis: parseJson(extractText(data)) };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});

  // ✅ Route GET / trả về HTML
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
    });
    res.end(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>UniDrop AI Server</title>
        <style>
          body { font-family: Arial, sans-serif; background: #fff; color: #333; text-align: center; padding: 50px; }
          h1 { color: #0078d7; }
        </style>
      </head>
      <body>
        <h1>UniDrop AI server is running 🚀</h1>
        <p>Cổng: ${PORT}</p>
        <p>Model: ${MODEL}</p>
      </body>
      </html>
    `);
    return;
  }

  if (req.method !== 'POST') return send(res, 404, { error: 'Not found' });
  try {
    const raw = await readBody(req);
    const body = JSON.parse(raw || '{}');
    if (req.url === '/api/ai/search-intent') return send(res, 200, await handleSearchIntent(body));
    if (req.url === '/api/ai/assistant') return send(res, 200, await handleAssistant(body));
    if (req.url === '/api/ai/analyze-image') return send(res, 200, await handleImage(body));
    return send(res, 404, { error: 'Not found' });
  } catch (error) {
    const message = error?.message || 'AI service error';
    const status = message === 'REQUEST_TOO_LARGE' ? 413 : 500;
    return send(res, status, { error: message });
  }
});

server.listen(PORT, () => {
  console.log(`UniDrop AI server: http://localhost:${PORT}`);
  console.log(API_KEY ? `AI model: ${MODEL}` : 'OPENAI_API_KEY chưa được cấu hình. AI UI vẫn chạy chế độ fallback.');
});
