import type { BlogPost } from './blogPostTypes'

export const nginxInstallationPost: BlogPost = {
  slug: 'nginx-installation-reverse-proxy-ubuntu',
  title: 'Nginx Complete Guide (Ubuntu) — Static, Proxy, Load Balance, SSL, PM2',
  date: 'Published · 7 Apr 2026',
  category: 'Web Server',
  image: '/blog-covers/nginx.png',
  excerpt:
    'Nginx ထည့်ပြီး static တစ်ခု၊ Next ကို proxy တစ်ခု၊ upstream နဲ့ ဝေမျှတာ၊ Certbot နဲ့ SSL၊ နောက်ဆုံး PM2 နဲ့ log ကြည့်တာ အထိ တစ်လျှောက်လုံး။ အောက်မှာ 502/404 လိုမျိုး ဘာကြောင့် ဖြစ်တတ်လဲလည်း ရေးထားပါတယ်။',
  readTime: '22 min read',
  author: 'Phyo Maung Maung',
  detailIntro:
    'ဒါက လက်တွေ့မှာ အသုံးများတဲ့ အပိုင်းတွေကို ပေါင်းထားတာပါ — static၊ reverse proxy၊ load balance၊ SSL၊ နောက်ဆုံး PM2။ `yourdomain.com` ဆိုတဲ့ နေရာတွေကို ကိုယ့်ဒိုမိန်းနဲ့ လဲပါ။',
  detailSummary: [
    'ပြင်တိုင်း မမေ့လိုက်ပါနဲ့ — `nginx -t` ပြီးမှ reload။',
    'လူသုံးတာ → DNS → Nginx → ဖိုင်တွေထုတ်မယ် သို့မဟုတ် backend ကို proxy။',
    'ဥပမာ — helpdesk က Next၊ api က Laravel၊ static က HTML — တစ်ခုချင်းစီ server block ခွဲထားလို့ရပါတယ်။',
    'ချိတ်မရတာ ဖြစ်ရင် အောက်က notes ကို နှိပ်ကြည့်ပါ။',
  ],
  steps: [
    {
      title: '🧱 STEP 1 — Install Nginx (Ubuntu)',
      description:
        'ထည့်ပြီးရင် IP နဲ့ ဝင်ကြည့်ပါ။ welcome page မြင်ရရင် ပထမဆုံး အဆင့် ပြီးပါပြီ။',
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
      description: 'config တွေ ဘယ်မှာထားလဲ ဆိုတာ မှတ်ထားရင် နောက်ပိုင်း ပြင်ရလွယ်ပါတယ်။',
      code: `# Typical layout:
/etc/nginx/
├── nginx.conf
├── sites-available/
├── sites-enabled/`,
    },
    {
      title: '🌐 STEP 3 — Static Website Setup',
      description:
        'ဖိုင်တွေကို `/var/www` အောက်မှာ ထားပါ။ sites-available ထဲမှာ ရေးပြီး sites-enabled ကို symlink နဲ့ ချိတ်ပါ။',
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
        'app က localhost:3000 မှာ တက်နေရမယ်။ Next ဆိုရင် WebSocket header တွေ ပါမှ hot reload လိုမျိုး အလုပ်လုပ်ပါတယ်။',
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
      description: 'process နှစ်ခုကို `least_conn` နဲ့ ဝေမျှတာ — တစ်ခုကျနေရင် နောက်တစ်ခုကို ပို့ပါတယ်။',
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
        'Certbot `--nginx` က config ကို အများအားဖြင့် ကိုယ့်ဘာသာ ပြင်ပေးပါတယ်။ မလုပ်ရင် manual redirect ကို STEP 7 မှာ ကြည့်ပါ။',
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
        'gzip ကို http {} ထဲ၊ header တွေကို server {} ထဲ — မထည့်လဲ အလုပ်လုပ်ပါတယ်၊ ထည့်ရင် ပိုကောင်းပါတယ်။',
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
    'လမ်းကြောင်းတစ်ချက်တည်း — browser → Nginx → ဖိုင်သို့မဟုတ် backend။',
    '502 ဆိုရင် အများအားဖြင့် app မတက်ရသေးတာ သို့မဟုတ် proxy_pass port မှား။',
    '404 ဆိုရင် root လမ်းမှား သို့မဟုတ် build ဖိုင်မရှိတာ။ SSL ဆိုရင် cert နဲ့ server_name ကိုက်လား စစ်ပါ။',
    'WebSocket မလုပ်ရင် proxy_set_header Upgrade/Connection ကို ပြန်ကြည့်ပါ။',
  ],
}
