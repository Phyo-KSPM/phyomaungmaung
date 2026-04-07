import type { BlogPost } from './blogPostTypes'

export const zabbixInstallationPost: BlogPost = {
  slug: 'zabbix-monitoring-server-installation',
  title: 'Zabbix 7.0 LTS — Installation on Ubuntu 24.04 LTS',
  date: 'Draft',
  category: 'Monitoring',
  image: '/blog-zabbix.svg',
  excerpt:
    'Ubuntu 24.04 LTS ပေါ်မှာ MySQL、`zabbix-release` repo၊ Zabbix server/frontend/agent၊ DB schema import、`zabbix_server.conf` ချိန်ပြီး Apache မှ `http://host/zabbix` UI setup (wizard + default Admin login) အထိ လမ်းညွှန်ပါမယ်။',
  readTime: '20 min read',
  author: 'Phyo Maung Maung',
  detailIntro:
    'ဒီလမ်းညွှန်က Zabbix 7.0 LTS ကို Ubuntu 24.04 (Noble) ပေါ်မှာ official repository နဲ့ တပ်ဆင်ပြီး MySQL backend နဲ့ ချိတ်ပြီး web UI အထိ စမ်းနိုင်အောင် ရေးထားပါတယ်။ လမ်းညွှန်ထဲက database password ဥပမာများ (`Letmein+123`) ကို training/demo အတွက်သာ သုံးပါ — production မှာ မိမိသတ်မှတ် strong credential တွေနဲ့ အစားထိုးပါ။',
  detailSummary: [
    'Zabbix official `7.0` + `ubuntu24.04` release package နဲ့ apt dependency တွေကို တရားဝင်လမ်းကြောင်းအတိုင်း ရယူနိုင်ပါတယ်။',
    'MySQL မှာ `zabbix` database / user ဖန်တီးပြီး `server.sql.gz` import လုပ်ပြီးမှ `zabbix_server.conf` မှာ `DBPassword` ကိုက်ညီအောင် ထားရပါမယ်။',
    'Web installer ပြီးရင် default login မှာ username `Admin` (case-sensitive)၊ password `zabbix` ဖြစ်ပါတယ် — ပထမဝင်ချိန်မှာ ပြောင်းသင့်ပါတယ်။',
  ],
  steps: [
    {
      title: '1. Update the system package list',
      code: `sudo apt update -y
sudo apt upgrade -y`,
    },
    {
      title: '2. MySQL Server installation',
      description:
        '`mysql-server` ထည့်ပြီး root အတွက် `mysql_native_password` နဲ့ password သတ်မှတ်ပါ။ အောက်က ဥပမာမှာ password ကို `Letmein+123` လို့ ထားထားပါတယ်။ ပြီးရင် `mysql_secure_installation` ကို interactive အဖြေတွေနဲ့ လုပ်ပါ။',
      code: `sudo apt install -y mysql-server
sudo mysql

# In mysql prompt (MySQL 8 style — adjust if your server uses different auth):
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Letmein+123';
EXIT;

sudo mysql_secure_installation
# type your password: Letmein+123
# Press y|Y for Yes for validate password plugin: y
# Please enter 0 = LOW, 1 = MEDIUM and 2 = STRONG: 0
# Change the password for root? : n
# Remove anonymous users? Y
# Disallow root login remotely? Y
# Remove test database? Y
# Reload privilege tables? Y

# Verify login
sudo mysql -u root -p
# Enter: Letmein+123`,
    },
    {
      title: '3. Zabbix installation — repository & packages',
      description:
        'Root shell (`sudo -s`) သုံးလို့ရပါတယ်။ အောက်က command တွေကို `sudo` နဲ့ လုပ်ပါ။',
      code: `sudo wget https://repo.zabbix.com/zabbix/7.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_latest_7.0+ubuntu24.04_all.deb

sudo dpkg -i zabbix-release_latest_7.0+ubuntu24.04_all.deb
sudo apt update

sudo apt install -y zabbix-server-mysql zabbix-frontend-php zabbix-apache-conf zabbix-sql-scripts zabbix-agent`,
    },
    {
      title: '4. Create initial database',
      description:
        'Database host ပေါ်မှာ MySQL ဝင်ပြီး `zabbix` database နဲ့ user ကို ဖန်တီးပါ။ Password ဥပမာ ကို လမ်းညွှန်တစ်လျှောက်တည်း `Letmein+123` နဲ့ ထားထားပါတယ်။',
      code: `sudo mysql -u root -p
# Password: Letmein+123

CREATE DATABASE zabbix CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
CREATE USER zabbix@localhost IDENTIFIED BY 'Letmein+123';
GRANT ALL PRIVILEGES ON zabbix.* TO zabbix@localhost;
SET GLOBAL log_bin_trust_function_creators = 1;
QUIT;`,
    },
    {
      title: '5. Import initial schema and data',
      description:
        'Zabbix server host ပေါ်မှာ schema import လုပ်ပါ။ Password မေးရင် `zabbix` user password (`Letmein+123`) ထည့်ပါ။ Import ကြာချိန် အနည်းငယ် ကြာနိုင်ပါတယ်။',
      code: `zcat /usr/share/zabbix-sql-scripts/mysql/server.sql.gz | mysql --default-character-set=utf8mb4 -uzabbix -p zabbix
# Enter password for zabbix user: Letmein+123`,
    },
    {
      title: '6. Disable log_bin_trust_function_creators',
      code: `sudo mysql -u root -p
# Password: Letmein+123

SET GLOBAL log_bin_trust_function_creators = 0;
QUIT;`,
    },
    {
      title: '7. Configure Zabbix server — DBPassword',
      description:
        '`/etc/zabbix/zabbix_server.conf` ထဲမှာ `DBPassword` ကို `zabbix` MySQL user password နဲ့ ကိုက်အောင် ထားပါ။',
      code: `sudo nano /etc/zabbix/zabbix_server.conf

# Set (example — match your zabbix DB user password):
# DBPassword=Letmein+123`,
    },
    {
      title: '8. Start Zabbix server, agent, and Apache',
      description: 'Boot အတွင်း auto-start ဖြစ်အောင် enable လုပ်ပါ။',
      code: `sudo systemctl restart zabbix-server zabbix-agent apache2
sudo systemctl enable zabbix-server zabbix-agent apache2
sudo systemctl status zabbix-server zabbix-agent apache2`,
    },
    {
      title: '9. Open Zabbix UI',
      description:
        'Apache နဲ့ ထည့်ထားတဲ့ default URL က `http://<host>/zabbix` ဖြစ်ပါတယ်။ Local မှာ `http://localhost/zabbix` သို့မဟုတ် server IP နဲ့ ဝင်ပါ။',
      code: `# Browser:
# http://<your-server-ip>/zabbix
# or
# https://localhost/zabbix   (if TLS terminated locally)`,
    },
    {
      title: '10. Initial setup wizard (web UI)',
      description:
        'Wizard မှာ Next နှိပ်ပြီး database connection ကို အောက်ပါအတိုင်း ဖြည့်ပါ။ (လမ်းညွှန်ဥပမာ password နဲ့ ကိုက်အောင်)',
      code: `# Wizard fields:
# Database host : localhost
# Database port : 3306
# Database name : zabbix
# User            : zabbix
# Password        : Letmein+123

# After wizard completes — default Zabbix login:
# Username : Admin
# Password : zabbix`,
    },
  ],
  commands: [
    { command: 'sudo systemctl status zabbix-server', description: 'Zabbix server daemon state' },
    { command: 'sudo systemctl restart zabbix-server', description: 'Restart after conf/DB changes' },
    { command: 'sudo tail -f /var/log/zabbix/zabbix_server.log', description: 'Server log (troubleshooting)' },
    { command: 'mysql -u zabbix -p zabbix', description: 'Test DB user connection (optional)' },
  ],
  notes: [
    'Training လမ်းညွှန်ထဲက `Letmein+123` နှင့် default UI password `zabbix` တွေကို production မှာ မသုံးပါနဲ့ — အစားထိုးပြီး firewall (ဥပမာ UFW port 80/443) နဲ့ access ကန့်သတ်ပါ။',
    '`mysql_native_password` နဲ့ root setup က MySQL version / default auth plugin ပေါ်မူတည်ပြီး ပြောင်းလဲနိုင်ပါတယ် — error ရရင် MySQL 8 doc ကို ကြည့်ပါ။',
  ],
}
