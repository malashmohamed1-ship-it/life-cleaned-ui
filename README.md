
# LIFE — Fast, grounded answers that remember and act.

A clean Next.js UI for LIFE with:
- 🧠 **Answer area** (Chat-style)
- 📝 **Feedback form** (styled)
- 💊 **Medical Reminders** (persisted in localStorage)
- 🔔 **Toast notifications**
- 🌙 **Dark/Light mode** toggle (persisted)
- 🎨 **Tailwind CSS** styling

## Live Demo
Use your Vercel URL here (example):
https://lifee001-app-git-main-malashs-projects.vercel.app

## Quickstart (Local)
```bash
# from your project folder
npm install
npm run dev
```

Visit http://localhost:3000

## File Map (what this adds/changes)
```
components/
  DarkModeToggle.jsx
  MedicalReminder.jsx
  Toast.jsx
pages/
  index.js
styles/
  globals.css (light tweaks; keep your Tailwind directives)
README.md
```

> If you still have CRA leftovers like `src/App.js` and `src/index.js`, remove them. Next.js uses `pages/`.

## Notes
- Medical reminders persist in `localStorage` under the key `life_medications`.
- Dark mode preference persists in `localStorage` under the key `life_theme`.
- Hook your feedback submit to `/api/feedback` when ready (see comment in `pages/index.js`).
