# Quản lí vườn gia đình quy mô nội bộ 1 - 2 người

## 1. Chức năng chính:

- Đăng kí / đăng nhập
- Quản lí vườn (diện tích, lượng liếp đất)
- Quản lí vật tư(nhập/xuất mục đích xem số tiền đã dùng cho chi phí)
- Quản lí sản lượng thu hoạch (theo loại, ngày, số lượng, giá bán, thành tiền)
- Quản lí đơn hàng, khi có đơn đặt hàng (loại, số lượng, ngày nhận, ngày giao, đơn giá, số lượng, thành tiền, cọc trước)
- Quản lí nhân công (ngày, tên người làm, số giờ làm, tiền công theo giờ, thành tiền)
- Quản lí chăm sóc vườn (ngày bón phân, xịt thuốc, loại phân thuốc đã dùng)
- Thống kê đơn giản, tuần/tháng (doanh thu, chi phí, lợi nhuận)

## 2.Công nghệ sử dụng:

Vì chưa có kinh phí duy trì nên

- FE dùng vercel có sẳn tên miền không tốn tiền
- PWA dùng thay cho build app
- BE dùng supabase (chưa biết có free hay không, quy mô như mô tả trên không lớn lắm) - cần tư vấn

## 3. Mục tiêu mong muốn

- Tạo ra được 1 sản phẩn dể dùng, đối tượng là nông dân thuần (không rành công nghệ) cần đơn giản và hiệu quả, trực quan nhất có thể
- Ngôn ngữ dùng toàn bộ hiển thị trên UI là tiếng Việt ưu tiên từ ngữ miền Nam Việt Nam (Thân thiện, không quá mang tính kỹ thuật)

- Yêu cầu về kỹ thuật khi làm giao diện:
  - Dùng thư viện của antd để tận dụng các thành phần có sẳn.
  - Cách giao diện dạng thẻ (Card hiển thị thông tin) và bảng để kết hợp thể hiện giao diện
  - Phân tách component không dồn hết tất cả vào một file
  - Nếu dùng supabase cần config 1 luồng service dùng chung tránh mỗi lần dùng là fetch api mỗi kiểu khó quản lí
