# Kế hoạch Triển khai Dự án LoRaWAN IoT Platform - Ngày 31/03/2026
Ngày cập nhật: 31/03/2026

Bản kế hoạch này cụ thể hóa các mục tiêu kỹ thuật (Phase 3 & 4) nhằm nâng cấp hệ thống hiện tại lên chuẩn công nghiệp bền vững, kèm theo các tiêu chí đo lường cụ thể cho từng hạng mục.

---

## 1. Ưu tiên 1: Hệ thống Giám sát Tập trung (Observability)
- **Mô hình áp dụng**: **Pattern 10 - Sidecar / Monitoring**.
- **Chi tiết triển khai**:
  - Tích hợp Prometheus Exporter vào Backend NestJS để thu thập 100% các chỉ số về CPU/RAM/Network.
  - Xây dựng Dashboard Grafana hiển thị trực quan các biểu đồ nến cho lưu lượng gói tin hàng giây.
  - Thu thập "Nhịp tim" (Healthy check) của các Database Postgres, InfluxDB và Redis trên Docker.
- **Yêu cầu cần đạt (Criteria)**:
  - Dashboard Grafana phải load dữ liệu real-time với độ trễ < 2 giây.
  - Phải hiển thị được ít nhất 3 tham số: Độ dài hàng đợi, Thời gian xử lý trung bình 1 Job, và Tỉ lệ fCnt trùng lặp.
  - Cảnh báo trực quan trên Dashboard khi hàng đợi vượt quá 1.000 Jobs.

## 2. Ưu tiên 2: Phân luồng Ưu tiên Dữ liệu khẩn cấp
- **Mô hình áp dụng**: **Pattern 8 - Bulkhead**.
- **Chi tiết triển khai**:
  - Tách UplinkQueue thành `HighPriorityQueue` (Báo cháy, Cảnh báo khẩn) và `StandardQueue` (Telemetries thường).
  - Cấu hình số lượng Concurrency (Số job xử lý đồng thời) cho HighPriority gấp đôi Standard.
  - Đảm bảo cơ chế Fail-over: Nếu Standard Queue bị treo, HighPriority vẫn phải hoạt động bình thường.
- **Yêu cầu cần đạt (Criteria)**:
  - Trong điều kiện test tải cao: Tin báo cháy phải có thời gian xử lý (Processing time) < 200ms.
  - Tin thường có thể trễ (Latency) nhưng tuyệt đối không được làm ảnh hưởng đến tin khẩn.
  - Xác nhận bằng test case mô phỏng: Đổ 1.000 tin thường và sau đó gửi 1 tin khẩn, tin khẩn phải được xử lý ngay lập tức.

## 3. Ưu tiên 3: Tăng cường tính Ổn định Dịch vụ Ngoại vi
- **Mô hình áp dụng**: **Pattern 7 - Circuit Breaker**.
- **Chi tiết triển khai**:
  - Triển khai "Cầu dao" tự động cho Module gửi thông báo qua Telegram/SMS.
  - Logic: Nếu kết nối đến API Telegram thất bại liên tục (Error rate > 50%), hệ thống sẽ ngắt kết nối (Open state) trong 60 giây.
- **Yêu cầu cần đạt (Criteria)**:
  - Khi Circuit Breaker ở trạng thái ngắt, Worker xử lý Uplink không bị block (chờ đợi vô ích).
  - Phải có log ghi lại thời điểm Circuit Breaker thay đổi trạng thái (Closed/Open/Half-open).

## 4. Ưu tiên 4: Tối ưu hóa Hiệu suất Truy vấn (Read Scaling)
- **Mô hình áp dụng**: **Pattern 4 - CQRS (Command Query Responsibility Segregation)**.
- **Chi tiết triển khai**:
  - Phân tách luồng code: `SensorService` chỉ làm nhiệm vụ ghi (Write), `ReportService` chỉ làm nhiệm vụ đọc (Read).
  - Tối ưu hóa Indexing cho Postgres cho các cột DevEUI và Timestamp.
- **Yêu cầu cần đạt (Criteria)**:
  - Truy vấn báo cáo lịch sử của 1.000 thiết bị trong 30 ngày qua phải hoàn thành trong < 1.5 giây.
  - Hiệu suất ghi dữ liệu sensor không được giảm đi khi Dashboard đang truy vấn nặng.

## 5. Ưu tiên 5: Triển khai Cloud Digital Ocean & Security
- **Mô hình áp dụng**: **Horizontal Scaling**.
- **Chi tiết triển khai**:
  - Triển khai SSL (TLS) cho MQTT Mosquitto trên Cloud.
  - Cấu hình Environment động để dễ dàng di chuyển từ Pi 4 lên Digital Ocean Droplet.
- **Yêu cầu cần đạt (Criteria)**:
  - Tỷ lệ tin nhận thành công từ Gateway Pi 4 thật gửi lên Cloud DO phải đạt > 99%.
  - Truy cập Dashboard qua tên miền phải được mã hóa HTTPS 100%.

---

### Tổng kết
Kế hoạch này đảm bảo hệ thống của bạn chuyển từ việc **"Chạy đúng"** sang **"Chạy bền bỉ và chuyên nghiệp"**. Toàn bộ các tiêu chí trên sẽ được sử dụng để đánh giá nghiệm thu cuối cùng của dự án.
