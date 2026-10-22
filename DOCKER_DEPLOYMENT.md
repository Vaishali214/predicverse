# 🐳 PredicVerse — Docker & VPS Production Deployment Guide

This guide explains how to deploy **PredicVerse** to any cloud VPS (DigitalOcean, AWS, Linode, Hetzner) or on-premise server using **Docker Compose**.

---

## 🏗️ Architecture

```
                    Internet
                       │ (HTTP Port 80 / HTTPS Port 443)
                       ▼
┌────────────────────────────────────────────────────────┐
│  PredicVerse Client Container (Nginx Alpine)           │
│  ├── Serves React 18 + Vite Production Static Files     │
│  ├── SPA pushState Fallback (try_files /index.html)     │
│  ├── Gzip Compression & Asset Caching                   │
│  └── Reverse Proxy /api/ ───┐                          │
└─────────────────────────────┼──────────────────────────┘
                              │ Internal Docker Network (predicverse-net)
                              ▼
┌────────────────────────────────────────────────────────┐
│  PredicVerse Server Container (Node 20 Alpine)         │
│  ├── Express REST API (Port 3001)                      │
│  ├── Auto-runs `prisma migrate deploy` on boot         │
│  ├── Auto-populates initial seed data                  │
│  └── Passport, Wishlist, Travel DNA, AI & PDF Services │
└─────────────────────────────┬──────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────┐
│  PostgreSQL Container (Postgres 16 Alpine)             │
│  ├── Persistent Named Volume (predicverse_pgdata)      │
│  └── Healthcheck with pg_isready                       │
└────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start (Deploying on a VPS)

### 1. Provision a VPS
- **Recommended specs**: 1 vCPU, 2GB RAM (e.g., $4–$6/month Droplet on [DigitalOcean](https://digitalocean.com) or [Hetzner](https://hetzner.com)).
- **OS**: Ubuntu 22.04 LTS or 24.04 LTS.

### 2. Connect to your VPS
```bash
ssh root@your-vps-ip
```

### 3. Clone your GitHub repository
```bash
git clone https://github.com/Vaishali214/predicverse.git
cd predicverse
```

### 4. Run the one-command deployment script
```bash
chmod +x deploy.sh
./deploy.sh
```

The script will automatically:
- Install Docker and Docker Compose (if not already installed).
- Generate a `.env` file with a cryptographically secure 128-character `JWT_SECRET`.
- Build the Nginx frontend and Express backend containers.
- Spin up PostgreSQL 16 with a persistent volume.
- Run Prisma migrations (`prisma migrate deploy`) and seed data.
- Start all services in the background.

---

## ⚙️ Manual Step-by-Step Deployment

If you prefer to configure each step manually:

### 1. Copy Environment Variables
```bash
cp .env.docker.example .env
```

### 2. Configure `.env`
Edit `.env` using your preferred editor (`nano .env`):
```env
# Database Settings
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_database_password
POSTGRES_DB=predicverse
POSTGRES_PORT=5432

# Frontend Port
CLIENT_PORT=80

# Backend JWT Secret (Generate with: openssl rand -hex 64)
JWT_SECRET=your_generated_secret_string

# Optional AI Key (from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key

# CORS Allowed Origins (Comma-separated)
CLIENT_ORIGIN=http://your-vps-ip,https://yourdomain.com
```

### 3. Build & Start the Containers
```bash
docker compose up -d --build
```

### 4. Verify Services
```bash
docker compose ps
```

Check backend health:
```bash
curl http://localhost:3001/health
```

Expected output:
```json
{
  "status": "ok",
  "service": "PredicVerse Backend Gazette Service",
  "version": "1.0.0",
  "environment": "production",
  "database": "connected"
}
```

Visit `http://your-vps-ip` in your browser!

---

## 🔒 Custom Domain & Free SSL Setup (Let's Encrypt / Certbot)

To attach a domain (e.g. `predicverse.com`) with free HTTPS:

### Option A: Cloudflare (Easiest — 2 Minutes)
1. Point your domain's DNS `A` record to your VPS IP address.
2. Enable the **Cloudflare Proxy (Orange Cloud)**.
3. In Cloudflare SSL/TLS settings, select **Flexible** or **Full**.
4. Set `CLIENT_ORIGIN=https://yourdomain.com` in `.env` and run `docker compose up -d`.

### Option B: Certbot + Nginx on the Host
If you want SSL terminated directly on the server:
1. Change `CLIENT_PORT=8080` in `.env` so Docker doesn't take port 80.
2. Install Nginx and Certbot on Ubuntu:
   ```bash
   sudo apt update
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```
3. Create `/etc/nginx/sites-available/predicverse`:
   ```nginx
   server {
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
4. Enable the site and request the free SSL certificate:
   ```bash
   sudo ln -s /etc/nginx/sites-available/predicverse /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## 🛠️ Management & Maintenance Commands

### View Live Logs
```bash
# View logs from all services:
docker compose logs -f

# View only backend server logs:
docker compose logs -f server

# View only database logs:
docker compose logs -f db
```

### Restart Services
```bash
docker compose restart
```

### Update to the Latest Code
```bash
git pull origin main
docker compose up -d --build
```

### Database Backup & Restore
```bash
# Create a SQL backup:
docker compose exec -T db pg_dump -U postgres predicverse > backup_$(date +%F).sql

# Restore a backup:
docker compose exec -T db psql -U postgres predicverse < backup_2026-10-22.sql
```

### Stop Services
```bash
# Stop containers (preserves database data volume):
docker compose down

# Stop and wipe database data (CAUTION: Destructive):
docker compose down -v
```

---

## 💻 Local Testing with Docker Desktop

To run the full stack locally with Docker on Windows:
1. Open **Docker Desktop**.
2. Open PowerShell in the project directory:
   ```powershell
   .\deploy.ps1
   ```
3. Open `http://localhost` in your browser.
