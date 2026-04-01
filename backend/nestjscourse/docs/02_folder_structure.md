# 02. Cấu trúc Thư mục (Clean Architecture)

Dự án được tổ chức theo kiến trúc **Clean Architecture** (Ports & Adapters), giúp tách biệt hoàn toàn Logic nghiệp vụ (Business) khỏi Framework (NestJS) và Database (Postgres/Influx/Redis).

## 1. Sơ đồ Thư mục `src/`

```text
src/
├── sensor/                 # Module quản lý Dữ liệu Cảm biến (Core)
│   ├── domain/                         # Logic nghiệp vụ & Interfaces
│   │   ├── sensor-reading.model.ts     # Domain Model chính (Thresholds)
│   │   ├── sensor-reading.repository.ts # Port: Lưu Postgres
│   │   ├── sensor-cache.repository.ts   # Port: Cache Redis
│   │   ├── time-series.repository.ts   # Port: Lưu InfluxDB
│   │   └── sensor-payload.decoder.ts   # Decoder dữ liệu ChirpStack
│   ├── use-cases/          # Tầng kịch bản nghiệp vụ
│   │   ├── process-uplink.use-case.ts  # Điều phối lưu trữ đa tầng
│   │   └── get-sensor-history.use-case.ts
│   ├── infrastructure/                 # Adapters hạ tầng (DB, Redis, Influx)
│   │   ├── sensor-reading.entity.ts    # TypeORM Entity
│   │   ├── typeorm-sensor-reading.repository.ts # Adapter: Postgres
│   │   ├── redis-sensor-cache.repository.ts     # Adapter: Redis
│   │   ├── influx-time-series.repository.ts     # Adapter: InfluxDB
│   │   ├── redis.service.ts            # Provider kết nối Redis
│   │   └── influx.service.ts           # Provider kết nối InfluxDB
│   ├── sensor.controller.ts # Adapter vào (REST API /latest, /analytics)
│   └── sensor.module.ts     # Wiring module
│
├── alert/                  # Module quản lý Cảnh báo
│   ├── domain/             # Model Alert, logic báo cháy
│   ├── use-cases/          # Trigger alert, Get alerts
│   ├── infrastructure/     # TypeORM Entity cho alerts
│   ├── alert.controller.ts
│   └── alert.module.ts
│
├── device/                 # Module quản lý Lệnh Thiết bị (Downlink)
│   ├── domain/             # Model DeviceCommand, Downlink Port interface
│   ├── use-cases/          # Send command use case
│   └── device.controller.ts
│
├── mqtt/                   # Adapter MQTT (Kết nối ChirpStack)
│   ├── mqtt.service.ts     # Implement Downlink Port & Xử lý routing MQTT
│   └── mqtt.module.ts
│
├── lorawan/                # Entry point cho các sự kiện LoRaWAN
└── auth/ & users/          # Module quản lý Tài khoản & Bảo mật JWT
```

## 2. Ý nghĩa các Tầng

### 🚀 Tầng Domain (`*/domain/`)
- **Quan trọng nhất**: Chứa "luật chơi" của hệ thống (ví dụ: nhiệt độ bao nhiêu thì coi là cháy).
- **Thành phần**: Models (Entity domain), Repository Interfaces (Ports).

### ⚙️ Tầng Use Cases (`*/use-cases/`)
- **Nhiệm vụ**: Điều phối luồng dữ liệu (Ví dụ: Uplink -> Decode -> Lưu 3 lớp -> Trigger Alert).
- **Chỉ phụ thuộc Domain**: Chỉ sử dụng các interface và model từ tầng Domain.

### 🌐 Tầng Infrastructure (`*/infrastructure/`)
- **Nhiệm vụ**: Hiện thực hóa các interface từ Domain (Redis, InfluxDB, TypeORM).
- **Phụ thuộc Framework**: Nơi chứa Entity của DB, các thư viện kết nối bên ngoài.

### 🎮 Tầng Adapter (Controller / MQTT Service)
- **Nhiệm vụ**: Chuyển đổi dữ liệu từ thế giới bên ngoài (HTTP Request, MQTT Message) vào tầng Use Case.
