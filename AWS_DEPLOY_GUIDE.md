# ☁️ SmartCoder: AWS EC2 Deployment Guide

Deploying on **AWS EC2** is the best solution for bypassing Cloudflare blocks. Unlike Render, if LeetCode blocks your AWS IP, you can **change your server IP in 10 seconds** by assigning a new **Elastic IP** to your EC2 instance!

---

## 🛠️ Step 1: Launch an EC2 Instance (Free Tier)
1. Log in to your [AWS Console](https://aws.amazon.com/).
2. Search for **EC2** and click **Launch Instance**.
3. **Name**: `smartcoder-backend`
4. **OS (AMI)**: Select **Ubuntu** (24.04 LTS or 22.04 LTS).
5. **Instance Type**: Select `t2.micro` (or `t3.micro` depending on region) - both are **Free Tier eligible**.
6. **Key Pair**: Create a new key pair (`smartcoder-key.pem`), download it, and keep it safe.
7. **Network Settings (Security Group)**:
   * Select **Create Security Group**.
   * Check **Allow SSH traffic from** (Select `My IP` for safety, or `Anywhere` if you move locations).
   * Check **Allow HTTP traffic from the internet**.
   * Check **Allow HTTPS traffic from the internet**.
8. Click **Launch Instance**.

---

## 🔒 Step 2: Open Port 3000 in AWS Security Groups
1. Go to your running EC2 instance in the AWS Console.
2. Click on the **Security** tab at the bottom and click on your **Security Group**.
3. Click **Edit inbound rules**.
4. Click **Add rule**:
   * **Type**: `Custom TCP`
   * **Port Range**: `3000`
   * **Source**: `Anywhere-IPv4` (`0.0.0.0/0`)
5. Click **Save rules**.

---

## 🚀 Step 3: SSH and Setup the Server
Open your terminal and navigate to where you downloaded your `.pem` key:

```bash
# Set correct permissions for the key
chmod 400 smartcoder-key.pem

# SSH into the instance (replace with your EC2 Public IP)
ssh -i "smartcoder-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

Once logged in, run these commands to install **Node.js, Git, and PM2**:

```bash
# Update Ubuntu packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (v20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v
npm -v

# Install PM2 (Process Manager to run backend in the background)
sudo npm install -g pm2
```

---

## 🏗️ Step 4: Clone and Configure Backend
Still inside your SSH terminal:

```bash
# Clone the repository
git clone https://github.com/Somesh520/smartcoder.git
cd smartcoder/backend

# Install dependencies
npm install

# Create environment file
nano .env
```

Paste your environment variables into `.env` (using arrow keys and typing):
```env
PORT=3000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://your-frontend.vercel.app
SESSION_SECRET=your_session_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_SECRET=your_github_secret
GROQ_API_KEY=your_fresh_groq_key
NODE_ENV=production
```
*Press `Ctrl+O` then `Enter` to save, and `Ctrl+X` to exit.*

Start the server using PM2:
```bash
pm2 start server.js --name "smartcoder-backend"

# Ensure PM2 restarts backend if the server reboots
pm2 startup
pm2 save
```

Your backend is now running at `http://YOUR_EC2_PUBLIC_IP:3000`! You can update your frontend's `VITE_API_URL` to this address.

---

## 🔄 How to Change Your IP (Bypassing LeetCode Blocks)
If LeetCode/Cloudflare ever blocks your server IP again:
1. In the EC2 Dashboard sidebar, go to **Network & Security** -> **Elastic IPs**.
2. Click **Allocate Elastic IP address** and click **Allocate**.
3. Select the newly allocated Elastic IP, click **Actions** -> **Associate Elastic IP address**.
4. Choose your `smartcoder-backend` instance and click **Associate**.

**Boom! Your server now has a brand new, clean IP address.** If it ever gets blocked in the future, just release this Elastic IP and allocate a new one!

---

## 🌐 Step 5 (Optional): Add SSL and Nginx Proxy
If you want to map your backend to a domain (like `api.yourdomain.com`) and enable HTTPS, run:

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/default
```
Replace the content with an Nginx reverse proxy configuration pointing to `localhost:3000`, save, and run:
```bash
sudo systemctl restart nginx
# Setup SSL with Certbot
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx
```
