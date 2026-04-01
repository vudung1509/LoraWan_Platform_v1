# 06. Hướng dẫn Kết nối Gateway Vật lý (RAK5146L + Raspberry Pi)

Tài liệu này hướng dẫn cách kết nối Gateway thực tế vào hệ thống ChirpStack Docker và kiểm tra luồng dữ liệu từ Node đến Backend.

## 1. Sơ đồ Kết nối (E2E Path)
`LoRa Node` -> (Radio) -> `RAK5146L Gateway` -> (UDP Port 1700) -> `ChirpStack Gateway Bridge (Docker)` -> (MQTT) -> `ChirpStack Server` -> (MQTT) -> `NestJS Backend`

## 2. Cấu hình trên Raspberry Pi (RAK5146L)
Bạn cần cấu hình **Packet Forwarder** trên Raspberry Pi để trỏ về máy tính đang chạy Docker.

1.  Mở file `global_conf.json` hoặc `local_conf.json` (thường nằm ở thư mục cài đặt RAK Chirpstack/Packet Forwarder).
2.  Tìm phần `gateway_conf` và sửa:
    - `"server_address": "IP_MAY_TINH_CHAY_DOCKER"` (Ví dụ: `192.168.1.15`).
    - `"serv_port_up": 1700`
    - `"serv_port_down": 1700`
3.  Khởi động lại service packet-forwarder: `sudo systemctl restart rak-pppd` (hoặc tên tương ứng tùy bản cài đặt).

## 3. Cấu hình trên ChirpStack Web UI (http://localhost:8080)

### Bước 1: Thêm Gateway
1.  Vào **Gateways** -> **Add gateway**.
2.  **Gateway ID**: Nhập Gateway ID (EUI) lấy từ lệnh `gateway-id` trên Raspberry Pi.
3.  **Stats interval**: 30 seconds.

### Bước 2: Tạo Device Profile
1.  Vào **Device profiles** -> **Add device profile**.
2.  **Region**: Chọn vùng của bạn (ví dụ AS923).
3.  **MAC version**: Tùy thiết bị (thường là 1.0.3).
4.  **Regional parameters revision**: A.

### Bước 3: Thêm Device (Node)
1.  Vào **Applications** -> Chọn hoặc tạo ứng dụng mới.
2.  **Add device**.
3.  **DevEUI**: Nhập EUI của cảm biến khói/nhiệt.
4.  **Device profile**: Chọn profile vừa tạo.
5.  Sang tab **OTAA keys** -> Nhập **AppKey**.

## 4. Kiểm tra Luồng dữ liệu

### Khởi động Backend
Đảm bảo NestJS đang chạy: `npm run start:dev`.

### Kiểm tra trên ChirpStack
- Vào tab **Device Data** của thiết bị trên web UI.
- Thử kích hoạt cảm biến (hoặc bấm nút test trên node).
- Bạn sẽ thấy bản tin `Uplink` xuất hiện.

### Kiểm tra trên NestJS Backend
- Backend sẽ log: `Saved reading for [DevEUI] | smoke=... temp=...`.
- Nếu thông số vượt ngưỡng, log sẽ hiện: `ALERT [FIRE] triggered`.

### Kiểm tra bằng Postman
- Gọi API `GET /sensors/[DevEUI]/history` để xem dữ liệu thực tế từ Node vừa được lưu vào database.
