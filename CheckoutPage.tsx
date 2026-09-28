import { useMemo, useState, type ComponentType } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { formatCurrency } from '@/lib/format';
import { placeOrder, validatePromo, calculateDiscount, getPromotions } from '@/services/orderService';
import { ArrowLeft, Tag, Check, Wallet, Truck, CreditCard, ShoppingCart, Smartphone } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [shippingName,setShippingName]=useState(user?.name||'');
  const [shippingPhone,setShippingPhone]=useState(user?.phone||'');
  const [shippingAddress,setShippingAddress]=useState('');
  const [province,setProvince]=useState(''); const [district,setDistrict]=useState(''); const [ward,setWard]=useState('');
  const [note,setNote]=useState(''); const [paymentMethod,setPaymentMethod]=useState<'cod'|'wallet'|'ewallet'|'card'>('cod');
  const [promoCode,setPromoCode]=useState(''); const [appliedDiscount,setAppliedDiscount]=useState(0); const [appliedPromoCode,setAppliedPromoCode]=useState(''); const [submitting,setSubmitting]=useState(false);
  const shippingFee=totalPrice>=150000?0:25000; const finalTotal=Math.max(0,totalPrice-appliedDiscount+shippingFee);
  const availablePromos=useMemo(()=>getPromotions().filter(p=>p.active),[]);

  if(items.length===0)return <div className="mx-auto max-w-7xl px-4 py-16"><EmptyState icon={<ShoppingCart className="h-10 w-10"/>} title="Giỏ hàng trống" description="Thêm sản phẩm vào giỏ trước khi thanh toán." action={<Link to="/" className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white">Mua sắm ngay</Link>}/></div>;
  if(!user)return null;

  const handleApplyPromo=()=>{if(!promoCode.trim())return;const r=validatePromo(promoCode,totalPrice);if(r.error){showToast(r.error,'error');setAppliedDiscount(0);setAppliedPromoCode('');return;}if(r.promo){setAppliedDiscount(calculateDiscount(r.promo,totalPrice));setAppliedPromoCode(r.promo.code);showToast(`Đã áp dụng mã ${r.promo.code}`,'success');}};
  const handleSubmit=(e:React.FormEvent)=>{e.preventDefault();if(submitting)return;setSubmitting(true);const result=placeOrder({user,items,shippingName,shippingPhone,shippingAddress,shippingProvince:province,shippingDistrict:district,shippingWard:ward,note,paymentMethod,total:finalTotal,promoCode:appliedPromoCode||undefined});if(result.error){showToast(result.error,'error');setSubmitting(false);return;}clearCart();refreshUser();showToast('Đặt hàng thành công!','success');navigate(`/don-hang/${result.order!.id}`);};

  return <div className="animate-fade-in mx-auto max-w-7xl px-4 py-8">
    <Link to="/gio-hang" className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600"><ArrowLeft className="h-4 w-4"/> Quay lại giỏ hàng</Link>
    <h1 className="mb-4 text-2xl font-bold text-gray-900">Thanh toán</h1>
    <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">Đây là bước thanh toán mô phỏng của UniDrop. Không nhập thông tin thẻ, CVV hoặc OTP thật.</div>
    <div className="mb-6 grid grid-cols-3 gap-2 text-xs font-semibold sm:text-sm">{['1. Thông tin giao hàng','2. Phương thức thanh toán','3. Xác nhận đơn hàng'].map((step,i)=><div key={step} className={`rounded-xl px-3 py-2 text-center ${i===0?'bg-indigo-600 text-white':'bg-white text-slate-500 border border-slate-200'}`}>{step}</div>)}</div>
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-5"><h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Truck className="h-5 w-5 text-indigo-600"/> Thông tin giao hàng</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">Họ và tên<input value={shippingName} onChange={e=>setShippingName(e.target.value)} required className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none"/></label>
            <label className="text-sm font-medium text-gray-700">Số điện thoại<input value={shippingPhone} onChange={e=>setShippingPhone(e.target.value)} required className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none"/></label>
            <label className="text-sm font-medium text-gray-700">Tỉnh/Thành phố<input value={province} onChange={e=>setProvince(e.target.value)} required className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none"/></label>
            <label className="text-sm font-medium text-gray-700">Quận/Huyện<input value={district} onChange={e=>setDistrict(e.target.value)} required className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none"/></label>
            <label className="text-sm font-medium text-gray-700">Phường/Xã<input value={ward} onChange={e=>setWard(e.target.value)} required className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none"/></label>
            <label className="text-sm font-medium text-gray-700 sm:col-span-2">Địa chỉ chi tiết<input value={shippingAddress} onChange={e=>setShippingAddress(e.target.value)} required className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none" placeholder="Số nhà, tên đường..."/></label>
            <label className="text-sm font-medium text-gray-700 sm:col-span-2">Ghi chú<textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none"/></label>
          </div>
        </section>
        <section className="rounded-2xl border border-gray-100 bg-white p-5"><h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><CreditCard className="h-5 w-5 text-indigo-600"/> Phương thức thanh toán</h2><div className="grid gap-3 sm:grid-cols-2">
          {([{value:'cod',title:'COD',desc:'Thanh toán khi nhận hàng',Icon:Truck},{value:'wallet',title:'Số dư UniDrop',desc:`Số dư: ${formatCurrency(user.balance)}`,Icon:Wallet},{value:'ewallet',title:'Ví điện tử',desc:'Thanh toán trực tuyến trong website',Icon:Smartphone},{value:'card',title:'Thẻ ngân hàng',desc:'Không lưu dữ liệu thẻ thật',Icon:CreditCard}] as Array<{value: typeof paymentMethod; title:string; desc:string; Icon:ComponentType<{className?:string}>}>).map(({value,title,desc,Icon})=><label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${paymentMethod===value?'border-indigo-500 bg-indigo-50':'border-gray-200'}`}><input type="radio" name="payment" checked={paymentMethod===value} onChange={()=>setPaymentMethod(value)} className="h-4 w-4"/><Icon className="h-5 w-5 text-gray-600"/><div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-gray-500">{desc}</p></div></label>)}
        </div></section>
      </div>
      <aside className="lg:col-span-1"><div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-5"><h2 className="mb-4 text-lg font-bold">Đơn hàng của bạn</h2><div className="mb-4 max-h-48 space-y-2 overflow-y-auto">{items.map(i=><div key={i.productId} className="flex gap-2"><img src={i.image} alt={i.name} className="h-12 w-12 rounded-lg object-cover"/><div className="flex-1 text-sm"><p className="line-clamp-1 font-medium">{i.name}</p><p className="text-xs text-gray-500">{i.quantity} × {formatCurrency(i.price)}</p></div></div>)}</div>
        <div className="mb-4 border-t pt-4"><label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium"><Tag className="h-4 w-4"/> Mã giảm giá</label>{appliedPromoCode?<div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2.5"><span className="text-sm font-medium text-emerald-700"><Check className="mr-1 inline h-4 w-4"/>{appliedPromoCode}</span><button type="button" onClick={()=>{setAppliedPromoCode('');setAppliedDiscount(0)}} className="text-xs text-rose-500">Hủy</button></div>:<div className="flex gap-2"><input value={promoCode} onChange={e=>setPromoCode(e.target.value)} placeholder={availablePromos[0]?.code||'Nhập mã'} className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"/><button type="button" onClick={handleApplyPromo} className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white">Áp dụng</button></div>}</div>
        <div className="space-y-2 border-t pt-4 text-sm"><div className="flex justify-between"><span>Tạm tính</span><b>{formatCurrency(totalPrice)}</b></div>{appliedDiscount>0&&<div className="flex justify-between text-emerald-600"><span>Giảm giá</span><b>-{formatCurrency(appliedDiscount)}</b></div>}<div className="flex justify-between"><span>Phí vận chuyển</span><b>{shippingFee?formatCurrency(shippingFee):'Miễn phí'}</b></div><div className="flex justify-between border-t pt-3 text-base"><span className="font-semibold">Tổng cộng</span><b className="text-xl text-indigo-600">{formatCurrency(finalTotal)}</b></div></div>
        <button type="submit" disabled={submitting} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white disabled:opacity-50">{submitting?'Đang xử lý...':'Xác nhận đặt hàng'}{!submitting&&<Check className="h-5 w-5"/>}</button>
      </div></aside>
    </form>
  </div>;
}
