#!/bin/sh
# Last pass after all Printful products exist: panty photos + poses, any missing top photos, models, deploy.
LOG=/home/user/brand/ck/expand/final.log
cd /home/user/brand/tools
python3 -I printful_product_shots.py >> $LOG 2>&1
python3 -I panty_poses.py >> $LOG 2>&1
python3 -I local_shots2.py >> $LOG 2>&1
python3 -I models_expand.py >> $LOG 2>&1
python3 -I audit_models.py fix >> $LOG 2>&1
python3 -I web_images.py shots >> $LOG 2>&1
cd /home/user/blazed-kitty
python3 scripts/build_catalog.py >> $LOG 2>&1
if npm run build > /tmp/bk_build.log 2>&1; then
  git add lib/products.ts lib/mockups.json
  git commit -q -m "Last products: string panties and hoodies for the newest designs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01M8mVGoRpEYRUtbqDWw9UdB"
  git fetch -q origin
  if git merge-base --is-ancestor origin/main HEAD; then git push -q origin HEAD:panties-vcut && git push -q origin HEAD:main && echo "deployed $(git rev-parse --short HEAD)" >> $LOG; else echo "main moved" >> $LOG; fi
else echo "build failed" >> $LOG; fi
echo FINAL_DONE >> $LOG
