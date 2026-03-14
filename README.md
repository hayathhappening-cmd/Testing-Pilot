# QA Copilot

QA Copilot is an AI-powered SaaS platform for test engineers built with:

- Next.js + React + TailwindCSS frontend
- Express backend API
- PostgreSQL + Prisma
- JWT authentication with admin approval
- OpenAI integration hooks
- Stripe-ready billing flow
- Docker Compose for local full-stack startup

## Local Run

Use Docker:

```bash
docker compose up --build -d
docker compose exec api sh -lc "npx prisma db push && npm run db:seed"
```

Then open:

- Web: `http://localhost:3000`
- API: `http://localhost:4000/api/health`

Admin login:

- Email: `admin@qacopilot.ai`
- Password: `Admin@123`

## Deployment Note

This repo is structured as a split deployment:

- Frontend can be hosted on Vercel
- Express API should be hosted separately on a Node-friendly platform such as Railway, Render, or Fly.io
- PostgreSQL should be hosted separately

If you want full Vercel hosting, the Express backend should be refactored into Next.js serverless/API routes first.

