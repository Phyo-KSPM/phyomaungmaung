export type BlogStep = {
  title: string
  description?: string
  code?: string
}

export type BlogCommand = {
  command: string
  description: string
}

export type BlogPost = {
  slug: string
  title: string
  date: string
  category: string
  image: string
  excerpt: string
  readTime: string
  author?: string
  detailIntro?: string
  detailSummary?: string[]
  steps?: BlogStep[]
  commands?: BlogCommand[]
  notes?: string[]
}

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
  {
    slug: 'openresty-webserver',
    title: 'Openresty Webserver',
    date: 'Draft',
    category: 'Web Server',
    image: '/blog-openresty.svg',
    excerpt: 'OpenResty deployment, reverse proxy setup, and Lua-based extension patterns ကိုရေးသားပါမယ်။',
    readTime: '4 min read',
  },
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
    title: 'Redis Installation',
    date: 'Draft',
    category: 'Caching',
    image: '/blog-redis.svg',
    excerpt: 'Redis install, service tuning, and secure baseline configuration ကို guide ပုံစံနဲ့ ထည့်မယ်။',
    readTime: '4 min read',
  },
  {
    slug: 'postgresql-17-installation-ubuntu-24-04',
    title: 'PostgreSQL 17 Installation (Linux အတွက် - Ubuntu 24.04)',
    date: 'Draft',
    category: 'Database',
    image: '/blog-postgresql.svg',
    excerpt: 'PostgreSQL 17 install, initialization, and performance-friendly base settings တွေကို ဆွေးနွေးပါမယ်။',
    readTime: '5 min read',
  },
  {
    slug: 'zabbix-monitoring-server-installation',
    title: 'Zabbix Monitoring Server Installation',
    date: 'Draft',
    category: 'Monitoring',
    image: '/blog-zabbix.svg',
    excerpt: 'Zabbix server setup, templates, triggers, and alert routing flow ကို အသေးစိတ်ဖော်ပြပါမယ်။',
    readTime: '5 min read',
  },
]
