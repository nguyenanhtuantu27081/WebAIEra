# Sổ tay vận hành (Runbook) — Triển khai WebAIEra trên VPS với Docker Compose

Tài liệu hướng dẫn chi tiết quy trình triển khai, cập nhật và xử lý sự cố website **AI Era (3D Spatial Intelligence Ecosystem)** chạy trên nền tảng Docker Compose tại VPS (Oracle Cloud / Ubuntu Server).

---

## 1. Thông tin kiến trúc & Hạ tầng

- **Registry Image:** `ghcr.io/nguyenanhtuantu27081/webaiera:latest`
- **Kiến trúc Image:** `linux/arm64` (và tương thích `linux/amd64`)
- **Web Server:** Nginx Alpine (HTML-first + Three.js module)
- **Port phục vụ:** `80` (HTTP) / `443` (HTTPS qua reverse proxy nếu có)
- **Giới hạn Log:** Tối đa 3 files x 3MB (`max-size: 3m`, `max-file: 3`)

---

## 2. Chuẩn bị trước khi triển khai (Prerequisites)

### Bước 1: Cài đặt Docker & Docker Compose trên VPS (nếu chưa có)
```bash
# Cập nhật packages
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cấp quyền cho user hiện tại chạy docker không cần sudo
sudo usermod -aG docker $USER
newgrp docker

# Kiểm tra phiên bản
docker --version
docker compose version
```

### Bước 2: Mở Firewall trên VPS (Security List & UFW)
- **Oracle Cloud Dashboard:** Vào *Networking* → *Virtual Cloud Networks* → *Security Lists* → Thêm Ingress Rule mở TCP port `80`, `443` cho `0.0.0.0/0`.
- **Trên máy chủ VPS:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# Nếu dùng iptables (Oracle Linux):
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || true
```

---

## 3. Quy trình Triển khai Lần đầu (Initial Deployment)

### Bước 1: Tạo thư mục dự án
```bash
mkdir -p ~/webaiera && cd ~/webaiera
```

### Bước 2: Tải file `docker-compose.yml`
```bash
curl -s -H "Authorization: token <YOUR_GITHUB_TOKEN>" \
  https://raw.githubusercontent.com/nguyenanhtuantu27081/WebAIEra/main/docker-compose.yml \
  -o docker-compose.yml
```

*(Hoặc tạo trực tiếp bằng lệnh `nano docker-compose.yml` và dán nội dung)*:
```yaml
services:
  webaiera:
    image: ghcr.io/nguyenanhtuantu27081/webaiera:latest
    container_name: webaiera
    restart: always
    ports:
      - "80:80"
    environment:
      - TZ=Asia/Ho_Chi_Minh
    logging:
      driver: "json-file"
      options:
        max-size: "3m"
        max-file: "3"
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 512M
```

### Bước 3: Đăng nhập vào GitHub Container Registry (GHCR)
```bash
echo "<YOUR_GITHUB_TOKEN>" | docker login ghcr.io -u nguyenanhtuantu27081 --password-stdin
```

### Bước 4: Kéo image và khởi chạy container
```bash
# Tải image mới nhất về
docker compose pull

# Khởi chạy ngầm container
docker compose up -d
```

### Bước 5: Kiểm tra trạng thái hoạt động
```bash
docker compose ps
docker compose logs --tail=50
```

---

## 4. Quy trình Cập nhật Phiên bản mới (Update / Rolling Upgrade)

Khi có commit mới trên nhánh `main`, GitHub Actions sẽ tự động build và push image lên GHCR. Để cập nhật ứng dụng trên VPS:

```bash
cd ~/webaiera

# 1. Kéo phiên bản Docker Image mới nhất
docker compose pull

# 2. Khởi động lại container với image mới (không downtime đáng kể)
docker compose up -d --remove-orphans

# 3. Dọn dẹp các images cũ để giải phóng dung lượng ổ cứng
docker image prune -f
```

---

## 5. Lệnh quản trị & Vận hành thường dùng

| Thao tác | Câu lệnh |
|---|---|
| **Xem trạng thái container** | `docker compose ps` |
| **Xem log realtime** | `docker compose logs -f` |
| **Xem 100 dòng log gần nhất** | `docker compose logs --tail=100` |
| **Khởi động lại service** | `docker compose restart` |
| **Dừng container** | `docker compose down` |
| **Khởi động lại từ đầu (force recreate)** | `docker compose up -d --force-recreate` |
| **Kiểm tra tài nguyên (CPU/RAM/Network)** | `docker stats webaiera` |

---

## 6. Xử lý sự cố (Troubleshooting)

### Vấn đề 1: Lỗi `permission denied` khi pull image từ GHCR
- **Nguyên nhân:** Token GitHub hết hạn hoặc chưa đăng nhập GHCR.
- **Khắc phục:** Chạy lại lệnh `echo "YOUR_TOKEN" | docker login ghcr.io -u nguyenanhtuantu27081 --password-stdin`.

### Vấn đề 2: Port 80 bị chiếm dụng (`bind: address already in use`)
- **Kiểm tra tiến trình đang chạy port 80:**
  ```bash
  sudo lsof -i :80  hoặc  sudo netstat -tlpn | grep :80
  ```
- **Tắt Nginx/Apache đang chạy sẵn trên VPS:**
  ```bash
  sudo systemctl stop nginx apache2 2>/dev/null
  sudo systemctl disable nginx apache2 2>/dev/null
  docker compose up -d
  ```

### Vấn đề 3: Không truy cập được website qua IP/Domain
1. Kiểm tra container có đang chạy không: `docker compose ps`
2. Thử curl ngay trên VPS: `curl -I http://localhost:80`
3. Kiểm tra Firewall UFW và Security List của Oracle Cloud.
