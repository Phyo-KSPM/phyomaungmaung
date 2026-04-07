import type { BlogPost } from './blogPostTypes'

export const pm2InstallationPost: BlogPost = {
  slug: 'pm2-global-install-symlink',
  title: 'PM2 — global install + /usr/local/bin symlink (manual Node path)',
  date: 'Published · 7 Apr 2026',
  category: 'Runtime',
  image: '/blog-covers/pm2.png',
  excerpt:
    'Node ကို `/usr/local/nodejs` မှာ ထားပြီး npm နဲ့ `pm2` ကို global ထည့်တဲ့အခါ binary က `.../nodejs/bin/` အောက်မှာပဲ ရှိတတ်ပါတယ်။ `pm2` ကို PATH ထဲကနေ ခေါ်လို့ရအောင် `/usr/local/bin` ကို symlink နဲ့ ချိတ်တဲ့ နည်းပါ။',
  readTime: '4 min read',
  author: 'Phyo Maung Maung',
  detailIntro:
    'ဒီလမ်းကြောင်းက node ကို tarball နဲ့ `/usr/local/nodejs` ထဲ ထည့်ထားပြီး `node` / `npm` ကို အရင် `/usr/local/bin` ကို symlink လုပ်ထားတဲ့ setup နဲ့ ကိုက်ပါတယ်။ `sudo npm install pm2 -g` နဲ့ ထည့်ပြီးရင် `pm2` executable တွေက `/usr/local/nodejs/bin/` အောက်မှာ ပေါ်ပါတယ်။ အဲဒါတွေကို `pm2`, `pm2-runtime`, `pm2-dev`, `pm2-docker` အတွက် တစ်ခုချင်းစီ `/usr/local/bin` ကို ချိတ်ပေးရပါတယ်။',
  detailSummary: [
    'Global install မတိုင်ခင် `node -v` နဲ့ `npm -v` အလုပ်လုပ်မှ ကောင်းပါတယ်။',
    'symlink တစ်ခုချင်းစီကို တစ်ကြောင်းချင်းစီ run လုပ်ပါ — အဟောင်း link ရှိရင် `ln -sf` သုံးပါ။',
    'ပြီးရင် `pm2 -v` နဲ့ `which pm2` နဲ့ စစ်ပါ။',
  ],
  steps: [
    {
      title: '1. PM2 ကို global ထည့်ပါ',
      description:
        '`sudo` နဲ့ global ထည့်ရင် npm က root ရဲ့ global prefix အောက်မှာ ထည့်ပါတယ်။ ကိုယ့်မှာ node က `/usr/local/nodejs` ဆိုရင် binary က အောက်ကလို ပေါ်ပါလိမ့်မယ်။',
      code: `sudo npm install pm2 -g`,
    },
    {
      title: '2. Binary တွေကို /usr/local/bin နဲ့ ချိတ်ပါ',
      description:
        'Node ကို `/usr/local/nodejs` မှာ ထားထားတဲ့အတွက် PM2 က `/usr/local/nodejs/bin/` အောက်မှာ ရှိပါတယ်။ PATH ထဲမှာ အမြဲတမ်း ပါနေတဲ့ `/usr/local/bin` ကို target အဖြစ် သုံးပါ။ အောက်က `pm2` လင့်ခ်ကို တစ်ကြောင်းတည်းသာ ထားပါ (နှစ်ကြောင်းထပ်မထည့်ပါနဲ့)။',
      code: `sudo ln -s /usr/local/nodejs/bin/pm2 /usr/local/bin/pm2
sudo ln -s /usr/local/nodejs/bin/pm2-runtime /usr/local/bin/pm2-runtime
sudo ln -s /usr/local/nodejs/bin/pm2-dev /usr/local/bin/pm2-dev
sudo ln -s /usr/local/nodejs/bin/pm2-docker /usr/local/bin/pm2-docker`,
    },
    {
      title: '3. စစ်ပါ',
      description:
        '`which` က `/usr/local/bin/pm2` ပြရင် အောင်မြင်ပါတယ်။ version ထုတ်ကြည့်ပါ။',
      code: `which pm2
pm2 -v`,
    },
  ],
  commands: [
    { command: 'pm2 list', description: 'Process list' },
    { command: 'pm2 start app.js --name api', description: 'Start example app' },
    { command: 'pm2 save && pm2 startup', description: 'Boot persistence (follow printed instructions)' },
    { command: 'npm config get prefix', description: 'See npm global prefix if paths differ' },
  ],
  notes: [
    'Node က `/usr/local/nodejs` မဟုတ်ဘဲ နေရာတခြားမှာ ဆိုရင် symlink ရဲ့ source path ကို ကိုယ့် `npm bin -g` သို့ `ls $(npm root -g)/../bin` နဲ့ ကိုက်အောင် လဲပါ။',
    'symlink ရှိပြီးသား ဖြစ်နေရင် `sudo ln -sf ...` နဲ့ အစားထိုးလို့ရပါတယ်။',
    '`pm2 startup` က distro အလိုက် systemd ကို ထုတ်ပေးပါတယ် — ပြီးရင် ပြောတဲ့ command ကို run ပါ။',
  ],
}
