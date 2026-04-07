import type { BlogPost } from './blogPostTypes'

export const nginxInstallationPost: BlogPost = {
  slug: 'nginx-installation-reverse-proxy-ubuntu',
  title: 'Nginx Complete Guide (Ubuntu) — Static, Proxy, Load Balance, SSL, PM2',
  date: 'Draft',
  category: 'Web Server',
  image: '/blog-nginx.svg',
  excerpt:
    'Install + UFW၊ folder structure၊ static site (`static-app`)၊ Node/Next reverse proxy (WebSocket headers)၊ upstream load balance၊ Certbot SSL၊ HTTP→HTTPS redirect၊ full 443 config၊ Gzip + security headers၊ PM2၊ debugging — Real use case နဲ့ common errors ပါဝင်ပါတယ်။',
  readTime: '22 min read',
  author: 'Phyo Maung Maung',
  detailIntro:
    'ဒီလမ်းညွှန်က Ubuntu ပေါ်မှာ Nginx ကို install လုပ်ပြီး static website၊ dynamic app (Node.js / Next.js) reverse proxy၊ multiple backend load balancing၊ Let\'s Encrypt SSL၊ production tuning (Gzip၊ security headers)၊ PM2 နဲ့ process run ချိတ်ပြီး debug လုပ်ပုံကို အဆင့်လိုက် ရေးထားပါတယ်။ Domain (`static.yourdomain.com`, `app.yourdomain.com`) တွေကို မိမိ DNS နဲ့ အစားထိုးပါ။',
  detailSummary: [
    'Config ပြင်ပြီးတိုင်း `sudo nginx -t` စစ်ပြီးမှ `sudo systemctl reload nginx` လုပ်ပါ။',
    'User → Domain → Nginx (port 80/443) → static file serve သို့မဟုတ် `proxy_pass` နဲ့ backend (Node, Laravel, စသည်)။',
    'Real use case ဥပမာ — `helpdesk.domain.com` → Next.js :3000; `api.domain.com` → Laravel :8000; `static.domain.com` → HTML build။',
    '502 / 404 / SSL / WebSocket ပြဿနာတွေကို အောက်က Extra Notes မှာ ကြည့်ပါ။',
  ],
  steps: [
    {
      title: '🧱 STEP 1 — Install Nginx (Ubuntu)',
      description:
        'ပြီးရင် browser မှာ `http://your-server-ip` ဝင်ကြည့်ပါ — Nginx default page မြင်ရပါမယ်။',
      code: `sudo apt update
sudo apt install nginx -y

# Start + Enable
sudo systemctl start nginx
sudo systemctl enable nginx

# Check
sudo systemctl status nginx

# Firewall (IMPORTANT)
sudo ufw allow 'Nginx Full'
sudo ufw reload`,
    },
    {
      title: '📁 STEP 2 — Folder Structure',
      description: 'Nginx config နဲ့ virtual host ဖိုင်တွေ ရှိတဲ့ နေရာတွေဖြစ်ပါတယ်။',
      code: `# Typical layout:
/etc/nginx/
├── nginx.conf
├── sites-available/
├── sites-enabled/`,
    },
    {
      title: '🌐 STEP 3 — Static Website Setup',
      description:
        '3.1 project folder၊ 3.2 HTML၊ 3.3 Nginx config၊ 3.4 enable site (symlink)၊ 3.5 `nginx -t` + reload။',
      code: `# 3.1 Create project folder
sudo mkdir -p /var/www/static-app
sudo chown -R $USER:$USER /var/www/static-app

# 3.2 Create HTML — nano /var/www/static-app/index.html
# --- file: index.html ---
<!DOCTYPE html>
<html>
<head>
    <title>Static App</title>
</head>
<body>
    <h1>Welcome 🚀</h1>
</body>
</html>

# 3.3 Nginx config — sudo nano /etc/nginx/sites-available/static-app.conf
# --- file: static-app.conf ---
server {
    listen 80;
    server_name static.yourdomain.com;

    root /var/www/static-app;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \\.(jpg|jpeg|png|css|js|ico)$ {
        expires 30d;
    }
}

# 3.4 Enable site
sudo ln -s /etc/nginx/sites-available/static-app.conf /etc/nginx/sites-enabled/

# 3.5 Reload
sudo nginx -t
sudo systemctl reload nginx`,
    },
    {
      title: '⚡ STEP 4 — Dynamic App (Node.js / Next.js)',
      description:
        '4.1 app run (`localhost:3000`)၊ 4.2 `app.conf` reverse proxy (WebSocket headers)၊ 4.3 enable + reload။',
      code: `# 4.1 Run app
cd /var/www/app
npm install
npm run build
npm start
# App runs on http://localhost:3000

# 4.2 Nginx — sudo nano /etc/nginx/sites-available/app.conf
server {
    listen 80;
    server_name app.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        proxy_cache_bypass $http_upgrade;
    }
}

# 4.3 Enable
sudo ln -s /etc/nginx/sites-available/app.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx`,
    },
    {
      title: '🔁 STEP 5 — Multi Backend (Load Balancing)',
      description: 'Node process နှစ်ခု (ဥပမာ port 3000၊ 3001) ကို `upstream` နဲ့ ဝေမျှပါတယ်။',
      code: `sudo nano /etc/nginx/sites-available/lb.conf

upstream backend_cluster {
    least_conn;

    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name lb.yourdomain.com;

    location / {
        proxy_pass http://backend_cluster;
    }
}

sudo ln -s /etc/nginx/sites-available/lb.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx`,
    },
    {
      title: '🔒 STEP 6 — Install SSL (HTTPS)',
      description:
        'Certbot က certificate ထည့်ပြီး nginx config မှာ SSL နဲ့ redirect ကို အလိုအလျောက် ပြင်ပေးနိုင်ပါတယ်။',
      code: `sudo apt install certbot python3-certbot-nginx -y

# Generate SSL (example domain)
sudo certbot --nginx -d app.yourdomain.com

# Test renewal
sudo certbot renew --dry-run`,
    },
    {
      title: '🔁 STEP 7 — HTTP → HTTPS Redirect (manual)',
      code: `server {
    listen 80;
    server_name app.yourdomain.com;

    return 301 https://$host$request_uri;
}`,
    },
    {
      title: '🔒 STEP 8 — Full HTTPS Config (manual clean version)',
      code: `server {
    listen 443 ssl http2;
    server_name app.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}`,
    },
    {
      title: '⚙️ STEP 9 — Production Optimization',
      description:
        'Gzip ကို `/etc/nginx/nginx.conf` ရဲ့ `http { }` block ထဲမှာ ဖွင့်ပါ။ Security headers ကို `server` block ထဲမှာ ထည့်ပါ။',
      code: `# Inside http { } — gzip
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Inside server { } — security headers (example)
add_header X-Frame-Options SAMEORIGIN;
add_header X-Content-Type-Options nosniff;`,
    },
    {
      title: '🚀 STEP 10 — Run App with PM2 (IMPORTANT)',
      code: `npm install -g pm2
pm2 start npm --name "app" -- start
pm2 save
pm2 startup`,
    },
    {
      title: '🔍 STEP 11 — Debugging',
      code: `# Check port
ss -tulnp | grep 3000

# Logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log`,
    },
  ],
  commands: [
    { command: 'sudo nginx -t', description: 'Validate configuration before reload' },
    { command: 'sudo systemctl reload nginx', description: 'Apply config (graceful)' },
    { command: 'ss -tulnp | grep 3000', description: 'See if app listens on 3000' },
    { command: 'sudo certbot renew --dry-run', description: 'Test SSL renewal' },
  ],
  notes: [
    '📌 FINAL FLOW (အရေးကြီး): User → Domain → Nginx (80/443) → Static (file serve) သို့မဟုတ် Dynamic (proxy → Node.js / အခြား backend)။',
    '🔥 Real use case: `helpdesk.domain.com` → Nginx → Next.js (:3000); `api.domain.com` → Nginx → Laravel (:8000); `static.domain.com` → Nginx → HTML build။',
    '❗ Common errors — 502: backend down သို့မဟုတ် `proxy_pass` မှားနေ; 404: `root` path မှား သို့မဟုတ် `try_files` မှား; SSL fail: cert path မှား သို့မဟုတ် domain မကိုက်ညီ; WebSocket fail: `Upgrade` / `Connection` header မပါ။',
  ],
}
