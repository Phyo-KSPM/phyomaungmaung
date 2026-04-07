import type { BlogPost } from './blogPostTypes'

export const zabbixInstallationPost: BlogPost = {
  slug: 'zabbix-monitoring-server-installation',
  title: 'Zabbix 7.0 LTS — Installation on Ubuntu 24.04 LTS',
  date: 'Published · 7 Apr 2026',
  category: 'Monitoring',
  image: '/blog-covers/zabbix.png',
  excerpt:
    '24.04 မှာ MySQL ထည့်ပြီး zabbix repo ကနေ server/frontend/agent ဆွဲပြီး schema ထည့်ကာ web wizard အထိ။ အောက်က `Letmein+123` တွေက ဥပမာသာ — အမှန်တကယ် သုံးမယ်ဆို လဲပါ။',
  readTime: '20 min read',
  author: 'Phyo Maung Maung',
  detailIntro:
    'Zabbix 7.0 ကို Noble ပေါ်မှာ တရားဝင် repo နဲ့ ထည့်ပြီး MySQL နဲ့ ချိတ်တဲ့ လမ်းကြောင်းပါ။ စာသားထဲက စကားဝှက်တွေက လေ့ကျင့်ခန်းအတွက် ပဲ — live မှာ မသုံးပါနဲ့။',
  detailSummary: [
    '`.deb` release ကို ထည့်ပြီး `apt install` နဲ့ ဆွဲလို့ရပါတယ်။',
    'DB နဲ့ user လုပ်ပြီး schema import မလုပ်ရင် server မတက်ပါဘူး။ `DBPassword` ကို MySQL နဲ့ တူအောင် ထားပါ။',
    'ပထမဝင်တဲ့အခါ Admin / zabbix ကို ချက်ချင်း ပြောင်းပါ — မပြောင်းရင် လွယ်လွယ်ကူကူ ဝင်လို့ရနေပါလိမ့်မယ်။',
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
        'MySQL 8 ဆိုရင် root auth က မတူတတ်လို့ အောက်က ALTER ကို ကြည့်ပါ။ `Letmein+123` က ဥပမာ။ `mysql_secure_installation` မှာ မေးတာတွေကို လက်တွေ့မှာ ကိုယ့်အသင့်ပြုပါ။',
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
      description: 'wget နဲ့ `.deb` ဆွဲပြီး dpkg → apt update → install။ တစ်ကြောင်းချင်းစီ လိုက်ပါ။',
      code: `sudo wget https://repo.zabbix.com/zabbix/7.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_latest_7.0+ubuntu24.04_all.deb

sudo dpkg -i zabbix-release_latest_7.0+ubuntu24.04_all.deb
sudo apt update

sudo apt install -y zabbix-server-mysql zabbix-frontend-php zabbix-apache-conf zabbix-sql-scripts zabbix-agent`,
    },
    {
      title: '4. Create initial database',
      description:
        '`log_bin_trust_function_creators = 1` က import အတွက် လိုပါတယ်။ import ပြီးမှ ပြန်ပိတ်ပါ။',
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
        'ကြာတတ်ပါတယ်။ မှားရင် နောက်တစ်ခါ server မတက်ပါဘူး — log ကို ကြည့်ပါ။',
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
      description: 'MySQL မှာ ထားတဲ့ စကားဝှက်နဲ့ တစ်လုံးချင်းတူရပါမယ်။',
      code: `sudo nano /etc/zabbix/zabbix_server.conf

# Set (example — match your zabbix DB user password):
# DBPassword=Letmein+123`,
    },
    {
      title: '8. Start Zabbix server, agent, and Apache',
      description: 'enable ထားမှ ပြန်စတင်တဲ့အခါ တက်ပါတယ်။',
      code: `sudo systemctl restart zabbix-server zabbix-agent apache2
sudo systemctl enable zabbix-server zabbix-agent apache2
sudo systemctl status zabbix-server zabbix-agent apache2`,
    },
    {
      title: '9. Open Zabbix UI',
      description:
        'များသောအားဖြင့် `/zabbix` path ပေါ့။ မတက်ရင် Apache error log ကို ဦးစားပေးကြည့်ပါ။',
      code: `# Browser:
# http://<your-server-ip>/zabbix
# or
# https://localhost/zabbix   (if TLS terminated locally)`,
    },
    {
      title: '10. Initial setup wizard (web UI)',
      description:
        'DB အချက်အလက်တွေကို မှားမထည့်ပါနဲ့။ ပြီးမှ web login ကို ပြောင်းပါ။',
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
    '`Letmein+123` နဲ့ default `zabbix` စကားဝှက်တွေကို အင်တာနက်ပေါ်မှာ မထားပါနဲ့။',
    'MySQL auth error ရရင် စာမျက်နှာပေါ်က error စာသားကို ကော်ပီပြီး doc မှာ ရှာပါ။',
  ],
}
