#!/bin/bash
set -e

echo "===== PocketBase Startup ====="

# Check if migrations directory exists and has files
if [ -d "/pb_migrations" ] && [ "$(ls -A /pb_migrations)" ]; then
    echo "Found migrations in /pb_migrations"
    
    # Run migrations
    echo "Running database migrations..."
    /pocketbase migrate
    
    # Check if migrations were successful
    if [ $? -eq 0 ]; then
        echo "Migrations completed successfully"
    else
        echo "Migration failed! Check your migration files."
        exit 1
    fi
else
    echo "No migrations found in /pb_migrations"
fi

# Start PocketBase server
echo "Starting PocketBase server..."
exec /pocketbase serve --http=0.0.0.0:8090 --dir=/pb_data --publicDir=/pb_public --migrationsDir=/pb_migrations --origins=*
