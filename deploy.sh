#!/bin/bash
source ~/.bashrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

export WEBHOOK_SECRET=$(grep WEBHOOK_SECRET /var/www/picklett-sports-betting-site/.env.local | cut -d '=' -f2- | tr -d '"')

cd /var/www/picklett-sports-betting-site
git pull origin master
pnpm install
pnpm run build
pm2 restart Picklett

# Wait for 10 seconds before sending POST request
sleep 10

curl -X POST "http://localhost:3000/api/deposit/restart-monitoring" -H "token: $WEBHOOK_SECRET"