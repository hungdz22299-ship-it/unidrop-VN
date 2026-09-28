# UniDrop Combo Update

## Đã thêm
- Trang khách hàng `/combo`.
- Admin `/admin/combo`.
- Admin có thể tạo/sửa/xóa combo.
- Admin chọn trực tiếp sản phẩm đang có trong catalog và đặt số lượng từng sản phẩm.
- Giá combo có thể nhập thủ công hoặc để 0 để tự tính theo tổng giá sản phẩm.
- Combo được lưu vào Supabase table `public.combos` và cache localStorage.
- Logo mới và slogan mới đã được cập nhật ở Header/Footer.

## Cần chạy SQL một lần trên Supabase
Mở SQL Editor của project và chạy phần `combos` trong `supabase/setup.sql`.

> Lưu ý: chính sách demo hiện cho phép public read/insert/update/delete giống bảng `products` hiện tại. Khi đưa vào production, nên thay bằng Supabase Auth + RLS theo role admin.
