# 07. Lộ trình Phát triển Nền tảng IoT Chuyên nghiệp (Unified Roadmap)

Tài liệu này quản lý tiến độ phát triển hệ thống từ mức độ cá nhân đến quy mô **Platform công nghiệp**.

## 🛡️ Phần 1: Nền tảng Kỹ thuật (Foundations)
- [x] **Ngôn ngữ (Language)**: TypeScript/JavaScript (Event Loop, Async/Await).
- [x] **Cấu trúc dữ liệu & Giải thuật (DSA)**: Map, Set, Queue.
- [x] **VCS**: Git (GitHub/GitLab).

## 📡 Phần 2: Chuẩn Giao thức & Nền tảng
- [x] **Giao thức**: MQTT (IoT), REST (Web/Mobile).
- [x] **LoRaWAN**: ChirpStack (Network/Application Server).

## 🏗️ Phần 3: Kiến trúc & Dữ liệu
- [x] **Kiến trúc sạch (Clean Architecture)**: Tách biệt Domain, Use Cases, và Infrastructure.
- [x] **Database**: PostgreSQL, InfluxDB, Redis.

## 🚀 Phần 4: DevOps & Triển khai
- [x] Củng cố & Bảo mật (Hardening - Phase 1): Đạt 100% (Secrets, DTO, MQTT Auth).
- [/] Ổn định hóa (Stabilization - Phase 2):
    - [ ] Hàng đợi xử lý (Queue-worker với BullMQ).
    - [ ] Chống trùng lặp dữ liệu (Idempotency với Redis).
    - [ ] Giám sát sức khỏe (Healthcheck / Terminus).
- [ ] **Harden (Phase 3)**:
    - [ ] CI/CD (GitHub Actions).
    - [ ] Observability (Prometheus/Grafana).

## 🖥️ Phần 5: Frontend & Dashboard
- [ ] **Framework**: Next.js.
- [ ] **Visualization**: Chart.js / Leaflet Map.
