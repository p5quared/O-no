# HellHopper 🐸

A multiplayer hopping game where frogs race to reach heaven before it's too late.

## The Story

It's 1945 in frog years. The frog-atomic bombs have devastated your frog-city. As a virtuous frog, you expected a peaceful ascent to frog-heaven, but there's a problem:

Due to budget cuts:
- Frog-heaven has limited capacity
- The stairway to heaven is broken
- Only the fastest hoppers will make it in

Hop your way up before space runs out, or face eternal damnation in frog-hell!

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm run dev
```

3. Start hopping at `http://localhost:5173`

## Tech Stack

- Frontend: SvelteKit
- Backend: PocketBase
- Authentication: Google OAuth

## Game Features

- Real-time multiplayer hopping
- Global leaderboard
- Live lobby system
- Profile customization

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


