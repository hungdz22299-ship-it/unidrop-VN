import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, RotateCcw, CreditCard, Headphones, Package } from 'lucide-react';

export function PolicyPage() {
  const sections = [
    {
      icon: Truck,
      title: 'Vận chuyển',
      content: [
        'Miễn phí vận chuyển cho đơn hàng từ 150.000đ.',
        'Phí vận chuyển mặc định: 25.000đ.',
        'Giao hàng trong 24h tại nội thành, 2-3 ngày với các tỉnh thành khác.',
        'Bạn sẽ nhận được thông báo khi đơn hàng được giao.',
      ],
    },
    {
      icon: RotateCcw,
      title: 'Đổi trả hàng',
      content: [
        'Đổi trả trong vòng 7 ngày kể từ ngày nhận hàng.',
        'Sản phẩm phải còn nguyên tem, hộp, chưa qua sử dụng.',
        'Hoàn tiền 100% nếu sản phẩm bị lỗi do nhà sản xuất.',
        'Chi phí đổi trả do UniDrop chịu nếu sản phẩm lỗi.',
      ],
    },
    {
      icon: CreditCard,
      title: 'Thanh toán',
      content: [
        'Thanh toán khi nhận hàng (COD): trả tiền mặt cho shipper.',
        'Ví UniDrop: thanh toán trực tiếp từ ví điện tử trên app.',
        'Mọi giao dịch đều được mã hóa và bảo mật tuyệt đối.',
      ],
    },
    {
      icon: ShieldCheck,
      title: 'Bảo mật thông tin',
      content: [
        'Thông tin cá nhân của bạn được bảo mật và không chia sẻ với bên thứ ba.',
        'Mật khẩu được mã hóa an toàn.',
        'Chúng tôi chỉ sử dụng thông tin để xử lý đơn hàng và cải thiện dịch vụ.',
      ],
    },
    {
      icon: Headphones,
      title: 'Hỗ trợ khách hàng',
      content: [
        'Hotline: 1900 1234 (8h - 21h mỗi ngày).',
        'Email: hotro@unidrop.vn',
        'Chat trực tiếp trên nền tảng UniDrop.',
        'Đội ngũ hỗ trợ sẽ phản hồi trong vòng 24h.',
      ],
    },
  ];

  return (
    <div className="animate-fade-in mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-600">
          <Package className="h-4 w-4" /> Chính sách UniDrop
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Chính sách & Điều khoản</h1>
        <p className="mt-2 text-sm text-gray-500">Những quy định giúp bạn yên tâm khi mua sắm tại UniDrop</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <section.icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
            </div>
            <ul className="space-y-2.5">
              {section.content.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← Về trang chủ
        </Link>
      </div>
    </div>
  );
}
