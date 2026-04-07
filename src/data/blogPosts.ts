export type { BlogCommand, BlogPost, BlogStep } from './blogPostTypes'

import type { BlogPost } from './blogPostTypes'
import { nginxInstallationPost } from './nginxInstallationPost'
import { zabbixInstallationPost } from './zabbixInstallationPost'
import { openrestyWafPost } from './openrestyWafPost'
import { pm2InstallationPost } from './pm2InstallationPost'

export function postHasFullContent(post: BlogPost) {
  return Boolean(post.steps?.length)
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'docker-install-ubuntu-24-04-official-repo',
    title: 'Docker ကို Ubuntu 24.04 (Noble) မှာ Install လုပ်နည်း (Official Repo)',
    date: 'Published · 7 Apr 2026',
    category: 'Docker',
    image: '/blog-covers/docker.jpg',
    excerpt:
      '24.04 မှာ Docker ထည့်မယ်ဆိုရင် official repo ကနေတိုက်ရိုက်ယူတာက အသင့်တော်ပါတယ်။ အောက်က အဆင့်တွေက အဲဒီ လမ်းကြောင်းကို လိုက်ရုံပါ။',
    readTime: '7 min read',
    detailIntro:
      'Ubuntu ထဲက default repo က Docker version က နောက်ကျနေတတ်လို့ Docker က ထုတ်တဲ့ apt source ကို ထည့်ပြီး install လိုက်တာပါ။ Engine၊ CLI၊ buildx၊ compose plugin တွေ တစ်ချိန်တည်းရပြီး နောက်ပိုင်း `apt upgrade` နဲ့ လိုက်လုပ်ရလွယ်ပါတယ်။',
    detailSummary: [
      'Server လား VM လား လက်တွေ့မှာ သုံးတဲ့ 24.04 မှာအလုပ်လုပ်ပါတယ်။',
      'GPG နဲ့ repo ချိတ်ထားတော့ package အသစ်တွေ ရှင်းရှင်းလင်းလင်း ရပါတယ်။',
      'နောက်ဆုံး မှာ hello-world နဲ့ စမ်းကြည့်ပြီး ပြီးသွားကြောင်း သေချာပါစေ။',
    ],
    steps: [
      {
        title: '1. System Update',
        description: 'ပထမ `apt update` / `upgrade` လုပ်ပါ။ မလုပ်ဘဲရှိရင် နောက်တစ်ဆင့်မှာ dependency ပွက်တတ်ပါတယ်။',
        code: `sudo apt update
sudo apt upgrade -y`,
      },
      {
        title: '2. Required Packages Install',
        description: 'ca-certificates၊ curl၊ gnupg — repo key ဆွဲဖို့ အခြေခံတွေ ပဲ။',
        code: `sudo apt install ca-certificates curl gnupg -y`,
      },
      {
        title: '3. Docker GPG Key Add',
        description: 'Key ကို `/etc/apt/keyrings` မှာ သိမ်းပါ။ chmod နဲ့ ဖတ်လို့ရအောင် ထားတာပါ။',
        code: `sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc`,
      },
      {
        title: '4. Docker Repository Add',
        description: '`VERSION_CODENAME` နဲ့ noble စတဲ့ codename ကိုယ်တိုင် မထည့်ရဘဲ ရပါတယ်။ ထည့်ပြီး `apt update` ပြန်လုပ်ပါ။',
        code: `echo \\
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \\
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \\
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update`,
      },
      {
        title: '5. Docker Engine Install',
        description: 'ဒီတစ်ကြောင်းနဲ့ engine + cli + buildx + compose plugin အထိ တစ်ခါတည်း။',
        code: `sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y`,
      },
      {
        title: '6. Docker Service Status Check',
        description: '`active (running)` လား ကြည့်ပါ။ မဟုတ်ရင် journalctl နဲ့ လိုက်ကြည့်ပါ။',
        code: `sudo systemctl status docker`,
      },
      {
        title: '7. sudo မလိုအောင် User Permission ပေးပါ',
        description: 'စိတ်ကြိုက်။ `docker` group ထဲ ထည့်ပြီး session အသစ်ဝင်မှ အလုပ်ဝင်ပါတယ်။',
        code: `sudo usermod -aG docker $USER`,
      },
      {
        title: '8. Test Installation',
        description: 'hello-world ပြေးကြည့်ပြီး ပြီးရင် ပေါ့။',
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
      'ပြီးတာနဲ့ disk နဲ့ firewall ကို မေ့မနေပါနဲ့။',
      'Compose အသစ် က `docker compose` (space) — ခေါင်းစဉ်ဟောင်း `docker-compose` နဲ့ မရောပါနဲ့။',
      'group ထည့်ပြီးပေမယ့် terminal ဟောင်းမှာ ဆက်သုံးနေရင် `newgrp docker` လုပ်ပါ၊ မဟုတ်ရင် ထွက်ဝင်ပါ။',
    ],
  },
  openrestyWafPost,
  {
    slug: 'node-js-installation',
    title: 'Node JS Installation',
    date: 'Published · 7 Apr 2026',
    category: 'Runtime',
    image: '/blog-covers/nodejs.jpg',
    excerpt:
      'nvm လည်း မဟုတ်၊ distro repo လည်း မဟုတ်ဘဲ — nodejs.org က LTS tarball ဆွဲပြီး `/usr/local` မှာ လက်တွေ့ထားတဲ့ နည်းပါ။',
    readTime: '6 min read',
    detailIntro:
      'ဒါက repo မချိတ်ဘဲ binary တိုက်ရိုက်ချတဲ့ နည်းပါ။ version ကိုယ့်လက်ထဲ ထိန်းချင်တာ၊ သို့မဟုတ် server မှာ apt source ထပ်မထည့်ချင်တဲ့အခါ သုံးလို့ကောင်းပါတယ်။ လင့်ခ်က တစ်ခါတလေ ပြောင်းတော့ download page မှာ LTS ကို နှိပ်ပြီး x64 tarball ကို ယူပါ။',
    detailSummary: [
      'Official tarball ဆိုတော့ nodejs.org မှာ ထုတ်တဲ့ version နဲ့ တူအောင် ထိန်းလို့ရပါတယ်။',
      'Symlink သုံးထားတော့ အသစ်ထပ်တဲ့အခါ ဖိုင်တွေလဲပြီး လင့်ခ်ပြန်ချိတ်ရုံပါ။',
      'Production မှာ PM2 / systemd နဲ့ မတိုက်ခင်မှာ path ကို တစ်ချက်စစ်ပါ။',
    ],
    steps: [
      {
        title: '1. Download Page မှ LTS Binary Link ယူပါ',
        description:
          '`nodejs.org/en/download` မှာ LTS ရွေးပြီး Linux x64 ဆိုရင် `.tar.xz` လင့်ခ်ကို copy လုပ်ပါ။ အောက်က wget မှာ ထည့်ထားတဲ့ နံပါတ်က ဥပမာ — ကိုယ့်ရဲ့ လင့်ခ်နဲ့ မတူရင် လင့်ခ်ကို လဲပါ။',
        code: `sudo wget https://nodejs.org/dist/v24.14.1/node-v24.14.1-linux-x64.tar.xz`,
      },
      {
        title: '2. Download File ရောက်မရောက်စစ်ပါ',
        description: '`ls -lh` နဲ့ mb အရွယ်က အမှန်လား ကြည့်ပါ။ ဖိုင်အမည် မှားနေရင် နောက်တစ်ဆင့် မှားပါလိမ့်မယ်။',
        code: `ls -lh node-v24.14.1-linux-x64.tar.xz`,
      },
      {
        title: '3. Extract လုပ်ပါ',
        description: 'tar -xf နဲ့ ဖြေပါ။ ဖိုင်တွေက current folder အောက်မှာ ပေါ်လာပါမယ်။',
        code: `sudo tar -xf node-v24.14.1-linux-x64.tar.xz
ls -la`,
      },
      {
        title: '4. Extracted Folder ကို System Location ထဲရွှေ့ပါ',
        description: '`/usr/local/nodejs` လို့ ထားရင် နောက်တစ်ခါတန်း upgrade လုပ်ရတာ မှတ်လွယ်ပါတယ်။',
        code: `sudo mv node-v24.14.1-linux-x64 /usr/local/nodejs`,
      },
      {
        title: '5. Symlink Create လုပ်ပါ',
        description: '`/usr/local/bin` က PATH ထဲမှာ အများအားဖြင့် ပါပြီးသား။ node / npm / npx ကို အဲဒီဘက်ကို ချိတ်ပါ။',
        code: `sudo ln -s /usr/local/nodejs/bin/node /usr/local/bin/node
sudo ln -s /usr/local/nodejs/bin/npm /usr/local/bin/npm
sudo ln -s /usr/local/nodejs/bin/npx /usr/local/bin/npx`,
      },
      {
        title: '6. PATH Verify လုပ်ပါ',
        description: '`echo $PATH` မှာ `/usr/local/bin` ရှိလား။ မရှိရင် profile ထဲ ထည့်ပါ။',
        code: `echo $PATH`,
      },
      {
        title: '7. Node / npm / npx Version Test',
        description: 'version သုံးခုလုံး ထုတ်ကြည့်ပါ။ error ရရင် symlink path ကို ပြန်စစ်ပါ။',
        code: `node -v
npm -v
npx -v`,
      },
      {
        title: '8. Version Upgrade လုပ်ချင်ရင်',
        description:
          'အဟောင်း symlink ဖျက်ပြီး tarball အသစ် ဆွဲပြန်၊ extract ပြန်၊ `/usr/local/nodejs` ကို အစားထိုးပြီး လင့်ခ်ပြန်ချိတ် — အောက်ကတွေက အဲဒီ flow ကို တစ်ကြောင်းချင်းစီ ပြထားတာပါ။',
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
      'ဆောင်းပါးထဲက wget URL က ဥပမာ — ကိုယ့်ရဲ့ LTS နံပါတ်နဲ့ မတူရင် လင့်ခ်ကို လဲပါ။',
      '`/usr/local/nodejs` အတွင်းမှာ အဟောင်း folder ကျန်နေရင် move မတိုက်ခင် နာမည်ပြောင်း သို့မဟုတ် ဖျက်ပါ။',
      'PM2 သို့မဟုတ် systemd နဲ့ app တက်နေရင် upgrade မတိုက်ခင် ခဏရပ်ပြီး ပြန်တက်ပါ။',
    ],
  },
  pm2InstallationPost,
  {
    slug: 'redis-installation',
    title: 'Redis Installation (Ubuntu — apt + password + Node / Next.js .env)',
    date: 'Published · 7 Apr 2026',
    category: 'Caching',
    image: '/blog-covers/redis.png',
    excerpt:
      'apt နဲ့ redis-server ထည့်ပြီး password ကောက်ပြီး `redis-cli` နဲ့ စမ်းပါ။ app မှာက `REDIS_URL` — စာလုံးထဲ `!@#` လိုမျိုး ပါရင် encode လုပ်ရတာ သတိပြုပါ။ အောက်မှာ `StrongRedis123!@#` နဲ့ အပြည့်အစုံ ရေးထားပါတယ်။',
    readTime: '9 min read',
    author: 'Phyo Maung Maung',
    detailIntro:
      'ဒါက `apt install redis-server` လမ်းကြောင်းပါ။ `requirepass` ထည့်ပြီးရင် config ပြန်ဖတ်အောင် restart လုပ်ရပါမယ်။ password ထဲမှာ `#` ပါရင် redis.conf မှာ comment အဖြစ် ဖတ်မိတတ်လို့ double quote လိုအပ်ပါတယ်။ shell ကို ဖြတ်တဲ့အခါ `!` တွေ bash က အဓိပ္ပါယ်ဖွင့်တတ်လို့ single quote ကောင်းပါတယ်။ app မှာ `REDIS_URL` မှာတော့ `%21` စတဲ့ encode သုံးရပါတယ်။ အဲဒီ သုံးနေရာ သုံးမျိုး ကို **Step 6** မှာ တစ်ခုချင်းစီ ရေးထားပါတယ်။',
    detailSummary: [
      'systemd နဲ့ boot မှာ auto-start လုပ်ချင်ရင် enable ထားပါ။',
      'conf ပြင်တိုင်း restart မလုပ်ရင် အဟောင်းပဲ ဖတ်နေပါလိမ့်မယ်။',
      '`REDIS_URL` မှာ စာသားတိုက်ရိုက် မထည့်ပါနဲ့ — git ထဲ မရောက်အောင် သေချာပါစေ။',
      'Special char တွေအတွက် conf / cli / URL သုံးပုံကို Step 6 မှာ ဖတ်ပါ။',
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
        description: '`requirepass` ရှာပြီး ဖွင့်ပါ။ အောက်က စာသားက ဥပမာ — production မှာ မိမိ password နဲ့ လဲပါ။',
        code: `sudo nano /etc/redis/redis.conf

# Uncomment / add (example password — production မှာ မိမိသတ်မှတ်ပါ):
requirepass StrongRedis123

sudo systemctl restart redis-server`,
      },
      {
        title: '4. Password နဲ့ ping စမ်းခြင်း',
        description: '`-a` နဲ့ ပေးပြီး `PONG` လိုချင်တာ။',
        code: `redis-cli -a StrongRedis123 ping
# Expected: PONG`,
      },
      {
        title: '5. Project .env — REDIS_URL (Node.js / Next.js)',
        description:
          'စာလုံးရှင်းရှင်းဆိုရင် အောက်ကလို တိုက်ရိုက်ရေးလို့ရပါတယ်။ special char ပါရင် encode လုပ်ပါ။',
        code: `# Documentation only — do not commit real secrets to Git
REDIS_URL=redis://:StrongRedis123@127.0.0.1:6379`,
      },
      {
        title: '6. Password ထဲ special character ပါရင် — ဥပမာ StrongRedis123!@#',
        description:
          'conf မှာ `"StrongRedis123!@#"` လို double quote — မဟုတ်ရင် `#` နောက်ပိုင်း ပျောက်သွားနိုင်ပါတယ်။ terminal မှာ `redis-cli -a \'...\'` — single quote။ `.env` မှာတော့ `encodeURIComponent` နဲ့ `StrongRedis123%21%40%23` အထိ လုပ်ထားမှ လင့်ခ်မှာ အလုပ်လုပ်ပါတယ်။',
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
      'အင်တာနက်ထဲကို 6379 ဖွင့်မထားပါနဲ့။ လိုရင် SSH tunnel လို့ ချိတ်ပါ။',
      '`.env` ကို repo ထဲ မထည့်ပါနဲ့။',
      'encode လုပ်ဖို့ browser console မှာ `encodeURIComponent("...")` ခေါ်ကြည့်လို့ရပါတယ်။',
      'အသေးစိတ် `StrongRedis123!@#` ဥပမာ — Step 6။',
    ],
  },
  nginxInstallationPost,
  {
    slug: 'postgresql-17-installation-ubuntu-24-04',
    title: 'PostgreSQL 17 Installation (Linux အတွက် - Ubuntu 24.04)',
    date: 'Published · 7 Apr 2026',
    category: 'Database',
    image: '/blog-covers/postgresql.jpg',
    excerpt:
      'PGDG ထဲကနေ 17 ထည့်ပြီး user/db လုပ်ပါ။ အပြင်က app က ချိတ်ချင်ရင် listen + pg_hba + firewall သုံးခုလုံး လိုပါတယ်။',
    readTime: '12 min read',
    author: 'Phyo Maung Maung',
    detailIntro:
      'ဒီမှာ PGDG repo ထည့်ပြီး 17 install လုပ်မယ်။ ဥပမ်အနေနဲ့ `testdb` နဲ့ `nodeuser` လုပ်ပြထားပါတယ်။ app server က အခြား machine မှာ ဆိုရင် `postgresql.conf` မှာ listen၊ `pg_hba.conf` မှာ client ခွင့်ပြု၊ လိုရင် UFW မှာ 5432 — သုံးခုစလုံး ကိုက်မှ ချိတ်ရပါတယ်။',
    detailSummary: [
      'Ubuntu repo ထက် PGDG က major version အသစ်တွေကို တိုက်ရိုက်ပေးပါတယ်။',
      'superuser password၊ app user၊ grant၊ `public` owner လုပ်ပြီး table ဖန်တီးခွင့် ရအောင် လုပ်ပါ။',
      'အပြင်ကနေ ချိတ်မယ်ဆို md5/scram + firewall ကို စိတ်ရှည်ရှည်ထားပါ။',
    ],
    steps: [
      {
        title: '1. PostgreSQL (PGDG) repository ထည့်ခြင်း',
        description: '`lsb_release -cs` က noble စတဲ့ codename ကို အလိုအလျောက် ထည့်ပေးပါတယ်။',
        code: `sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'`,
      },
      {
        title: '2. Repository GPG key import',
        description:
          '`apt-key` က ခေတ်ဟောင်း။ အလုပ်မလုပ်ရင် PGDG doc ထဲက signed-by နည်းလမ်းကို ကြည့်ပါ။ ဒီတစ်ကြောင်းက အများအားဖြင့် အဆင်ပြေပါတယ်။',
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
          '`sudo -u postgres` နဲ့ ဝင်ပါ။ `your_password` ကို မှတ်မထားတဲ့ စာသားတွေနဲ့ လဲပါ။',
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
        description: 'မပေးရင် app user က table မဖန်တီးနိုင်တာမျိုး ဖြစ်တတ်ပါတယ်။',
        code: `sudo -i -u postgres psql -d testdb -c 'ALTER SCHEMA public OWNER TO nodeuser;'`,
      },
      {
        title: '7. Service run ဖြစ်မဖြစ် စစ်ခြင်း',
        description: 'မတက်ရင် `journalctl -u postgresql` နဲ့ လိုက်ကြည့်ပါ။',
        code: `sudo systemctl status postgresql`,
      },
      {
        title: '8. TCP listening — postgresql.conf',
        description:
          '`*` ကို မရွေးချင်ရင် LAN IP တစ်ခုထဲ လိုက်ရေးလို့ရပါတယ်။ remote မလိုဘဲ local ပဲဆိုရင် ဒီအဆင့်ကို ကျော်ပါ။',
        code: `sudo nano /etc/postgresql/17/main/postgresql.conf

# Find and set:
listen_addresses = '*'

sudo systemctl restart postgresql`,
      },
      {
        title: '9. Client authentication — pg_hba.conf',
        description:
          '`0.0.0.0/0` က လွယ်ပေမယ့် လူတိုင်းဝင်နိုင်အောင် ဖွင့်တာပါ။ တကယ်သုံးမယ်ဆို app server IP တစ်ခုထဲကို ထိန်းပါ။',
        code: `sudo nano /etc/postgresql/17/main/pg_hba.conf

# Example (end of file):
# host  all  all  0.0.0.0/0  md5

sudo systemctl restart postgresql`,
      },
      {
        title: '10. Firewall (UFW) — port 5432',
        description: 'UFW မဖွင့်ထားရင် ဒီအဆင့်ကို မလိုပါဘူး။',
        code: `sudo ufw status
sudo ufw allow 5432/tcp
sudo ufw reload`,
      },
      {
        title: '11. Local connection စမ်းခြင်း',
        description: 'ပထမ localhost ကနေ စမ်းပါ။ ဒီမှာ ပဲ အလုပ်မလုပ်ရင် remote မှာ မအောင်မြင်ပါဘူး။',
        code: `psql -h 127.0.0.1 -U nodeuser -d testdb`,
      },
      {
        title: '12. Remote စမ်းခြင်း',
        description:
          'client ကနေ `psql` သို့မဟုတ် connection string နဲ့ စမ်းပါ။ ping မရရင် လမ်းမရှိတာပါ — postgres ချိတ်မချိတ် နဲ့ မတူပါဘူး။',
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
      'apt key error ရရင် PGDG site မှာ GPG နည်းလမ်း အသစ်ကို ကြည့်ပါ။',
      'pg_hba မှာ ကမ္ဘာ့လုံးခွင့်ပြုထားရင် အမှန်တကယ် လိုအပ်သလား ပြန်စစ်ပါ။',
      'password တွေကို screen မှာ မထားပါနဲ့။',
      'အင်တာနက်ပေါ်ကနေ တိုက်ရိုက်ချိတ်မယ်ဆို SSL + hostssl ကို စဉ်းစားပါ။',
    ],
  },
  zabbixInstallationPost,
]
