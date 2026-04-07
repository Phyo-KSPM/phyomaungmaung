import type { BlogPost } from './blogPostTypes'

export const openrestyWafPost: BlogPost = {
  slug: 'openresty-webserver',
  title: 'OpenResty — Reverse Proxy + Lua + Redis (Basic Rate-Limiting WAF)',
  date: 'Draft',
  category: 'Web Server',
  image: '/blog-openresty.svg',
  excerpt:
    'OpenResty ကို reverse proxy အနေနဲ့ သုံးပြီး Lua နဲ့ Redis ပေါင်းကာ IP တစ်ခုချင်းစီအတွက် request count နဲ့ ခေတ္တ block (TTL) လုပ်တဲ့ basic WAF ဥပမာ။ Ubuntu/Debian install၊ `waf.lua`၊ `nginx.conf` ချိန်ပြီး စမ်းသပ်ခြင်း။',
  readTime: '16 min read',
  author: 'Phyo Maung Maung',
  detailIntro:
    'OpenResty ကို reverse proxy အနေနဲ့ သုံးပြီး Lua script နဲ့ Redis ကို ပေါင်းကာ custom WAF (Web Application Firewall) တည်ဆောက်တဲ့ နည်းလမ်းဟာ performance ကောင်းတဲ့ architecture ဖြစ်နိုင်ပါတယ်။ ဒီလမ်းညွှန်မှာ IP တစ်ခုကနေ request အများကြီး (ဥပမာ brute-force / abuse) လာရင် Redis မှာ ခေတ္တ block (block time သတ်မှတ်) လုပ်မယ့် basic rate limiting ကို ပြပါမယ်။ လမ်းညွှန်က Ubuntu / Debian အတွက် ရည်ရွယ်ပါတယ်။ ဥပမာ threshold ကို **၁၀ စက္ကန့်အတွင်း request ၂၀ ထက်ကျော်ရင် ၆၀ စက္ကန့် block** လို့ ထားထားပါတယ်။',
  detailSummary: [
    'Redis မှာ `rate:<ip>` နဲ့ `block:<ip>` key တွေနဲ့ ရေတွက်ပြီး TTL နဲ့ auto-expire လုပ်နိုင်ပါတယ်။',
    '`lua-resty-redis` က OpenResty နဲ့ ပါလာတာများပြီး သီးခြား luarocks install မလိုတာလည်း ဖြစ်နိုင်ပါတယ်။',
    'Static asset path တွေကို WAF မထိအောင် ခွဲထားပြီး API / main route မှာပဲ `access_by_lua_file` စစ်နိုင်ပါတယ်။',
  ],
  steps: [
    {
      title: 'အဆင့် (၁) — Redis server install',
      description:
        'IP တွေရဲ့ request count နဲ့ block time (TTL) မှတ်သားဖို့ Redis ကို သွင်းပါ။',
      code: `sudo apt update
sudo apt install redis-server -y

sudo systemctl start redis-server
sudo systemctl enable redis-server`,
    },
    {
      title: 'အဆင့် (၂) — OpenResty install',
      description:
        'OpenResty တွင် Nginx နှင့် LuaJIT ပါဝင်ပါတယ်။ `lua-resty-redis` က library အများစုမှာ ပါဝင်ပြီး Redis ချိတ်ဆက်ရန် ထပ်သွင်းစရာ မလိုတာလည်း ဖြစ်နိုင်ပါတယ်။',
      code: `sudo apt install -y software-properties-common wget

wget -qO - https://openresty.org/package/pubkey.gpg | sudo apt-key add -

sudo add-apt-repository -y "deb http://openresty.org/package/ubuntu $(lsb_release -sc) main"

sudo apt update
sudo apt install -y openresty`,
    },
    {
      title: 'အဆင့် (၃) — WAF အတွက် Lua script (`waf.lua`)',
      description:
        '`/usr/local/openresty/nginx/conf/lua/waf.lua` ဖန်တီးပြီး အောက်က logic ထည့်ပါ။ မှတ်ချက် — စာသားမှာ **၂၀ req / ၁၀ စက္ကန့်** လို့ ရည်ရွယ်ထားပြီး code မှာ `req_count > 20` သုံးထားပါတယ်။',
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
      description: '`YourStrongPassword123` ကို မိမိ `requirepass` နဲ့ အစားထိုးပါ။',
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
        '`/usr/local/openresty/nginx/conf/nginx.conf` ကို ပြင်ပါ။ `proxy_pass` မှာ မိမိ backend (ဥပမာ `127.0.0.1:3000`) ကို ထားပါ။',
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
        'Backend app က `127.0.0.1:3000` မှာ run နေရမယ်။ curl loop နဲ့ အကြိမ်များများ ပို့ကြည့်ပါ — ပထမ **၂၀** request ကို ၁၀ စက္ကန့်အတွင်း ပို့ပြီးရင် နောက်တစ်ကြိမ်ကစပြီး **403** ရနိုင်ပါတယ်။ ခေတ္တ block ပြီးမှ ပြန်ခေါ်ကြည့်ပါ။',
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
    'Production မှာ `apt-key add` ဟောင်း workflow အစား OpenResty doc ကနေ GPG `signed-by` နည်းလမ်းကို စဉ်းစားပါ။',
    'Rate limit နဲ့ block duration ကို မိမိ traffic pattern နဲ့ ကိုက်အောင် `expire` နှင့် `req_count` threshold ပြင်ပါ။',
    'Redis မတက်ရင် WAF script က error log ရေးပြီး request ကို မပိတ်နိုင်တာမျိုး ဖြစ်နိုင်လို့ Redis availability ကို စောင့်ကြည့်ပါ။',
    'HTTPS၊ real IP (CDN နောက်က `X-Forwarded-For`)၊ shared IP စတဲ့ အခြေအနေတွေမှာ `ngx.var.remote_addr` တစ်ခုတည်းမမှီဘဲ ထပ်ပြင်ရပါတယ်။',
  ],
}
