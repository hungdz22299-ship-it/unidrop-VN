import { Link } from 'react-router-dom';
import { ChevronRight, CircleHelp, ShoppingBag, CreditCard, ShieldCheck } from 'lucide-react';

const items=[
  ['Mua hàng','Chọn sản phẩm, kiểm tra tồn kho, thêm vào giỏ và xác nhận thông tin giao hàng trước khi đặt.'],
  ['Thanh toán','UniDrop hỗ trợ COD, số dư UniDrop và các phương thức thanh toán được cung cấp trong website. Không nhập thông tin thanh toán nhạy cảm thật.'],
  ['Đơn hàng','Sau khi xác nhận, đơn hàng xuất hiện trong tài khoản và có thể theo dõi trạng thái tại mục Đơn hàng.'],
  ['Hủy và hoàn tiền','Đơn đủ điều kiện có thể được hủy; tiền từ số dư UniDrop được hoàn một lần và tồn kho được khôi phục một lần.'],
];
export function HelpPage(){return <div className="mx-auto max-w-5xl px-4 py-8"><nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500"><Link to="/">Trang chủ</Link><ChevronRight className="h-4 w-4"/><span className="font-medium text-gray-800">Trợ giúp</span></nav><div className="rounded-3xl bg-indigo-50 p-6 sm:p-8"><CircleHelp className="h-10 w-10 text-indigo-600"/><h1 className="mt-4 text-3xl font-bold text-gray-900">Trợ giúp UniDrop</h1><p className="mt-2 text-gray-600">Hướng dẫn nhanh để mua hàng và quản lý đơn hàng.</p></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{items.map(([title,desc],i)=><section key={title} className="rounded-2xl border border-gray-100 bg-white p-5"><div className="flex items-center gap-3">{i===0?<ShoppingBag className="h-5 w-5 text-indigo-600"/>:i===1?<CreditCard className="h-5 w-5 text-indigo-600"/>:<ShieldCheck className="h-5 w-5 text-indigo-600"/>}<h2 className="font-bold text-gray-900">{title}</h2></div><p className="mt-3 text-sm leading-6 text-gray-600">{desc}</p></section>)}</div></div>}
