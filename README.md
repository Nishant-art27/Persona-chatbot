# PersonaChat — Persona-Based AI Chatbot

A premium AI chatbot that lets you have real conversations with three Scaler Academy / InterviewBit personalities: **Anshuman Singh**, **Abhimanyu Saxena**, and **Kshitij Mishra**.

Built with Vite + Vanilla JS + Gemini 2.0 Flash API.

![PersonaChat Screenshot](https://img.shields.io/badge/status-live-brightgreen)

---

## ✨ Features

- 🎭 **3 Distinct Personas** — Each with deeply researched system prompts, few-shot examples, and unique communication styles
- 🔄 **Persona Switcher** — Switch between personas with a single click; conversation resets automatically
- 💬 **Suggestion Chips** — Quick-start questions tailored to each persona
- ⏳ **Typing Indicator** — Animated dots while the AI is generating a response
- 🌙 **Premium Dark Theme** — Glassmorphism UI with persona-specific accent colors
- 📱 **Fully Responsive** — Works on mobile and desktop
- 🔒 **Secure** — API key stored server-side, never exposed to the client

---

## 🚀 Live Demo

🔗 **[View Live App](https://persona-chatbot-eosin.vercel.app/)**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML + Vanilla JS + CSS |
| Build Tool | Vite |
| Backend | Vercel Serverless Functions |
| LLM | Google Gemini 2.0 Flash |
| Styling | Vanilla CSS (glassmorphism dark theme) |
| Font | Inter (Google Fonts) |

---

## 📦 Setup & Installation

### Prerequisites
- Node.js 18+ installed
- A Google Gemini API key ([Get one free](https://aistudio.google.com/apikey))

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Persona-chatbot.git
   cd Persona-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key
   ```

4. **Run the development server**
   Open **two terminals**:
   ```bash
   # Terminal 1 — Vite frontend
   npm run dev

   # Terminal 2 — API server
   npm run dev:api
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

---

## 📁 Project Structure

```
Persona-chatbot/
├── api/
│   └── chat.js          # Vercel serverless function
├── src/
│   ├── main.js          # Frontend application logic
│   ├── prompts.js       # System prompts for all 3 personas
│   └── style.css        # Premium dark theme styles
├── index.html           # Main HTML
├── dev-server.js        # Local API server for development
├── vite.config.js       # Vite configuration
├── vercel.json          # Vercel deployment config
├── .env.example         # Environment variable template
├── prompts.md           # Annotated system prompts
├── reflection.md        # Project reflection
└── README.md            # This file
```

---

## 🚢 Deployment (Vercel)

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add `GEMINI_API_KEY` in Vercel Environment Variables
4. Deploy — the `api/chat.js` function deploys automatically as a serverless function

---

## 📝 Documentation

- **[prompts.md](./prompts.md)** — All three system prompts with detailed annotations
- **[reflection.md](./reflection.md)** — 300-500 word project reflection

---

## 📄 License

This project was built as an assignment for the Prompt Engineering course at Scaler Academy.
