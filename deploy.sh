#!/bin/bash
source ~/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd /var/www/picklett-sports-betting-site
git pull origin master
pnpm install
pnpm run build
pm2 restart Picklett