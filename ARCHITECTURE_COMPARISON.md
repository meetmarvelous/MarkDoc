# MarkDocx: Old vs New Architecture Comparison

This document compares the original PHP/MySQL version with the new static web application.

---

## 🔄 Key Similarities

| Feature             | Both Versions                                    |
| ------------------- | ------------------------------------------------ |
| **Markdown Editor** | Live split-pane editor with syntax highlighting  |
| **Live Preview**    | Real-time markdown rendering as you type         |
| **DOCX Export**     | Download professionally formatted Word documents |
| **View Modes**      | Split, Editor-only, and Preview-only layouts     |
| **File Upload**     | Import `.md` and `.txt` files                    |
| **Clipboard Paste** | Paste content directly into editor               |
| **Modern UI**       | Clean design with Inter font, responsive layout  |
| **Footer Links**    | About, Privacy, Terms pages                      |

---

## ⚡ Key Differences

| Aspect               | Old (PHP)                              | New (Static)                      |
| -------------------- | -------------------------------------- | --------------------------------- |
| **Backend**          | PHP 8.0+ with routing                  | None (pure frontend)              |
| **Database**         | MySQL required                         | None (localStorage)               |
| **Dependencies**     | Composer (PHPWord, CommonMark, Dotenv) | CDN libraries only                |
| **Authentication**   | User login/register system             | Not needed                        |
| **Document Storage** | Cloud storage in MySQL                 | Browser localStorage              |
| **DOCX Generation**  | Server-side (PHPWord)                  | Client-side (docx.js)             |
| **Deployment**       | Apache/XAMPP/PHP host                  | Any static host (Vercel, Netlify) |
| **Setup Complexity** | Database setup, composer install       | Zero setup                        |
| **Offline Usage**    | ❌ Requires server                     | ✅ Works offline                  |
| **Privacy**          | Data sent to server                    | Data stays local                  |

---

## 📁 File Structure Comparison

### Old Structure (PHP)

```
markdocx/
├── public/           # Entry point & assets
│   ├── index.php     # Router
│   ├── css/
│   └── js/
├── src/              # PHP backend
│   ├── Auth.php
│   ├── Database.php
│   ├── Document.php
│   ├── Export.php
│   └── MarkdownToDocx.php
├── views/            # PHP templates
│   ├── layout.php
│   ├── home.php
│   ├── editor.php
│   ├── login.php
│   └── register.php
├── vendor/           # Composer packages
├── config.php
├── composer.json
└── .env
```

### New Structure (Static)

```
markdocx/
├── index.html        # Main editor
├── about.html
├── privacy.html
├── terms.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── vercel.json
└── README.md
```

---

## 🚀 Why We Changed

1. **Simpler Deployment** — No PHP/MySQL setup, deploy to Vercel in seconds
2. **Better Privacy** — Documents never leave the user's browser
3. **Offline Support** — Works without internet after initial load
4. **Lower Costs** — Free static hosting vs paid PHP hosting
5. **Faster Performance** — No server round-trips for document operations

---

## ⚠️ Trade-offs

| Lost Feature           | Workaround                         |
| ---------------------- | ---------------------------------- |
| Multi-device sync      | Export/import files manually       |
| User accounts          | Not needed for single-user use     |
| Server-side processing | All processing happens client-side |
| URL import             | Removed (CORS restrictions)        |

---

_Document created: January 7, 2026_
