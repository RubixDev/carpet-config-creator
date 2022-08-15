#!/usr/bin/env sh

# abort on errors
set -e

# delete previous dist
rm -vrf dist

# build
npm run build
cd dist

# set custom domain
echo carpet.rubixdev.de > CNAME

# deploy
git init -b master
git add -A
git commit -m 'gh-pages'
git push -f git@github.com:RubixDev/carpet-config-creator.git master:gh-pages

cd -
