#!/bin/bash

if [ "$1" == "--dev" ]; then
    shift
    docker compose -f docker-compose.dev.yml down "$@"
else
    docker compose down "$@"
fi
