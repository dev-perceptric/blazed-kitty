#!/bin/sh
# While expand.py creates Printful products: every 45 min photograph new products, make model photos,
# rebuild the catalog, test-build the site, and deploy (only if main has not moved and the build passes).
LOG=/home/user/brand/ck/expand/publish.log
while true; do
  cd /home/user/brand/tools
  echo "== $(date +%H:%M) cycle" >> $LOG
  python3 -I local_shots2.py >> $LOG 2>&1
  python3 -I models_expand.py >> $LOG 2>&1
  python3 -I web_images.py shots >> $LOG 2>&1
  cd /home/user/blazed-kitty
  python3 scripts/build_catalog.py >> $LOG 2>&1
  if ! git diff --quiet lib/products.ts lib/mockups.json; then
    if npm run build > /tmp/bk_build.log 2>&1; then
      git add lib/products.ts lib/mockups.json
      git commit -q -m "More products: women's tops, men's tees and tanks, hoodies, panties

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01M8mVGoRpEYRUtbqDWw9UdB"
      git fetch -q origin
      if git merge-base --is-ancestor origin/main HEAD; then
        git push -q origin HEAD:panties-vcut && git push -q origin HEAD:main && echo "deployed $(git rev-parse --short HEAD)" >> $LOG
      else
        echo "main moved, not pushing" >> $LOG
      fi
    else
      echo "build failed, not pushing" >> $LOG
    fi
  fi
  if ! pgrep -f "expand.py run" > /dev/null; then
    if [ -n "$LASTPASS" ]; then echo "LOOP_DONE" >> $LOG; break; fi
    LASTPASS=1
  fi
  sleep 2700
done
