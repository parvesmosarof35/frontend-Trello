# Frontend - Mini Trello (Kanban Board)

A sleek, responsive, modern Kanban Board web application built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **@dnd-kit**.

## Key Features
- **Modern Dark Aesthetic**: Clean, responsive layout with glassmorphic accents, tailored typography, and smooth transitions.
- **Authentication Flow**: Protected routes, JWT token persistence, and fast auth state switching.
- **Multi-Column Drag & Drop**: Powered by `@dnd-kit/core` and `@dnd-kit/sortable` supporting same-column reordering and cross-column moves.
- **Optimistic UI Updates**: Immediate client-side reordering combined with atomic backend synchronization (`PATCH /api/tasks/:id/move`).
- **Board Sharing & Collaboration**: Invite team members by email, assign permissions (Member vs Viewer), and view member lists.
- **Task Management**: Create, edit, and delete tasks with instant column reflections.
- **Dockerized**: Multi-stage production Dockerfile.

## Quick Start
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
