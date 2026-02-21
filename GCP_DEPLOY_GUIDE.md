# ☁️ SmartCoder: Google Cloud Deployment Guide

Host your backend on a **Google Compute Engine (e2-micro)** for maximum performance and stability.

---

## 🏗️ Step 1: Initialize VM Instance
1.  Navigate to **[Google Cloud Console](https://console.cloud.google.com/)** -> **Compute Engine**.
2.  **Configuration**:
    *   **Name:** `smartcoder-backend-vm`
    *   **Region:** `us-central1` (FREE tier eligible).
    *   **Machine Type:** `e2-micro` (Shared Core).
    *   **Boot Disk:** **Ubuntu 20.04 LTS** (Standard Persistent Disk 30GB).
3.  **Firewall Settings**:
    *   [x] Allow HTTP traffic
    *   [x] Allow HTTPS traffic
4.  Click **Create**.

---

## 🖥️ Step 2: Environment Setup (SSH)
Connect via SSH and execute these commands to prepare the environment:

```bash
# Update and install Node.js v20
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 Process Manager
sudo npm install -g pm2
```

---

## 🏁 Step 3: Deployment Logic
1.  **Clone & Install**:
    ```bash
    git clone https://github.com/Somesh520/smartcoder.git
    cd smartcoder/backend && npm install
    ```
2.  **Secret Management**:
    ```bash
    nano .env
    ```
    *(Paste your secrets. Ensure `CLIENT_URL` points to your frontend Vercel domain).*
3.  **Launch**:
    ```bash
    pm2 start server.js --name "smartcoder-api"
    pm2 save && pm2 startup
    ```

---

## 🔓 Step 4: Networking (Firewall)
Google Cloud blocks custom ports by default. Open port **3000** in the **VPC Network -> Firewall** settings:
- **Direction**: Ingress
- **Action**: Allow
- **IP ranges**: `0.0.0.0/0`
- **Protocols/ports**: `tcp:3000`

---
> [!CAUTION]
> Never share your External IP publicly. Use a domain name with Cloudflare or Nginx for production traffic.

> [!TIP]
> Your persistence URL will be `http://<EXTERNAL_IP>:3000`. You can map this to a custom subdomain in your DNS settings.
