import type { BlogPost } from './blogPostTypes'

export const openrestyWafPost: BlogPost = {
  slug: 'openresty-webserver',
  title: 'OpenResty — Reverse Proxy + Lua + Redis (Basic Rate-Limiting WAF)',
  date: 'Published · 7 Apr 2026',
  category: 'Web Server',
  image: '/blog-covers/openresty.png',
  excerpt:
    'OpenResty + Lua + Redis နဲ့ IP တစ်ခုချင်းစီ request လိုက် လုပ်ပြီး ပိတ်တဲ့ အရိုးအချင်းစား WAF ဥပမာ။ ၁၀ စက္ကန့်အတွင်း ၂၀ ကျော်ရင် ခဏပိတ် — ကိုယ့်အတွက် ကိုယ် ပြင်ပါ။',
  readTime: '16 min read',
  author: 'Phyo Maung Maung',
  detailIntro:
    'ဒါက lab/tutorial အဆင့်ပါ။ အမှန်တကယ် production မှာ CDN၊ real IP၊ HTTPS ကို စဉ်းစားရပါသေးတယ်။ ဒီမှာ လုပ်ချင်တာက IP တစ်ခုက short time မှာ request တွေများလာရင် Redis မှာ အမှတ်အသားလုပ်ပြီး ခဏပိတ်တာပါ။',
  detailSummary: [
    '`rate:` နဲ့ `block:` key နဲ့ ရေတွက်ပါတယ်။ expire ကို Lua မှာ သတ်မှတ်ထားပါတယ်။',
    'lua-resty-redis က OpenResty package နဲ့ ပါလာတတ်ပါတယ်။ မပါရင် doc ကြည့်ပါ။',
    'js/css ကို WAF မထိအောင် location ခွဲထားတာ latency ကို လျှော့ပေးပါတယ်။',
  ],
  steps: [
    {
      title: 'အဆင့် (၁) — Redis server install',
      description:
        'Redis မတက်ရင် အောက်က Lua က error ရေးပြီး request ကို မပိတ်နိုင်ပါဘူး။',
      code: `sudo apt update
sudo apt install redis-server -y

sudo systemctl start redis-server
sudo systemctl enable redis-server`,
    },
    {
      title: 'အဆင့် (၂) — OpenResty install',
      description:
        'repo ကို Ubuntu version နဲ့ ကိုက်အောင် ထည့်ပါ။ apt-key ဟောင်း အသုံးပြုရင် နောက်ပိုင်း signed-by ကို ကြည့်ပါ။',
      code: `sudo apt install -y software-properties-common wget

wget -qO - https://openresty.org/package/pubkey.gpg | sudo apt-key add -

sudo add-apt-repository -y "deb http://openresty.org/package/ubuntu $(lsb_release -sc) main"

sudo apt update
sudo apt install -y openresty`,
    },
    {
      title: 'အဆင့် (၃) — WAF အတွက် Lua script (`waf.lua`)',
      description:
        'နံပါတ် ၂၀ နဲ့ ၁၀ စက္ကန့်က ကိုယ့်လိုအပ်ချက်နဲ့ လဲလို့ရပါတယ်။',
      code: `sudo mkdir -p /usr/local/openresty/nginx/conf/lua/
sudo nano /usr/local/openresty/nginx/conf/lua/waf.lua`,
    },
    {
      title: 'waf.lua — Redis password မသုံးရင်',
      code: `local redis = require "resty.redis"
local red = redis:new()

red:set_timeouts(1000, 1000, 1000)

local ok, err = red:connect("127.0.0.1", 6379)
if not ok then
    ngx.log(ngx.ERR, "WAF: Redis connection failed: ", err)
    return
end

local ip = ngx.var.remote_addr
local block_key = "block:" .. ip
local rate_key = "rate:" .. ip

local is_blocked, err = red:get(block_key)

if is_blocked ~= ngx.null and is_blocked == "1" then
    ngx.log(ngx.WARN, "WAF ACCESS DENIED: IP " .. ip .. " is still on block list.")
    return ngx.exit(ngx.HTTP_FORBIDDEN)
end

local req_count, err = red:incr(rate_key)
if not req_count then
    ngx.log(ngx.ERR, "WAF: Failed to increment count for ", ip)
    return
end

if req_count == 1 then
    red:expire(rate_key, 10)
elseif req_count > 20 then
    red:set(block_key, "1")
    red:expire(block_key, 60)

    ngx.log(ngx.ERR, "WAF BLOCK TRIGGERED: IP " .. ip .. " exceeded rate limit (20 reqs/10s). Blocking for 60s.")

    return ngx.exit(ngx.HTTP_FORBIDDEN)
end

red:set_keepalive(10000, 100)`,
    },
    {
      title: 'waf.lua — Redis password သုံးရင်',
      description: 'Redis မှာ password ထားထားရင် auth ကို မမေ့ပါနဲ့။',
      code: `local redis = require "resty.redis"
local red = redis:new()

red:set_timeouts(1000, 1000, 1000)

local ok, err = red:connect("127.0.0.1", 6379)
if not ok then
    ngx.log(ngx.ERR, "WAF: Redis connection failed: ", err)
    return
end

local auth_ok, auth_err = red:auth("YourStrongPassword123")
if not auth_ok then
    ngx.log(ngx.ERR, "WAF: Redis authentication failed: ", auth_err)
    return
end

local ip = ngx.var.remote_addr
local block_key = "block:" .. ip
local rate_key = "rate:" .. ip

local is_blocked, err = red:get(block_key)

if is_blocked ~= ngx.null and is_blocked == "1" then
    ngx.log(ngx.WARN, "WAF ACCESS DENIED: IP " .. ip .. " is still on block list.")
    return ngx.exit(ngx.HTTP_FORBIDDEN)
end

local req_count, err = red:incr(rate_key)
if not req_count then
    ngx.log(ngx.ERR, "WAF: Failed to increment count for ", ip)
    return
end

if req_count == 1 then
    red:expire(rate_key, 10)
elseif req_count > 20 then
    red:set(block_key, "1")
    red:expire(block_key, 60)

    ngx.log(ngx.ERR, "WAF BLOCK TRIGGERED: IP " .. ip .. " exceeded rate limit (20 reqs/10s). Blocking for 60s.")

    return ngx.exit(ngx.HTTP_FORBIDDEN)
end

red:set_keepalive(10000, 100)`,
    },
    {
      title: 'အဆင့် (၄) — Nginx configuration (reverse proxy & WAF)',
      description:
        'backend port ကို ကိုယ့်အက်ပ်နဲ့ ကိုက်အောင် ထားပါ။',
      code: `sudo nano /usr/local/openresty/nginx/conf/nginx.conf

# http { } အတွင်း ဥပမာ — မိမိ worker_processes / server_name ကို ချိန်ပါ
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    lua_package_path "/usr/local/openresty/lualib/?.lua;;";

    server {
        listen       80;
        server_name  localhost;

        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|otf)$ {
            proxy_pass http://127.0.0.1:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            access_log off;
        }

        location / {
            access_by_lua_file /usr/local/openresty/nginx/conf/lua/waf.lua;

            proxy_pass http://127.0.0.1:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}`,
    },
    {
      title: 'အဆင့် (၅) — OpenResty restart နှင့် စမ်းသပ်ခြင်း',
      description:
        'app က 3000 မှာ တက်နေရမယ်။ curl loop နဲ့ ပြေးကြည့်ရင် တစ်ချိန်မှာ 403 ရပါလိမ့်မယ်။',
      code: `sudo /usr/local/openresty/bin/openresty -t
sudo systemctl restart openresty

# Testing (same host)
for i in {1..250}; do curl -I http://localhost; done

# Redis — block keys ကြည့်ရန်
redis-cli keys "block:*"`,
    },
  ],
  commands: [
    { command: 'sudo /usr/local/openresty/bin/openresty -t', description: 'Test OpenResty/nginx config syntax' },
    { command: 'sudo systemctl restart openresty', description: 'Reload after config/Lua changes' },
    { command: 'redis-cli keys "block:*"', description: 'Inspect temporary IP blocks in Redis' },
    { command: 'redis-cli ping', description: 'Check Redis is up (if no auth)' },
  ],
  notes: [
    'apt-key က ခေတ်ဟောင်း — doc ထဲက GPG နည်းလမ်းကို ကြည့်ပါ။',
    'threshold နဲ့ block အချိန်က ကိုယ့်ဆိုင်ရာ traffic နဲ့ မတူရင် ပြင်ပါ။',
    'Redis down ဆိုရင် ဒီစာမျက်နှာက အကာအကွယ် မရှိပါဘူး။',
    'CDN နောက်က IP ဆိုရင် `remote_addr` တစ်ခုတည်းနဲ့ မပြီးပါဘူး။',
  ],
}
