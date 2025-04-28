#!/bin/bash

git config core.hooksPath .git-hooks
chmod +x .git-hooks/pre-commit
echo "Git hooks configured."

docker compose -f docker-compose.yml up --build --force-recreate "$@"

