# Ghi chú Chiến lược Kiến trúc LoRaWAN Platform
Ngày cập nhật: 31/03/2026

Tài liệu này tổng hợp phân tích về 4 mô hình kiến trúc cốt lõi, thời điểm vận dụng và các điểm nổi bật của hệ thống hiện tại giúp việc thay đổi trở nên dễ dàng.

---

## 1. Phân tích 4 Mô hình Kiến trúc Cốt lõi

### A. Kiến trúc Hướng sự kiện (Event Driven)
- **Vận dụng khi**: Hệ thống cần xử lý hàng ngàn bản tin không đồng bộ từ cảm biến.
- **Khi cần làm gì**: Áp dụng ngay từ đầu để tách biệt luồng nhận tin và luồng xử lý.
- **Đánh giá**: **Bắt buộc**. Hiện tại đã triển khai 100% qua MQTT và BullMQ.

### B. Kiến trúc Phân lớp (Layered Architecture)
- **Vận dụng khi**: Dự án có logic nghiệp vụ phức tạp và cần nhiều người cùng phát triển.
- **Khi cần làm gì**: Chia code thành Controller -> Service -> Repository.
- **Đánh giá**: **Nên dùng**. Đã triển khai giúp mã nguồn sạch sẽ, dễ bảo trì.

### C. Kiến trúc Vi dịch vụ (Microservices)
- **Vận dụng khi**: Số lượng thiết bị vượt ngưỡng 50.000 hoặc khi cần mở rộng quy mô đội ngũ lập trình viên.
- **Khi cần làm gì**: Tách các Module (như Alert, Billing, Uplink) thành các server riêng biệt.
- **Đánh giá**: **Để sau**. Hiện tại cấu trúc Monolith là tối ưu nhất về chi phí trên Digital Ocean.

### D. Kiến trúc Chủ - Tớ (Master-Slave Database)
- **Vận dụng khi**: Dashboard bị chậm do quá nhiều người truy cập cùng lúc với luồng ghi dữ liệu cảm biến.
- **Khi cần làm gì**: Thuê thêm Read Replicas trên Digital Ocean để chia tải truy vấn.
- **Đánh giá**: **Nên dùng khi Scale-up**.

---

## 2. Điểm Nổi bật giúp Hệ thống Dễ dàng Thay đổi

Hệ thống hiện tại của bạn có 4 đặc điểm kỹ thuật giúp việc thay đổi cực kỳ linh hoạt mà không cần đập đi xây lại:

### 1. Tính Modularity (Module hóa cao)
- **Đặc điểm**: Mỗi tính năng (Sensor, Alert, Auth) được đóng gói trong một Module riêng của NestJS.
- **Lợi ích**: Nếu ngày mai bạn muốn chuyển sang kiến trúc **Microservices**, bạn chỉ cần copy thư mục Module đó sang một dự án mới. 90% logic sẽ vẫn chạy đúng.

### 2. Sự tách biệt giữa Producer và Consumer (BullMQ)
- **Đặc điểm**: Luồng nhận tin (MQTT) và luồng xử lý (Worker) giao tiếp qua Redis.
- **Lợi ích**: Bạn có thể tắt Worker để nâng cấp code mà luồng nhận tin vẫn hoạt động bình thường, không bị mất gói tin nào từ Pi 4 gửi lên.

### 3. Interface/Repository Pattern (Trừu tượng hóa DB)
- **Đặc điểm**: Backend giao tiếp với Database qua các Interface (Giao diện).
- **Lợi ích**: Nếu bạn muốn đổi Postgres sang MySQL hoặc InfluxDB sang một loại DB khác, bạn chỉ cần viết một file Implementation mới và thay đổi 1 dòng code trong AppModule. Toàn bộ logic nghiệp vụ bên trên không phải sửa đổi.

### 4. Cấu hình linh hoạt qua Environment Variables
- **Đặc điểm**: Mọi thông số (Port, DB Host, API Keys) đều nằm trong file `.env`.
- **Lợi ích**: Giúp việc chuyển đổi từ môi trường chạy thử (Raspberry Pi local) lên môi trường thật (**Digital Ocean Cloud**) diễn ra trong vài giây mà không cần sửa code.

---

## 3. Kết luận về Chiến lược Triển khai

Hệ thống của bạn đang ở trạng thái **"Microservices-Ready"**. Tức là nó mang hình hài của Monolith (dễ quản lý) nhưng mang tâm hồn của Microservices (dễ mở rộng). Đây là cấu trúc thông minh nhất để tiết kiệm chi phí ban đầu trên Digital Ocean mà vẫn đảm bảo khả năng nâng cấp lên Platform 100.000 thiết bị trong tương lai.
