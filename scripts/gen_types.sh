DB_PATH=pocketbase/pb_data/data.db
OUT_PATH=app/src/lib/pb/types/pocketbase.d.ts
EMAIL=admin@email.com
PASSWORD=Password

npx pocketbase-typegen --db ${DB_PATH} --out ${OUT_PATH}
