# 05. Kịch bản Thử nghiệm (Testing Scenarios)

Dùng để xác minh các chức năng của nền tảng hoạt động chính xác theo thiết kế.

## 1. Thử nghiệm Chức năng Báo Cháy (Uplink)

- **Mục tiêu**: Kiểm tra hệ thống nhận diện đúng trạng thái cháy từ ChirpStack.
- **Kịch bản**: Gửi dữ liệu giả lập qua MQTT.
- **Lệnh thực hiện**: `npx ts-node scripts/mock-uplink.ts`
- **Kết quả mong đợi**:
  - Log Backend hiện: `ALERT [FIRE] triggered for 1122334455667788`.
  - API `GET /alerts` trả về bản ghi cảnh báo mới nhất.
  - API `GET /sensors/1122334455667788/history` có dữ liệu mới.

## 2. Kiểm tra Hiệu năng & Dữ liệu (Platform Features)

*   **Lấy trạng thái tức thời (Redis Cache)**:
    - Endpoint: `GET /sensors/{{devEui}}/latest`
    - Mục tiêu: Kiểm tra xem dữ liệu vừa gửi có "hiện ngay" trong cache không.
*   **Truy vấn Analytics (InfluxDB History)**:
    - Endpoint: `GET /sensors/{{devEui}}/analytics?range=-1h`
    - Mục tiêu: Kiểm tra lịch sử sensor được truy vấn từ Time-series DB.
*   **Báo cáo lịch sử (Postgres History)**:
    - Endpoint: `GET /sensors/{{devEui}}/history?limit=10`
    - Mục tiêu: Kiểm tra dữ liệu lưu trữ bền vững trong RDBMS.

## 3. Thử nghiệm Bảo mật (Authentication)

- **Kịch bản 1 (Fail)**: Gọi API `GET /alerts` mà không đính kèm Token.
- **Kết quả mong đợi**: HTTP Status 401 Unauthorized.
- **Kịch bản 2 (Success)**: Đăng nhập lấy token, sau đó gọi lại API.
- **Kết quả mong đợi**: HTTP Status 200 OK kèm dữ liệu JSON.

## 3. Thử nghiệm Điều khiển (Downlink)

- **Mục tiêu**: Kiểm tra lệnh điều khiển được gửi đúng topic MQTT.
- **Kịch bản**: Dùng Postman gửi lệnh `ACTIVATE_SPRINKLER`.
- **Kết quả mong đợi**: 
  - Log Backend hiện: `Downlink sent to 1122334455667788 via topic...`.
  - (Nếu có Broker monitor): Thấy message xuất hiện ở topic `command/down`.

## 4. Thử nghiệm Giải mã (Decoding)

- **Kịch bản**: Gửi payload dạng Base64 (nếu sensor không có bộ decode tại ChirpStack).
- **Cách thực hiện**: Sửa script `mock-uplink.ts` để gửi field `data` thay vì `object`.
- **Kết quả mong đợi**: Hệ thống giải mã được byte và lưu đúng nhiệt độ/độ ẩm.

## 5. Thử nghiệm Khả năng Mở rộng (Scalability)

- **Kịch bản**: Giả lập dữ liệu có thêm trường `co2`.
- **Kết quả mong đợi**: 
  - Cột `co2` trong bảng `app_sensor_reading` được cập nhật.
  - API lịch sử trả về thông tin CO2 trong phần `metrics`.
