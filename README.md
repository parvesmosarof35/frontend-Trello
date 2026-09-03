# 🎨 Mini Trello - Modern Next.js 15 Kanban Frontend

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![dnd kit](https://img.shields.io/badge/dnd--kit-Drag_&_Drop-6366F1?style=for-the-badge)](https://dndkit.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

A modern, responsive, glassmorphic Kanban Board web application built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **@dnd-kit** multi-column drag-and-drop.

---

## 🌐 Live Deployments & Repository Links

- 🖥️ **Live Web Application**: [https://trello-frontend-0bewi0-d3595b-2-24-82-111.sslip.io](https://trello-frontend-0bewi0-d3595b-2-24-82-111.sslip.io)
- 🔗 **Live Backend API**: [https://trello-trellobackend-oh99sz-6fe50c-2-24-82-111.sslip.io/api](https://trello-trellobackend-oh99sz-6fe50c-2-24-82-111.sslip.io/api)
- 🐙 **GitHub Repository**: [https://github.com/parvesmosarof35/frontend-Trello](https://github.com/parvesmosarof35/frontend-Trello)

---

## 🔑 Pre-seeded Demo Credentials

You can immediately log in to test the application using either of the pre-seeded accounts:

| User Name | Email | Password | Role & Access |
| :--- | :--- | :--- | :--- |
| **Parves Mosarof** | `parves@trello.com` | `password123` | Owner of E-Commerce Platform V2 |
| **Rahim Ahmed** | `rahim@trello.com` | `password123` | Owner of Mobile App Roadmap |

---

## ✨ Features & Highlights

- 🎯 **Multi-Column Drag & Drop Engine**:
  - Built with `@dnd-kit/core` and `@dnd-kit/sortable`.
  - Supports smooth mouse dragging, mobile touch dragging (150ms hold), and 1-tap quick move dropdown.
  - Isolated drag state preventing unnecessary parent re-renders and React Error 185.
- 🏷️ **Priority & Tagging Labels**:
  - `URGENT` (Red), `HIGH` (Orange), `MEDIUM` (Blue), `LOW` (Slate) priority tags.
  - Interactive multi-label chips (`Bug`, `Feature`, `Design`, `DevOps`, etc.).
- 📅 **Due Dates & Overdue Alerts**:
  - Visual deadline badge with automated red `Overdue` indicator.
- ☑️ **Interactive Subtasks Checklist**:
  - Interactive checkboxes with live progress bar (`2/4 (50%)`) directly on cards.
- 💬 **Comments Feed & Discussions**:
  - Real-time comment posting on task cards with author avatar and timestamp.
- 🔍 **Real-Time Search & 1-Click Filter Pills**:
  - Live task search by keyword.
  - Filter pills: `All`, `🔥 High Priority`, `⏰ Overdue`, `☑️ Checklist`, `💬 Comments`.
- ⚡ **Inline Quick Task Creation**:
  - Type task name and press `Enter` directly on any column without opening a modal.
- 🖼️ **Cloudinary CDN Cover Image Upload**:
  - Unsigned direct client upload with live preview and cover banner cards.

---

## 🏗️ Project Structure

```text
Frontend/
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js 15 App Router
│   │   ├── (auth)/            # Auth routes (/login, /register)
│   │   ├── boards/[id]/       # Interactive Kanban board view
│   │   ├── dashboard/         # User board gallery
│   │   ├── layout.tsx         # Root layout with AuthProvider & Navbar
│   │   └── page.tsx           # Modern Landing page
│   ├── components/
│   │   ├── kanban/            # KanbanBoard, KanbanColumn, TaskCard, DragOverlayTask
│   │   ├── modals/            # CreateBoardModal, ShareBoardModal, CreateTaskModal, EditTaskModal
│   │   └── ui/                # Navbar, Modal, Glassmorphic containers
│   ├── context/               # AuthContext (JWT session management)
│   ├── lib/                   # Axios API instance, Cloudinary uploader, date utils
│   └── types/                 # TypeScript interfaces (Board, Column, Task, Subtask, Comment)
├── next.config.ts             # Standalone output & remote image domains
└── package.json
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js 20+
- Running backend server (local or deployed)

### 2. Environment Variables (`Frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://trello-trellobackend-oh99sz-6fe50c-2-24-82-111.sslip.io/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dhxyjdrvr
NEXT_PUBLIC_CLOUDINARY_API_KEY=911115682562965
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=cloudinaryPractice
```

### 3. Install & Start Development Server
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### 4. Build Production Bundle
```bash
npm run build
npm run start
```

---

## 🐳 Docker Deployment

```bash
docker build -t trello-frontend .
docker run -p 3000:3000 trello-frontend
```
