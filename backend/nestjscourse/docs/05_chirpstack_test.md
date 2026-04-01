# Hướng dẫn Kiểm thử với ChirpStack (MQTT)

Tài liệu này hướng dẫn cách mô phỏng dữ liệu từ ChirpStack v4 đẩy về Backend để kiểm tra logic Báo Cháy.

## 1. Cấu trúc Topic ChirpStack v4
Mặc định ChirpStack v4 đẩy dữ liệu theo format JSON lên topic:
`application/{{application_id}}/device/{{dev_eui}}/event/up`

## 2. Mô phỏng Uplink (Dùng script Node.js)
Vì Windows không có sẵn `mosquitto_pub`, mình đã tạo một script test bằng Node.js.

Mở một Terminal mới và chạy lệnh sau:
```bash
npx ts-node scripts/mock-uplink.ts
```

*Script này sẽ gửi một gói tin giả lập có Temperature=75.5 và Smoke=600 (vượt ngưỡng báo cháy) lên broker MQTT.*

## 3. Mô phỏng bằng mosquitto_pub (Nếu đã cài đặt)
Nếu bạn đã cài Mosquitto, bạn có thể dùng lệnh:
```bash
mosquitto_pub -h 127.0.0.1 -p 1883 -t "application/1/device/1122334455667788/event/up" -m '{"deviceInfo":{"devEui":"1122334455667788"},"object":{"temperature":75.0,"smoke":650}}'
```

## 3. Kiểm tra bằng API (Postman)
Sau khi đẩy dữ liệu bằng MQTT, bạn có thể kiểm tra kết quả qua API:

- **Lấy trạng thái tức thời (Redis):**
`GET http://localhost:3000/sensors/1122334455667788/latest`

- **Lấy phân tích lịch sử (InfluxDB):**
`GET http://localhost:3000/sensors/1122334455667788/analytics?range=-1h`

- **Lấy lịch sử báo cáo (Postgres):**
`GET http://localhost:3000/sensors/1122334455667788/history`

- **Lấy danh sách cảnh báo:**
`GET http://localhost:3000/alerts`

## 4. Mô phỏng Join Request
```bash
mosquitto_pub -h 127.0.0.1 -p 1883 -t "application/1/device/1122334455667788/event/join" -m '{
    "deviceInfo": {
        "devEui": "1122334455667788"
    },
    "devAddr": "01af23cd"
}'
```
