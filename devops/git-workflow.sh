#!/usr/bin/env bash
# Weeks 2-3 – Git workflow. Replace the URL with your own repo.
git init -b main
git add . && git commit -m "chore: initial HomeEase project"
git branch development && git checkout development
git checkout -b feature/ai-assistant              # feature branch
git add . && git commit -m "feat: add rule-based AI assistant"
git checkout development && git merge --no-ff feature/ai-assistant -m "merge: AI assistant"
git checkout main && git merge development        # release
git remote add origin https://github.com/<your-username>/HomeEase.git
git push -u origin main && git push -u origin development
git pull origin main
git log --oneline --graph --all
