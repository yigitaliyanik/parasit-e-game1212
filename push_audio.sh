#!/bin/bash
cd "/Users/mehmetyanik/parasit(e)"
git add .
git commit -m "feat: implement global audio system, bgm, sfx, and mute toggle"
git push origin main
rm -- "$0"
