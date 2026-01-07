# MarkDocx AI

A modern Markdown editor that exports to high-quality DOCX files. Runs entirely in your browser — no server required.

![MarkDocx Editor](https://via.placeholder.com/800x450/2563eb/ffffff?text=MarkDocx+AI)

## ✨ Features

- **Live Markdown Preview** — See your formatted document as you type
- **DOCX Export** — Download professional Word documents with one click
- **Works Offline** — Everything runs in your browser, no server needed
- **Auto-Save** — Your work is automatically saved to your browser
- **View Modes** — Split, Editor-only, or Preview-only layouts
- **File Upload** — Import existing `.md` or `.txt` files
- **Clipboard Paste** — Paste content directly from your clipboard

## 🚀 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/markdocx)

### Manual Deployment

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" → Import your repository
4. **Framework Preset**: Select "Other"
5. **Root Directory**: Leave as default (`.`)
6. Click "Deploy"

That's it! Your app will be live in seconds.

## 💻 Local Development

Since this is a static site, you can use any static file server:

### Using VS Code Live Server

1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `index.html` → "Open with Live Server"

### Using Python

```bash
python -m http.server 8000
```

### Using Node.js

```bash
npx serve .
```

Then open `http://localhost:8000` in your browser.

## 📁 Project Structure

```
markdocx/
├── index.html      # Main editor page
├── about.html      # About page
├── privacy.html    # Privacy policy
├── terms.html      # Terms of service
├── css/
│   └── style.css   # Styles
├── js/
│   └── app.js      # Application logic
├── vercel.json     # Vercel configuration
└── README.md       # This file
```

## 🛠️ Technology Stack

- **Markdown Parsing**: [marked.js](https://marked.js.org/)
- **DOCX Generation**: [docx](https://docx.js.org/)
- **File Downloads**: [FileSaver.js](https://github.com/eligrey/FileSaver.js/)
- **Fonts**: [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts

## 📝 License

MIT License — feel free to use this project for personal or commercial purposes.

---

Made with ❤️ by [Your Name](https://github.com/yourusername)
