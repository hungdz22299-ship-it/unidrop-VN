# UniDrop – bản tiếp tục từ source Bolt

Bản này được chỉnh trực tiếp từ ZIP project Bolt mà người dùng đã cung cấp.

## Đã sửa

- Nối `BrowserRouter` và toàn bộ route người dùng/admin.
- Thêm role guard cho admin và auth guard cho khu vực cần đăng nhập.
- Guest chỉ truy cập được các trang công khai.
- Seed tài khoản quản trị và tài khoản người dùng theo cấu hình UniDrop.
- Thêm dữ liệu khởi tạo 6 đơn hàng cho tài khoản `demo@unidrop.vn` với 6 trạng thái yêu cầu.
- Tách cart/wishlist theo email tài khoản.
- Tách orders/transactions theo email tài khoản; admin vẫn có thể tổng hợp toàn hệ thống.
- Thêm wallet key theo tài khoản và đồng bộ khi thay đổi số dư.
- Mở rộng catalog từ 24 seed product hiện có thành 104 sản phẩm ổn định bằng dữ liệu biến thể xác định, không dùng ảnh ngẫu nhiên.
- Cải thiện tìm kiếm không dấu tiếng Việt.
- Checkout kiểm tra tồn kho, chống gửi trùng, cập nhật tồn kho và tạo mã đơn dạng `UD-YYYYMMDD-XXXX`.
- Order detail chỉ cho người dùng xem đơn thuộc tài khoản của mình.
- Sửa import `EmptyState` trong checkout.
- Loại bỏ một số cụm từ nội bộ khỏi UI người dùng.

## Kiểm tra

- Đã kiểm tra cú pháp/transpile toàn bộ `.ts/.tsx`: OK.
- Chưa chạy được `npm run typecheck`/`npm run build` trong môi trường xử lý ZIP vì package registry không khả dụng và `node_modules` chưa có sẵn. Hãy chạy `npm install` rồi `npm run typecheck && npm run build` trong môi trường phát triển/Bolt.

## AI

Chưa tích hợp AI trong bản này. AI nên được thêm sau khi nền routing, dữ liệu, auth và commerce đã build ổn định.
