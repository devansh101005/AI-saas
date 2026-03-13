# devX.ai — AI-Powered Creative Suite

A full-stack AI SaaS platform that provides 6 AI-powered tools for content creation, image generation, and document analysis. Built with a decoupled headless architecture — React frontend and Express backend deployed independently on Vercel.

**Live:** [devxaiclient.vercel.app](https://devxaiclient.vercel.app/)

---

## Features

- **Article Writer** — Generate long-form articles using Google Gemini AI
- **Blog Title Generator** — Get creative blog title suggestions instantly
- **Image Generator** — Text-to-image generation via ClipDrop API (Premium)
- **Background Remover** — Remove image backgrounds using Cloudinary AI (Premium)
- **Object Remover** — Remove specific objects from images with AI (Premium)
- **Resume Reviewer** — Upload a PDF resume and get AI-powered feedback (Premium)
- **Community Gallery** — Browse and share AI-generated images publicly

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Tailwind CSS 4 | Styling |
| React Router 7 | Client-side routing |
| Clerk | Authentication & user management |
| Axios | HTTP client |
| Lucide React | Icons |
| React Markdown | Rendering AI-generated content |
| React Error Boundary | Graceful error handling |

### Backend
| Technology | Purpose |
|---|---|
| Express 5 | Web framework |
| Neon PostgreSQL | Serverless database |
| Clerk Express | Auth middleware |
| Google Gemini AI | Text generation (via OpenAI SDK) |
| Cloudinary | Image uploads, bg removal, object removal |
| ClipDrop API | Text-to-image generation |
| Multer | File upload handling |
| Zod | Request validation |
| express-rate-limit | API & AI endpoint rate limiting |

## Architecture

```
┌─────────────────┐         ┌─────────────────────┐
│   React Client  │  HTTPS  │   Express Backend    │
│   (Vercel)      │────────▶│   (Vercel)           │
│                 │         │                      │
│  Clerk Auth     │         │  Clerk Middleware     │
│  React Router   │         │  Rate Limiting        │
│  Tailwind CSS   │         │  Zod Validation       │
└─────────────────┘         └──────┬──┬──┬──┬──────┘
                                   │  │  │  │
                    ┌──────────────┘  │  │  └──────────────┐
                    ▼                 ▼  ▼                  ▼
              ┌──────────┐  ┌──────────┐ ┌──────────┐ ┌──────────┐
              │  Neon    │  │ Gemini   │ │Cloudinary│ │ ClipDrop │
              │ Postgres │  │   AI     │ │          │ │          │
              └──────────┘  └──────────┘ └──────────┘ └──────────┘
```

## Project Structure

```
aisaas/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── AiTools.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── CreationItem.jsx
│   │   │   └── ...
│   │   ├── pages/             # Route pages
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── WriteArticle.jsx
│   │   │   ├── GenerateImages.jsx
│   │   │   ├── ReviewResume.jsx
│   │   │   └── ...
│   │   ├── lib/               # API client config
│   │   └── assets/            # Static data & images
│   ├── .env.example
│   └── vercel.json
│
├── server/                    # Express backend
│   ├── configs/               # DB & Cloudinary setup
│   ├── controllers/           # Route handlers (AI, user, creation)
│   ├── middlewares/            # Auth, error handler, rate limiter
│   ├── routes/                # API route definitions
│   ├── validations/           # Zod request schemas
│   ├── utils/                 # File cleanup helpers
│   ├── server.js              # App entry point
│   ├── .env.example
│   └── vercel.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- [Clerk](https://clerk.com) account (authentication)
- [Neon](https://neon.tech) PostgreSQL database
- [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- [Cloudinary](https://cloudinary.com) account
- [ClipDrop](https://clipdrop.co) API key (image generation)

### Setup

**1. Clone the repository**
```bash
git clone https://github.com/devansh101005/aisaas.git
cd aisaas
```

**2. Backend setup**
```bash
cd server
npm install
cp .env.example .env
# Fill in your environment variables in .env
npm run server
```

**3. Frontend setup**
```bash
cd client
npm install
cp .env.example .env
# Fill in your environment variables in .env
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/generate-article` | Generate an article | Yes |
| POST | `/api/ai/generate-blog-title` | Generate blog titles | Yes |
| POST | `/api/ai/generate-image` | Text-to-image generation | Premium |
| POST | `/api/ai/remove-background` | Remove image background | Premium |
| POST | `/api/ai/remove-object` | Remove object from image | Premium |
| POST | `/api/ai/resume-review` | AI resume review | Premium |
| GET | `/api/creation/user` | Get user's creations | Yes |
| GET | `/api/creation/community` | Get public creations | No |

## Deployment

Both frontend and backend are deployed as separate Vercel projects with independent domains:

- **Frontend:** Deployed as a Vite static site
- **Backend:** Deployed as a Vercel serverless function

CORS is configured to allow cross-origin requests between the two domains. The backend uses `trust proxy` for correct IP detection behind Vercel's reverse proxy.
