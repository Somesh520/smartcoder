# Deploying Node.js to Google Compute Engine (Free Tier)

This guide shows you how to host your `smartcoder` backend on a **Google Cloud VM (e2-micro)** for free.

## 1. Create the VM Instance
1.  Go to **[Google Cloud Console](https://console.cloud.google.com/)** -> **Compute Engine** -> **VM Instances**.
2.  Click **Create Instance**.
3.  **Name:** `smartcoder-backend`
4.  **Region:** `us-central1`, `us-west1`, or `us-east1` (Only these are free tier eligible).
5.  **Machine Type:** `e2-micro` (2 vCPUs, 1 GB memory).
6.  **Boot Disk:** Change to **Ubuntu 20.04 LTS** (Standard Persistent Disk 30GB is free).
7.  **Firewall:** Check both:
    *   [x] Allow HTTP traffic
    *   [x] Allow HTTPS traffic
8.  Click **Create**.

## 2. Connect to VM
1.  Once created, click the **SSH** button next to your instance in the list.
2.  A terminal window will open.

## 3. Install Software (Node.js, Git, PM2)
Run these commands inside the SSH terminal:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify install
node -v
npm -v

# Install PM2 (Process Manager to keep app running)
sudo npm install -g pm2
```

## 4. Setup Your Code
You need to get your code onto the server. The easiest way is `git clone`.

```bash
# Clone your repo (Use your actual GitHub URL)
git clone https://github.com/Somesh520/smartcoder.git

# Enter backend directory
cd smartcoder/backend

# Install dependencies
npm install
```

## 5. Configure Environment Variables
You need to create your `.env` file on the server.

```bash
# Create and edit .env file
nano .env
```
*(Paste your entire `.env` content here. Right-click to paste in the web SSH terminal).*
*   **Important:** Set `CLIENT_URL=https://smartcoder-black.vercel.app`
*   Press `Ctrl+O`, `Enter` to save, then `Ctrl+X` to exit.

## 6. Start the App
```bash
# Start with PM2
pm2 start server.js --name "backend"

# Save PM2 list so it restarts on reboot
pm2 save
pm2 startup
# (Run the command it gives you to finish startup setup)
```

## 7. Open Firewall Port 3000
By default, Google only allows port 80/443. Your app runs on 3000.
1.  Go to **VPC Network** -> **Firewall**.
2.  Click **Create Firewall Rule**.
3.  Name: `allow-3000`
4.  Targets: `All instances in the network`
5.  Source IPv4 ranges: `0.0.0.0/0`
6.  Protocols and ports: `tcp:3000`
7.  Click **Create**.

## 8. Test It
Your backend URL is now `http://<YOUR_EXTERNAL_IP>:3000`. You can find the External IP in the VM Instances list.

## 9. (Optional but Recommended) Setup Domain & HTTPS
Using an IP address is ugly and insecure. To get `https://api.yourdomain.com`:
1.  Point your domain's **A Record** to your VM's External IP.
2.  Install Nginx and Certbot on the VM to proxy port 80 -> 3000.

*(This is advanced. Stick to HTTP IP for testing first, or stay on Render for effortless HTTPS).*
