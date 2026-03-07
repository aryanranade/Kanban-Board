# How to Run the Kanban Board Project

## Prerequisites

- **Node.js** (v18 or higher) — [download](https://nodejs.org/)
- **npm** (comes with Node.js)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5173/**

### 3. Build for Production

```bash
npm run build
```

This creates an optimized bundle in the `dist/` folder.

### 4. Preview the Production Build

```bash
npm run preview
```

---

## Deployment

### Vercel

```bash
npm run build
npx vercel --prod
```

### Netlify

```bash
npm run build
npx netlify-cli deploy --prod --dir dist
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React | UI framework |
| Vite | Build tool & dev server |
| Vanilla CSS | Styling (no Tailwind) |
| localStorage | Data persistence |
| HTML5 Drag & Drop | Task movement between columns |
