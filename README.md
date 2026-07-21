# 🥋 The Gentle Art Tracker

A minimalist, dark-mode Gi Jiu-Jitsu training app for serious practitioners.

Built with React + Vite + Tailwind CSS. There is no server or account to manage: your training data stays in the browser on the device you use.

---

## Features

### 📚 Technique Library
- 8 core BJJ categories: Guard, Pass, Submission, Back Take, Sweep, Escape, Takedown, Guard Pull
- Gi-specific grip metadata (Sleeve, Lapel, Pant, Belt grips)
- 1–10 confidence scoring with visual bar
- Reference video links (YouTube, Instagram)
- Search, filter by category, sort by name/confidence/recency

### 🎙️ Session Log
- Voice-to-text dictation via Web Speech API
- Smart technique tagging — link library moves to each session
- Session metadata: date, title, duration, type
- Full scrollable history with expandable notes

### 🗺️ Game Hub
- A-Game: Confidence 7+, trained in last 21 days
- B-Game: Confidence 4-6, active development
- C-Game / Lab: Experimental moves
- Strategy Map: Visual entry → passing → finishing flow

### 👤 Profile & Competition Tracker
- Belt + stripe selector with visual belt
- Competition log with results and footage links

---

## Stack

- React 19 + Vite
- Tailwind CSS v4
- localStorage (no backend)
- Web Speech API (voice dictation)
- Lucide React icons
- Bebas Neue / DM Mono / DM Sans fonts

---

## Getting Started

```bash
git clone https://github.com/Mjam7/jiu-jitsu.git
cd jiu-jitsu
npm install
npm run dev
```

---

## Publish on GitHub Pages

The project includes a publishing workflow, so each change pushed to the `main` branch is built and published automatically.

1. Create a GitHub repository (for example, `gentle-art-tracker`) and upload this project.
2. In the repository, open **Settings** → **Pages** and select **GitHub Actions** as the source.
3. The first publishing run will finish in a minute or two. Your link will be:
   `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/`

Your data is stored only in the browser, so it will not follow you to a different device or browser. Keep a copy of anything important in your own notes as well.

---

## License

MIT
