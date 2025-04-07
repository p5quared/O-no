# Multiplayer Web Game (Name TBD)

A real-time multiplayer game built with **SvelteKit**, **PocketBase**, and **Supabase**, using **custom WebSockets** for real-time gameplay.

> 🎮 The game concept is still being finalized. This README will be updated with gameplay details once chosen.

---

## 🧰 Tech Stack

- **Frontend**: [SvelteKit](https://kit.svelte.dev)
- **Realtime**: Custom WebSockets
- **Database/Auth**: [Supabase](https://supabase.com) & [PocketBase](https://pocketbase.io)
- **Styling**: Tailwind CSS
- **Testing**: Vitest & Playwright
- **Dev Environment**: Docker + Docker Compose

---

## 🚀 Getting Started (Development)

Use the provided script to start the dev environment:

```bash
./scripts/dev.sh
```

This starts:
- The SvelteKit frontend
- PocketBase (via Docker)
- Supabase (via your configured environment)

App will be available at: [http://localhost:5173](http://localhost:5173)

---

## 🌐 Environment Variables

Required environment variables:

| Variable                | Purpose                               |
|-------------------------|----------------------------------------|
| `PUBLIC_POCKETBASE_URL` | PocketBase API URL (e.g. `http://localhost:8090`) |
| `SUPABASE_URL`          | Your Supabase project URL              |
| `SUPABASE_ANON_KEY`     | Supabase anon/public key               |
| `NODE_ENV`              | Usually set to `development`           |

---

## 🧪 Testing

Run unit and e2e tests:

```bash
npm run test:unit
npm run test:e2e
```

---

## 📁 Project Structure

```
.
├── app/                # SvelteKit frontend
├── pocketbase/         # Dockerized backend
├── scripts/            # Dev scripts
├── docker-compose.*    # Dev configuration
└── README.md
```

---

## 📌 Project Planning

All tasks, bugs, and feature requests are tracked using [GitHub Issues](../../issues) and [GitHub Projects](../../projects). Please refer there for the current TODO list.

---

## 🧠 Credits

Built with ❤️ using SvelteKit, Supabase, PocketBase, and WebSockets.


