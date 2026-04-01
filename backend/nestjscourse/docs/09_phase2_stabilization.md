# 09. Ổn định hóa hệ thống (Stabilization) - Phase 2

Tài liệu này mô tả các cải tiến về độ tin cậy và hiệu năng trong Phase 2.

## 1. Hàng đợi xử lý (Asynchronous Ingestion)
Thay vì xử lý trực tiếp gói tin MQTT (có thể gây nghẽn nếu DB chậm), hệ thống chuyển sang sử dụng **BullMQ**:
- **Luồng đi**: MQTT Broker -> `MqttService` -> `ProcessUplinkUseCase` -> **Redis Queue** -> `UplinkProcessor`.
- **Lợi ích**: 
    - Khả năng chịu tải (Buffering).
    - Tự động thử lại (Retry) nếu InfluxDB hoặc Postgres bị lỗi tạm thời.
    - Không làm treo luồng nhận tin MQTT.

## 2. Idempotency (Chống trùng lặp)
LoRaWAN gateway có thể gửi lại cùng một gói tin nếu không nhận được Ack từ server.
- Sử dụng Redis để lưu `fCnt` (Frame Counter) của từng `devEui` trong 10 phút.
- Nếu `fCnt` mới <= `fCnt` cũ -> Bỏ qua.

## 3. Giám sát Sức khỏe (Health Checks)
Cung cấp endpoint `/health` để theo dõi trạng thái hệ thống:
- Kiểm tra kết nối Database (Postgres).
- Kiểm tra kết nối Redis.
- Kiểm tra trạng thái InfluxDB.
