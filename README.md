# Multiplayer Web Game (Name TBD)

This is a real-time multiplayer game built with **SvelteKit**, **PocketBase**, and **Supabase**. It uses **custom WebSockets** for real-time interactions.

> 🎮 The actual game is still being decided. Game details and mechanics will be added soon!

---

## 🧰 Tech Stack

- **Frontend**: [SvelteKit](https://kit.svelte.dev)
- **Real-time Multiplayer**: WebSockets (custom socket logic)
- **Auth & Realtime DB**: [Supabase](https://supabase.io)
- **Admin DB & File Store**: [PocketBase](https://pocketbase.io)
- **Styling**: Tailwind CSS
- **Testing**: Vitest & Playwright
- **Tooling**: Docker + Docker Compose

---

## 🚀 Getting Started (Dev)

> 🐳 Docker is required

### Run all services:

```bash
./scripts/dev.sh
```

This script launches:
- `frontend-dev` (SvelteKit)
- `pocketbase` (Dockerized)
- Supabase assumed to be connected via env vars

> Or use raw Docker:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Environment Variables

Make sure these are set up:

| Key                      | Description                         |
|--------------------------|-------------------------------------|
| `PUBLIC_POCKETBASE_URL`  | URL to PocketBase API (e.g. `http://localhost:8090`) |
| `SUPABASE_URL`           | Your Supabase project URL           |
| `SUPABASE_ANON_KEY`      | Public key for Supabase client auth |
| `NODE_ENV`               | Usually `development`               |

Use `.env` or inject them directly in your shell or Docker config.

---

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# End-to-end tests
npm run test:e2e
```

---

## 📦 Production

To build:

```bash
npm run build
```

To preview the build locally:

```bash
npm run preview
```

Or build/run with Docker:

```bash
docker-compose -f docker-compose.yml up --build
```

---

## 📁 Project Structure

```
.
├── app/                # Frontend (SvelteKit)
├── pocketbase/         # Backend (Dockerized PocketBase)
├── scripts/            # Dev scripts
├── docker-compose.*    # Docker environments
├── .env                # Environment variables (optional)
└── README.md
```

---

## ✅ TODO

- [ ] Choose the actual game to implement
- [ ] Connect Supabase (auth / real-time / persistence)
- [ ] Add socket multiplayer logic
- [ ] Create UI/UX flow
- [ ] Write integration & gameplay tests

---

## 🧠 Credits

Built with ❤️ using SvelteKit, Supabase, PocketBase, and sockets.


