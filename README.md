# Zhyanawa AI

Your mental health matters. Zhyanawa AI is here for you — day or night. Chat privately with our AI therapist in your own language (Kurdish, Arabic, English). Find real doctors near you in Sulaymaniyah, explore self-care tools, and reach emergency help instantly. Healing minds. Empowering lives. 💚

## Run the downloaded project

Install Node.js 20 or newer, then run:

```sh
npm start
```

Open <http://127.0.0.1:3000>. The local server serves the website and forwards `/api` requests to the official Zhyanawa site over HTTPS. There are no local AI models, router installations, VPS credentials, or database files in this repository. No package installation is needed.

The official site processes account and chat data. The connection from this local server to the official site uses HTTPS. The browser-to-server connection stays on your own computer. This repository does not control how the production VPS stores data.
