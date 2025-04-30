# HellHopper 🐸

A multiplayer hopping game where frogs race to reach heaven before it's too late.

**Play now: [hellhopper.myintro.link](https://hellhoppers.myintro.link)**

## 🐸 Hop or Hell: Race to Salvation

It's 1945 in frog years. The frog-atomic bombs have devastated your frog-city. As a virtuous frog, you expected a peaceful ascent to frog-heaven, but there's a problem:

Due to budget cuts:
- Frog-heaven has limited capacity
- The stairway to heaven is broken
- Only the fastest hoppers will make it in

Hop your way up before space runs out, or face eternal damnation in frog-hell!

## Live Demo

Visit [hellhopper.myintro.link](https://hellhoppers.myintro.link) to play the game online!

## Quick Start

1. Start the application:
```bash
./scripts/dev.sh
```

2. Start hopping at `http://localhost:5173`

3. To stop the application:
```bash
./scripts/down.sh
```

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
- **Database/Auth**: [PocketBase](https://pocketbase.io)
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

App will be available at: [http://localhost:5173](http://localhost:5173)

---

## 🌐 Environment Variables

Required environment variables:

| Variable                | Purpose                               |
|-------------------------|----------------------------------------|
| `PUBLIC_POCKETBASE_URL` | PocketBase API URL (e.g. `http://localhost:8090`) |
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

Built with ❤️ using SvelteKit, PocketBase, and WebSockets.


