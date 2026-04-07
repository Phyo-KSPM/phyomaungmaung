export type { BlogCommand, BlogPost, BlogStep } from './blogPostTypes'

import type { BlogPost } from './blogPostTypes'
import { nginxInstallationPost } from './nginxInstallationPost'
import { zabbixInstallationPost } from './zabbixInstallationPost'
import { openrestyWafPost } from './openrestyWafPost'

export function postHasFullContent(post: BlogPost) {
  return Boolean(post.steps?.length)
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'docker-install-ubuntu-24-04-official-repo',
    title: 'Docker ကို Ubuntu 24.04 (Noble) မှာ Install လုပ်နည်း (Official Repo)',
    date: 'Draft',
    category: 'Docker',
    image: '/blog-docker-ubuntu.svg',
    excerpt: 'Official repository method နဲ့ clean installation workflow ကို အဆင့်လိုက် ထည့်သွင်းဖော်ပြပါမယ်။',
    readTime: '7 min read',
    detailIntro:
      'အောက်ကနည်းလမ်းက Docker official repository ကို သုံးထားတဲ့ recommended method ဖြစ်ပါတယ်။ Ubuntu default repo ထက် package version ပိုတိကျပြီး Docker Engine, CLI, Buildx, Compose plugin တွေကို clean ပုံစံနဲ့ install လုပ်နိုင်ပါတယ်။',
    detailSummary: [
      'Ubuntu 24.04 server / VM / local machine အတွက်သုံးလို့ရပါတယ်။',
      'Official GPG key နဲ့ repository သုံးထားလို့ update lifecycle ပိုလွယ်ပါတယ်။',
      'Install ပြီးတာနဲ့ container runtime, CLI tools, Buildx, Compose plugin အားလုံးတစ်ခါတည်းရပါမယ်။',
    ],
    steps: [
      {
        title: '1. System Update',
        description: 'Package metadata နဲ့ installed packages တွေကို latest state ရောက်အောင် update လုပ်ပါ။',
        code: `sudo apt update
sudo apt upgrade -y`,
      },
      {
        title: '2. Required Packages Install',
        description: 'Repository key နဲ့ HTTPS transport အတွက်လိုအပ်မယ့် base packages တွေကို install လုပ်ပါ။',
        code: `sudo apt install ca-certificates curl gnupg -y`,
      },
      {
        title: '3. Docker GPG Key Add',
        description: 'Docker official signing key ကို `/etc/apt/keyrings` ထဲသိမ်းပြီး readable ဖြစ်အောင် permission ပေးပါ။',
        code: `sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc`,
      },
      {
        title: '4. Docker Repository Add',
        description: 'Ubuntu codename အလိုက် Docker official apt repository ကို register လုပ်ပြီး package list refresh ပြန်လုပ်ပါ။',
        code: `echo \\
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \\
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \\
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update`,
      },
      {
        title: '5. Docker Engine Install',
        description: 'Docker Engine, CLI, container runtime, Buildx, Compose plugin အားလုံးကို install လုပ်ပါ။',
        code: `sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y`,
      },
      {
        title: '6. Docker Service Status Check',
        description: 'Docker daemon service running ဖြစ်နေလား စစ်ပါ။',
        code: `sudo systemctl status docker`,
      },
      {
        title: '7. sudo မလိုအောင် User Permission ပေးပါ',
        description: 'Optional but recommended. Current user ကို docker group ထဲထည့်ပြီး logout / login ပြန်ဝင်ပါ။',
        code: `sudo usermod -aG docker $USER`,
      },
      {
        title: '8. Test Installation',
        description: 'Install ပြီးရင် hello-world container နဲ့ quick verification လုပ်လို့ရပါတယ်။',
        code: `docker --version
docker compose version
docker run hello-world`,
      },
    ],
    commands: [
      { command: 'docker ps', description: 'Running containers' },
      { command: 'docker ps -a', description: 'All containers' },
      { command: 'docker images', description: 'Image list' },
      { command: 'docker stop <id>', description: 'Stop container' },
      { command: 'docker rm <id>', description: 'Remove container' },
    ],
    notes: [
      'Production server ပေါ်မှာ firewall policy နဲ့ disk usage ကို install ပြီးတာနဲ့စစ်ထားတာကောင်းပါတယ်။',
      'Compose plugin သုံးမယ်ဆို `docker compose` syntax ကိုသုံးပါ, legacy `docker-compose` မဟုတ်ပါ။',
      'Ubuntu user permission ပြောင်းပြီးနောက် shell session ဟောင်းမှာ group change မတက်သေးနိုင်လို့ logout / login ပြန်လုပ်ပါ။',
    ],
  },
  openrestyWafPost,
  {
    slug: 'node-js-installation',
    title: 'Node JS Installation',
    date: 'Draft',
    category: 'Runtime',
    image: '/blog-nodejs.svg',
    excerpt: 'Linux server တွေမှာ stable Node.js environment setup နည်းလမ်းများကို တိတိကျကျ ရေးပါမယ်။',
    readTime: '6 min read',
    detailIntro:
      'Node.js official website download page ကနေ Long Term Support (LTS) version ရဲ့ Standalone Binary (.xz) link ကိုယူပြီး Linux server ပေါ်မှာ manual binary installation လုပ်မယ့်နည်းလမ်းဖြစ်ပါတယ်။ Package manager မသုံးဘဲ version ကိုတိုက်ရိုက်ထိန်းချုပ်ချင်တဲ့အခါ ဒီနည်းလမ်းက အလွန်အသုံးဝင်ပါတယ်။',
    detailSummary: [
      'Official standalone binary ကိုသုံးတာကြောင့် upstream release နဲ့တန်းတူ version ထိန်းနိုင်ပါတယ်။',
      'Package repository မစီစဉ်ချင်တဲ့ server တွေမှာ lightweight setup အဖြစ်သုံးလို့ရပါတယ်။',
      'Symlink method သုံးထားလို့ upgrade/replacement workflow လည်းလွယ်ပါတယ်။',
    ],
    steps: [
      {
        title: '1. Download Page မှ LTS Binary Link ယူပါ',
        description:
          'Node.js official website `https://nodejs.org/en/download` ကိုဝင်ပြီး မိမိအသုံးပြုမယ့် LTS version နဲ့ OS architecture ကိုရွေးပါ။ အောက်ကိုနည်းနည်းဆင်းပြီး `Standalone Binary (.xz)` button ပေါ်မှာ right click နှိပ်ကာ `Copy link address` ယူပါ။ လက်ရှိ official LTS v24 line အတွက် Linux x64 link က အောက်ပါပုံစံဖြစ်ပါတယ်။',
        code: `sudo wget https://nodejs.org/dist/v24.14.1/node-v24.14.1-linux-x64.tar.xz`,
      },
      {
        title: '2. Download File ရောက်မရောက်စစ်ပါ',
        description:
          'Download ပြီးသွားရင် tar.xz file ကို current directory ထဲမှာတွေ့ရပါမယ်။ File size နဲ့ filename ကိုအရင်စစ်ထားရင် extract step မှာပိုသေချာပါတယ်။',
        code: `ls -lh node-v24.14.1-linux-x64.tar.xz`,
      },
      {
        title: '3. Extract လုပ်ပါ',
        description:
          'Downloaded archive ကို extract လုပ်ပြီး Node.js binary folder ထုတ်ယူပါ။ Extract ပြီးရင် folder name ကို `ls -la` နဲ့မြင်ရပါမယ်။',
        code: `sudo tar -xf node-v24.14.1-linux-x64.tar.xz
ls -la`,
      },
      {
        title: '4. Extracted Folder ကို System Location ထဲရွှေ့ပါ',
        description:
          'Node runtime folder ကို standard install location တစ်ခုအဖြစ် `/usr/local/nodejs` အောက်ရွှေ့ထားပါ။',
        code: `sudo mv node-v24.14.1-linux-x64 /usr/local/nodejs`,
      },
      {
        title: '5. Symlink Create လုပ်ပါ',
        description:
          'Linux ရဲ့ default command path ဖြစ်တဲ့ `/usr/local/bin` ထဲ `node`, `npm`, `npx` command တွေကို symlink ချိတ်ပေးရပါမယ်။',
        code: `sudo ln -s /usr/local/nodejs/bin/node /usr/local/bin/node
sudo ln -s /usr/local/nodejs/bin/npm /usr/local/bin/npm
sudo ln -s /usr/local/nodejs/bin/npx /usr/local/bin/npx`,
      },
      {
        title: '6. PATH Verify လုပ်ပါ',
        description:
          'Environment PATH ထဲ `/usr/local/bin` ပါမပါစစ်ပါ။ ပါနေပြီဆိုရင် command တွေကို terminal restart မလိုဘဲခေါ်လို့ရနိုင်ပါတယ်။',
        code: `echo $PATH`,
      },
      {
        title: '7. Node / npm / npx Version Test',
        description:
          'Installation success ဖြစ်မဖြစ် version commands နဲ့စစ်ပါ။ Terminal restart မလိုဘဲအလုပ်လုပ်ရမှာဖြစ်ပါတယ်။',
        code: `node -v
npm -v
npx -v`,
      },
      {
        title: '8. Version Upgrade လုပ်ချင်ရင်',
        description:
          'Version အသစ်သို့ပြောင်းချင်ရင် အရင် symlink တွေကိုဖျက်ပြီး binary အသစ်ကို download/extract/move/symlink ပြန်လုပ်ပါ။ အောက်က example က latest v24.14.1 ကို one-shot install ပြန်လုပ်တဲ့ flow ဖြစ်ပါတယ်။',
        code: `sudo rm /usr/local/bin/node
sudo rm /usr/local/bin/npm
sudo rm /usr/local/bin/npx
sudo wget https://nodejs.org/dist/v24.14.1/node-v24.14.1-linux-x64.tar.xz
sudo tar -xf node-v24.14.1-linux-x64.tar.xz
sudo mv node-v24.14.1-linux-x64 /usr/local/nodejs
sudo ln -s /usr/local/nodejs/bin/node /usr/local/bin/node
sudo ln -s /usr/local/nodejs/bin/npm /usr/local/bin/npm
sudo ln -s /usr/local/nodejs/bin/npx /usr/local/bin/npx
echo $PATH
node -v
npm -v
npx -v`,
      },
    ],
    commands: [
      { command: 'node -v', description: 'Installed Node.js version check' },
      { command: 'npm -v', description: 'Installed npm version check' },
      { command: 'npx -v', description: 'Installed npx version check' },
      { command: 'which node', description: 'Current node binary path check' },
      { command: 'ls -la /usr/local/nodejs/bin', description: 'Installed Node.js binaries list' },
    ],
    notes: [
      'Current official LTS download page မှာ `v24.14.1` ကိုပြထားပြီး Linux x64 standalone binary link ကိုအသုံးပြုထားပါတယ်.',
      'Existing `/usr/local/nodejs` folder ရှိပြီးသားဆိုရင် move မလုပ်ခင် rename/remove strategy သတ်မှတ်ထားပါ.',
      'Production server မှာ upgrade မလုပ်ခင် running PM2 services or systemd units တွေ compatibility စစ်ထားတာကောင်းပါတယ်.',
    ],
  },
  {
    slug: 'redis-installation',
    title: 'Redis Installation (Ubuntu — apt + password + Node / Next.js .env)',
    date: 'Draft',
    category: 'Caching',
    image: '/blog-redis.svg',
    excerpt:
      'redis-server install၊ systemd enable/start၊ `requirepass` ထည့်ခြင်း၊ `redis-cli` နဲ့ ping စမ်းခြင်း၊ Next.js / Node project အတွက် `REDIS_URL` မှာ password URL-encode လုပ်ပေးခြင်း။ Password ထဲ `!` `@` `#` စတဲ့ special character ပါရင် `redis.conf` (double quote)၊ shell (single quote)၊ `REDIS_URL` (encode) သုံးပုံကို ဥပမာ `StrongRedis123!@#` နဲ့ ရှင်းပြထားပါတယ်။',
    readTime: '9 min read',
    author: 'Phyo Maung Maung',
    detailIntro:
      'Ubuntu ပေါ်မှာ distro package (`redis-server`) သုံးပြီး Redis ကို တပ်ဆင်ပြီး systemd နဲ့ auto-start လုပ်ပါမယ်။ Authentication အတွက် `/etc/redis/redis.conf` ထဲ `requirepass` ထည့်ပြီး application ချိတ်တဲ့အခါ password ထဲ special character ပါရင် **သုံးနေရာ** ကိုသတိထားပါ — config မှာ quote (`#` က comment ဖြစ်နိုင်သောကြောင့်)၊ shell မှာ `redis-cli` argument ကို quote နဲ့ ကာကွယ်၊ app connection string (`REDIS_URL`) မှာ password ကို **URL-encoded** ထည့်ပါ။ အောက်က **Step 6** မှာ ဥပမာ password `StrongRedis123!@#` နဲ့ သုံးပုံတစ်ခုလုံး ရေးထားပါတယ်။',
    detailSummary: [
      '`apt` နဲ့ install လုပ်ပြီး `systemctl enable` + `start` နဲ့ boot time မှာ service ပေါ်အောင် ထားနိုင်ပါတယ်။',
      '`requirepass` ပြောင်းပြီးတိုင်း `systemctl restart redis-server` လုပ်မှ အသစ်အတိုင်း အလုပ်လုပ်ပါမယ်။',
      'Next.js / Node မှာ `REDIS_URL=redis://:encoded-password@127.0.0.1:6379` ပုံစံနဲ့ သိမ်းပါ — plain password ကို repo ထဲ commit မလုပ်ပါနဲ့။',
      'Password ထဲ `!` `@` `#` စတဲ့ character တွေပါရင် — `redis.conf` မှာ `requirepass "…"` (double quote)၊ terminal မှာ `redis-cli -a \'…\'` (single quote)၊ `REDIS_URL` မှာ `encodeURIComponent()` နဲ့ encode လုပ်ထားတဲ့ password သုံးပါ။ အသေးစိတ် ဥပမာ `StrongRedis123!@#` ကို **Step 6** မှာ ကြည့်ပါ။',
    ],
    steps: [
      {
        title: '1. System update နှင့် Redis install',
        code: `sudo apt update -y
sudo apt upgrade -y
sudo apt install -y redis-server`,
      },
      {
        title: '2. Service enable / start / status',
        code: `sudo systemctl enable redis-server
sudo systemctl start redis-server
sudo systemctl status redis-server`,
      },
      {
        title: '3. Password ထည့်ခြင်း — redis.conf',
        description:
          '`requirepass` line ကို ရှာပြီး comment ဖြုတ်ပါ။ အောက်က ဥပမာ password ကို လမ်းညွှန်တစ်လျှောက်တည်း သုံးထားပါတယ်။',
        code: `sudo nano /etc/redis/redis.conf

# Uncomment / add (example password — production မှာ မိမိသတ်မှတ်ပါ):
requirepass StrongRedis123

sudo systemctl restart redis-server`,
      },
      {
        title: '4. Password နဲ့ ping စမ်းခြင်း',
        description:
          '`redis-cli` မှာ `-a` နဲ့ password ပေးပြီး ping စမ်းပါ။',
        code: `redis-cli -a StrongRedis123 ping
# Expected: PONG`,
      },
      {
        title: '5. Project .env — REDIS_URL (Node.js / Next.js)',
        description:
          'Password ထဲ special character ပါရင် `REDIS_URL` မှာ **URL-encoded** password သုံးရပါမယ်။ အောက်က ဥပမာမှာ alphanumeric password (`StrongRedis123`) သုံးထားလို့ encode မလိုပါ။',
        code: `# Documentation only — do not commit real secrets to Git
REDIS_URL=redis://:StrongRedis123@127.0.0.1:6379`,
      },
      {
        title: '6. Password ထဲ special character ပါရင် — ဥပမာ StrongRedis123!@#',
        description:
          '**redis.conf** ထဲမှာ `#` က line comment အဖြစ် ဖတ်နိုင်လို့ password ကို **double quote** နဲ့ ပတ်ထားပါ။ **Shell** မှာ `redis-cli` သုံးတဲ့အခါ password ကို **single quote** နဲ့ ပတ်ပြီး shell က `!` `@` `#` တွေကို မှားဖတ်မသွားအောင် ကာကွယ်ပါ။ **REDIS_URL** မှာတော့ userinfo ထဲက password ကို **percent-encoding (URL encode)** လုပ်ရပါတယ် — Node.js မှာ `encodeURIComponent("StrongRedis123!@#")` ရလဒ်က `StrongRedis123%21%40%23` ဖြစ်ပါတယ် (`!` → `%21`, `@` → `%40`, `#` → `%23`)။',
        code: `# --- redis.conf (example) ---
requirepass "StrongRedis123!@#"
# restart: sudo systemctl restart redis-server

# --- redis-cli (bash — single quotes) ---
redis-cli -a 'StrongRedis123!@#' ping

# --- .env — encoded password in URL only ---
# Plain (do not paste raw into REDIS_URL if it has reserved chars):
# StrongRedis123!@#

REDIS_URL=redis://:StrongRedis123%21%40%23@127.0.0.1:6379`,
      },
    ],
    commands: [
      { command: 'sudo systemctl status redis-server', description: 'Redis service state' },
      { command: 'sudo systemctl restart redis-server', description: 'Reload config after redis.conf change' },
      { command: 'redis-cli ping', description: 'No-auth test (if requirepass not set)' },
      { command: 'redis-cli -a StrongRedis123 ping', description: 'Auth test — simple password (PONG expected)' },
      {
        command: "redis-cli -a 'StrongRedis123!@#' ping",
        description: 'Auth test — special chars in password (same rules as Step 6)',
      },
    ],
    notes: [
      'Production မှာ `bind 127.0.0.1` ထားပြီး public internet ကို Redis port မဖွင့်ပါနဲ့ — remote လိုချင်ရင် VPN / SSH tunnel / private network စဉ်းစားပါ။',
      'Password ကို `.env` သို့ secret manager မှာသိမ်းပြီး Git မှာ commit မလုပ်ပါနဲ့။',
      'URL encode လုပ်ဖို့ browser devtools သို့ `encodeURIComponent()` သုံးလို့ရပါတယ်။',
      'Special character ပါသော password အတွက် လမ်းညွှန်တစ်ခုလုံး (conf / cli / `REDIS_URL` ဥပမာ `StrongRedis123!@#`) ကို **Step 6** မှာ ဖတ်ပါ။',
    ],
  },
  nginxInstallationPost,
  {
    slug: 'postgresql-17-installation-ubuntu-24-04',
    title: 'PostgreSQL 17 Installation (Linux အတွက် - Ubuntu 24.04)',
    date: 'Draft',
    category: 'Database',
    image: '/blog-postgresql.svg',
    excerpt:
      'PGDG repo နဲ့ PostgreSQL 17 install လုပ်ခြင်း၊ database/user ဖန်တီးခြင်း၊ remote TCP ချိတ်ဆက်ခြင်း၊ firewall နဲ့ schema permission ထိအောင် လမ်းညွှန်ပါမယ်။',
    readTime: '12 min read',
    author: 'Phyo Maung Maung',
    detailIntro:
      'Ubuntu server ပေါ်မှာ PostgreSQL official (PGDG) repository သုံးပြီး version 17 ကို install လုပ်ပြီး `testdb` database နဲ့ `nodeuser` application user ကို ဖန်တီးပါမယ်။ Remote application server (Node.js စသည်) ကနေ ချိတ်လို့ရအောင် `listen_addresses`၊`pg_hba.conf`၊ firewall ကိုပါ ထိန်းချုပ်ပါမယ်။',
    detailSummary: [
      'PGDG apt repository + GPG key နဲ့ major version ကိုတိုက်ရိုက်ရယူနိုင်ပါတယ်။',
      '`postgres` superuser password၊ dedicated DB user၊ database grant နဲ့ `public` schema owner ကို application user ဆီလွှဲပေးပါမယ်။',
      'Remote connect အတွက် TCP listen + `pg_hba.md5` + (လိုအပ်ရင်) UFW port 5432 ကိုဖွင့်ပါမယ်။',
    ],
    steps: [
      {
        title: '1. PostgreSQL (PGDG) repository ထည့်ခြင်း',
        description:
          'Official PostgreSQL APT repository ကို ထည့်ပါ။ `lsb_release -cs` က Ubuntu codename (ဥပမာ noble) ပြန်ပေးပါမယ်။',
        code: `sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'`,
      },
      {
        title: '2. Repository GPG key import',
        description:
          '`apt-key` ဟောင်း syntax သုံးထားနိုင်ပြီး၊ နောက်ပိုင်း Ubuntu တွေမှာ `signed-by` နည်းလမ်းကို PGDG doc ကနေကြည့်နိုင်ပါတယ်။ အောက်က command က အလုပ်လုပ်ပါတယ်။',
        code: `wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -`,
      },
      {
        title: '3. apt update နှင့် PostgreSQL 17 install',
        code: `sudo apt update
sudo apt install -y postgresql-17 postgresql-client-17 postgresql-contrib`,
      },
      {
        title: '4. Service start နှင့် enable',
        code: `sudo systemctl start postgresql
sudo systemctl enable postgresql`,
      },
      {
        title: '5. psql ဝင်ပြီး superuser password၊ database၊ application user',
        description:
          '`postgres` OS user အနေနဲ့ `psql` ဝင်ပါ။ အောက်က SQL မှာ `your_password` တွေကို မိမိသတ်မှတ်မယ့် strong password တွေနဲ့ အစားထိုးပါ။',
        code: `sudo -i -u postgres
psql

-- postgres role password
ALTER USER postgres WITH PASSWORD 'your_password';

-- database
CREATE DATABASE testdb;

-- app user
CREATE USER nodeuser WITH ENCRYPTED PASSWORD 'your_password';

-- database privilege
GRANT ALL PRIVILEGES ON DATABASE testdb TO nodeuser;

\\q
exit`,
      },
      {
        title: '6. public schema owner ကို nodeuser သို့ (table create လုပ်နိုင်အောင်)',
        description: '`testdb` ထဲမှာ connect လုပ်ပြီး schema owner ပေးပါ။',
        code: `sudo -i -u postgres psql -d testdb -c 'ALTER SCHEMA public OWNER TO nodeuser;'`,
      },
      {
        title: '7. Service run ဖြစ်မဖြစ် စစ်ခြင်း',
        description: '`active (running)` ဖြစ်မှ remote connection စမ်းလို့ကောင်းပါတယ်။',
        code: `sudo systemctl status postgresql`,
      },
      {
        title: '8. TCP listening — postgresql.conf',
        description:
          'Default `localhost` ပဲ listen လုပ်နေရင် အပြင်က IP ကနေ ချိတ်မရပါ။ remote လိုချင်ရင် `listen_addresses` ကို ပြင်ပါ။',
        code: `sudo nano /etc/postgresql/17/main/postgresql.conf

# Find and set:
listen_addresses = '*'

sudo systemctl restart postgresql`,
      },
      {
        title: '9. Client authentication — pg_hba.conf',
        description:
          'IPv4 client တွေကို MD5 နဲ့ ခွင့်ပြုချင်ရင် အောက်ပါလိုမျိုး ထည့်ပါ။ Production မှာ `0.0.0.0/0` အစား application server IP တစ်ခုတည်းကို whitelist လုပ်တာက ပိုလုံခြုံပါတယ်။',
        code: `sudo nano /etc/postgresql/17/main/pg_hba.conf

# Example (end of file):
# host  all  all  0.0.0.0/0  md5

sudo systemctl restart postgresql`,
      },
      {
        title: '10. Firewall (UFW) — port 5432',
        description: 'UFW အသုံးပြုထားရင် 5432 ကို allow လုပ်ပါ။',
        code: `sudo ufw status
sudo ufw allow 5432/tcp
sudo ufw reload`,
      },
      {
        title: '11. Local connection စမ်းခြင်း',
        description: 'Server အတွင်းကနေ `nodeuser` နဲ့ `testdb` ကို စမ်းပါ။',
        code: `psql -h 127.0.0.1 -U nodeuser -d testdb`,
      },
      {
        title: '12. Remote စမ်းခြင်း',
        description:
          'အခြား machine (Windows / app server) ကနေ network route နဲ့ PostgreSQL host IP:5432 ကို စမ်းပါ။ ping မရရင် routing/firewall စစ်ပါ။',
        code: `ping <postgresql-server-ip>
# Then from client with psql or app connection string:
# postgresql://nodeuser:your_password@<host>:5432/testdb`,
      },
    ],
    commands: [
      { command: 'sudo systemctl status postgresql', description: 'Cluster service state' },
      { command: 'sudo systemctl restart postgresql', description: 'Apply conf changes' },
      { command: 'ss -tlnp | grep 5432', description: 'Listen port check (optional)' },
      { command: 'psql -h 127.0.0.1 -U nodeuser -d testdb', description: 'Local test as app user' },
    ],
    notes: [
      '`apt-key add` ဟောင်း workflow ကို နောက်ပိုင်းမှာ `dearmor` + `/etc/apt/trusted.gpg.d/` နည်းလမ်းနဲ့ အစားထိုးကြပါတယ် — install မရရင် PGDG official doc ကို ကြည့်ပါ။',
      '`0.0.0.0/0` က internet-wide open ဖြစ်နိုင်လို့ production မှာ source IP ကန့်သတ်ပါ။',
      '`ALTER USER postgres` နဲ့ `CREATE USER nodeuser` မှာ password တွေကို environment variable သို့မဟုတ် secret manager နဲ့ သိမ်းပါ၊ repo/screen မှာ plain text မထားပါနဲ့။',
      'SSL (`hostssl`) နဲ့ certificate ကို public network ပေါ်မှာ ထပ်စဉ်းစားပါ။',
    ],
  },
  zabbixInstallationPost,
]
