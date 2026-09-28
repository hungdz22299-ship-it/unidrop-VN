import type { Order, Transaction, Promotion, User, CartItem } from '@/types';
import { loadJSON, saveJSON } from '@/lib/storage';
import { getProducts, getProductById, saveProducts } from '@/services/productService';
import { getUsers, saveUsers } from '@/services/auth';

const PROMOS_KEY = 'promotions';
const PROMOS_INIT = 'promos_initialized';

function getEmailByUserId(userId: string): string | null { return getUsers().find((u) => u.id === userId)?.email ?? null; }
function userKey(prefix: string, userId: string): string { const email = getEmailByUserId(userId); return email ? `${prefix}_${email}` : `${prefix}_user_${userId}`; }

export function getOrders(): Order[] { const result: Order[] = []; const seen = new Set<string>(); for (const user of getUsers()) for (const o of loadJSON<Order[]>(`orders_${user.email}`, [])) if (!seen.has(o.id)) { seen.add(o.id); result.push(o); } return result.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()); }
export function saveOrders(orders: Order[]): void { const grouped = new Map<string, Order[]>(); for (const o of orders) { const key = userKey('orders', o.userId); const list = grouped.get(key) ?? []; list.push(o); grouped.set(key,list); } for (const [key,list] of grouped) saveJSON(key,list); }
export function getOrdersByUser(userId: string): Order[] { return loadJSON<Order[]>(userKey('orders', userId), []).sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()); }
export function getOrderById(id: string, userId?: string): Order | undefined { return (userId ? getOrdersByUser(userId) : getOrders()).find((o)=>o.id===id); }
export function createOrder(order: Order): void { const key=userKey('orders',order.userId); const orders=loadJSON<Order[]>(key,[]); if(!orders.some((o)=>o.id===order.id)){orders.unshift(order);saveJSON(key,orders);} }

export function getTransactions(): Transaction[] { const result: Transaction[]=[]; const seen=new Set<string>(); for(const user of getUsers()) for(const t of loadJSON<Transaction[]>(`transactions_${user.email}`,[])) if(!seen.has(t.id)){seen.add(t.id);result.push(t);} return result.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()); }
export function saveTransactions(items: Transaction[]): void { const grouped=new Map<string,Transaction[]>(); for(const t of items){const key=userKey('transactions',t.userId);const list=grouped.get(key)??[];list.push(t);grouped.set(key,list);} for(const [key,list] of grouped) saveJSON(key,list); }
export function getTransactionsByUser(userId:string):Transaction[]{return loadJSON<Transaction[]>(userKey('transactions',userId),[]).sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());}
export function createTransaction(txn:Transaction):void{const key=userKey('transactions',txn.userId);const items=loadJSON<Transaction[]>(key,[]);if(!items.some((x)=>x.id===txn.id)){items.unshift(txn);saveJSON(key,items);}}

function nextOrderId(date: Date): string { const prefix=`UD-${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}-`; const used=getOrders().map(o=>o.id).filter(id=>id.startsWith(prefix)).map(id=>Number(id.slice(-4))).filter(Number.isFinite); const n=(used.length?Math.max(...used)+1:1); return `${prefix}${String(n).padStart(4,'0')}`; }

export interface PlaceOrderInput { user: User; items: CartItem[]; shippingName:string; shippingPhone:string; shippingAddress:string; shippingProvince?:string; shippingDistrict?:string; shippingWard?:string; note?:string; paymentMethod:'cod'|'wallet'|'ewallet'|'card'; total:number; promoCode?:string; }
export interface PlaceOrderResult { order?:Order; error?:string; }

export function placeOrder(input: PlaceOrderInput): PlaceOrderResult {
  if (!input.user || !input.items.length) return { error:'Giỏ hàng đang trống.' };
  if (!input.shippingName.trim() || !input.shippingPhone.trim() || !input.shippingAddress.trim()) return { error:'Vui lòng nhập đầy đủ thông tin giao hàng.' };
  const productsBefore=getProducts(); const usersBefore=getUsers(); const ordersBefore=getOrdersByUser(input.user.id); const txBefore=getTransactionsByUser(input.user.id); const promoBefore=getPromotions();
  try {
    const lineItems=[] as Order['items'];
    for(const item of input.items){ const p=getProductById(item.productId); if(!p) throw new Error(`Sản phẩm ${item.name} không còn tồn tại.`); if(p.stock<item.quantity) throw new Error(`Sản phẩm ${p.name} không đủ tồn kho.`); if(item.quantity<=0) throw new Error('Số lượng sản phẩm không hợp lệ.'); lineItems.push({productId:p.id,name:p.name,price:p.price,image:p.image,quantity:item.quantity}); }
    const total=Math.max(0, Math.round(input.total));
    if(input.paymentMethod==='wallet' && input.user.balance<total) throw new Error('Số dư không đủ để thanh toán đơn hàng.');
    const now=new Date(); const order:Order={id:nextOrderId(now),userId:input.user.id,items:lineItems,total,status:'pending',shippingName:input.shippingName.trim(),shippingPhone:input.shippingPhone.trim(),shippingAddress:input.shippingAddress.trim(),shippingProvince:input.shippingProvince?.trim()||undefined,shippingDistrict:input.shippingDistrict?.trim()||undefined,shippingWard:input.shippingWard?.trim()||undefined,note:input.note?.trim()||undefined,paymentMethod:input.paymentMethod==='wallet'?'Ví UniDrop':input.paymentMethod==='ewallet'?'Ví điện tử':input.paymentMethod==='card'?'Thẻ ngân hàng':'COD',createdAt:now.toISOString(),refundProcessed:false,stockRestored:false};
    const updatedProducts=productsBefore.map((p)=>{const item=input.items.find(i=>i.productId===p.id); return item?{...p,stock:p.stock-item.quantity,sold:p.sold+item.quantity}:p;});
    saveProducts(updatedProducts);
    if(input.paymentMethod==='wallet'){
      const users=getUsers(); const idx=users.findIndex(u=>u.id===input.user.id); if(idx<0) throw new Error('Không tìm thấy tài khoản.'); users[idx]={...users[idx],balance:users[idx].balance-total}; saveUsers(users);
    }
    createOrder(order);
    if(input.paymentMethod==='wallet'){const userAfter=getUsers().find(u=>u.id===input.user.id)!;createTransaction({id:`TXN-${order.id}`,userId:input.user.id,type:'purchase',amount:-total,description:`Thanh toán đơn ${order.id}`,orderId:order.id,createdAt:now.toISOString(),balanceAfter:userAfter.balance});}
    if(input.promoCode) incrementPromoUsage(input.promoCode);
    return {order};
  } catch (error) {
    saveProducts(productsBefore); saveJSON(`orders_${input.user.email}`,ordersBefore); saveJSON(`transactions_${input.user.email}`,txBefore); saveUsers(usersBefore); savePromotions(promoBefore); return {error:error instanceof Error?error.message:'Không thể tạo đơn hàng.'};
  }
}

export function updateOrderStatus(id:string,status:Order['status']):void{
  const users=getUsers();
  for(const user of users){const key=`orders_${user.email}`;const orders=loadJSON<Order[]>(key,[]);const idx=orders.findIndex(o=>o.id===id);if(idx===-1)continue;const order=orders[idx];
    if(status==='cancelled' && order.status!=='cancelled'){
      if(!order.stockRestored){const products=getProducts();for(const item of order.items){const p=products.find(x=>x.id===item.productId);if(p)p.stock+=item.quantity;}saveProducts(products);order.stockRestored=true;}
      if(order.paymentMethod==='Ví UniDrop' && !order.refundProcessed){const usersNow=getUsers();const uidx=usersNow.findIndex(u=>u.id===order.userId);if(uidx>=0){usersNow[uidx].balance+=order.total;saveUsers(usersNow);createTransaction({id:`TXN-REF-${Date.now()}`,userId:order.userId,type:'refund',amount:order.total,description:`Hoàn tiền đơn ${order.id}`,orderId:order.id,createdAt:new Date().toISOString(),balanceAfter:usersNow[uidx].balance});}}order.refundProcessed=true;
    }
    orders[idx]={...order,status};saveJSON(key,orders);return; }
}

const seedPromos:Promotion[]=[{id:'promo-1',code:'SINHVIEN10',description:'Giảm 10% cho đơn từ 100K',discountType:'percent',discountValue:10,minOrder:100000,maxDiscount:50000,startDate:new Date(Date.now()-30*86400000).toISOString(),endDate:new Date(Date.now()+60*86400000).toISOString(),active:true,usedCount:0},{id:'promo-2',code:'FREESHIP',description:'Giảm 25K phí vận chuyển',discountType:'fixed',discountValue:25000,minOrder:150000,startDate:new Date(Date.now()-20*86400000).toISOString(),endDate:new Date(Date.now()+40*86400000).toISOString(),active:true,usedCount:0},{id:'promo-3',code:'UNIDROP20',description:'Giảm 20% cho đơn từ 300K',discountType:'percent',discountValue:20,minOrder:300000,maxDiscount:100000,startDate:new Date(Date.now()-10*86400000).toISOString(),endDate:new Date(Date.now()+20*86400000).toISOString(),active:true,usedCount:0}];
export function ensurePromosInitialized():void{const init=loadJSON<boolean>(PROMOS_INIT,false);if(!init||!loadJSON<Promotion[]>(PROMOS_KEY,[]).length){saveJSON(PROMOS_KEY,seedPromos);saveJSON(PROMOS_INIT,true);}}
export function getPromotions():Promotion[]{return loadJSON<Promotion[]>(PROMOS_KEY,[]);}
export function savePromotions(items:Promotion[]):void{saveJSON(PROMOS_KEY,items);}
export function validatePromo(code:string,orderTotal:number):{promo?:Promotion;error?:string}{const p=getPromotions().find(x=>x.code===code.trim().toUpperCase());if(!p)return{error:'Mã giảm giá không tồn tại'};if(!p.active)return{error:'Mã giảm giá đã ngừng hoạt động'};const now=new Date();if(new Date(p.startDate)>now)return{error:'Mã giảm giá chưa bắt đầu'};if(new Date(p.endDate)<now)return{error:'Mã giảm giá đã hết hạn'};if(orderTotal<p.minOrder)return{error:`Đơn hàng tối thiểu ${p.minOrder.toLocaleString('vi-VN')}đ`};return{promo:p};}
export function calculateDiscount(p:Promotion,orderTotal:number):number{if(p.discountType==='percent'){const d=orderTotal*p.discountValue/100;return p.maxDiscount?Math.min(d,p.maxDiscount):d;}return Math.min(p.discountValue,orderTotal);}
export function incrementPromoUsage(code:string):void{const ps=getPromotions();const i=ps.findIndex(p=>p.code===code.toUpperCase());if(i>=0){ps[i].usedCount+=1;savePromotions(ps);}}
