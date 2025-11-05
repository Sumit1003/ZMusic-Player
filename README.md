# 🎶 Z Music Player

A sleek, responsive, and full-stack **music streaming web application** built with the **MERN stack (MongoDB, Express, React, Node.js)**.
Z Music Player lets users explore, play, and manage songs effortlessly — offering a Spotify-like experience right in the browser.

---

## 🚀 Live Demo

🔗 **[zify.onrender.com](https://zify.onrender.com)**

---

## 🧠 Features

✅ Modern, responsive UI built with **React + Vite**
✅ Stream music with smooth playback controls (play, pause, next, previous)
✅ Create and manage playlists
✅ Fetch music dynamically from backend APIs
✅ Persistent state using local storage / MongoDB
✅ Real-time song progress and duration updates
✅ Deployed on **Render** with continuous integration

---

## 🏗️ Tech Stack

| Category            | Technologies                                |
| ------------------- | ------------------------------------------- |
| **Frontend**        | React.js (Vite), Tailwind CSS, React Router |
| **Backend**         | Node.js, Express.js                         |
| **Database**        | MongoDB (Mongoose ORM)                      |
| **Deployment**      | Render (Full-stack deployment)              |
| **Version Control** | Git & GitHub                                |

---

## 📂 Folder Structure

```
Z-music-player/
│
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Main pages (Home, Playlist, Player)
│   │   ├── assets/          # Images, icons
│   │   └── App.jsx
│   └── package.json
│
├── server/                  # Backend (Node.js + Express)
│   ├── routes/              # API routes
│   ├── controllers/         # Logic for handling requests
│   ├── models/              # Mongoose schemas
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/<your-username>/z-music-player.git
cd z-music-player
```

### 2️⃣ Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3️⃣ Set up environment variables

Create a `.env` file inside `/server` with the following keys:

```
MONGO_URI=<your-mongodb-connection-string>
PORT=5000
```

### 4️⃣ Run the application

```bash
# Run backend
cd server
npm start

# Run frontend
cd ../client
npm run dev
```

Now open **[http://localhost:5173](http://localhost:5173)** in your browser 🎧

---

## 📸 Screenshots

| Home Page                                  | Player Screen                                  |
| ------------------------------------------ | ---------------------------------------------- |
| ![Home Screenshot](./screenshots/home.png) | ![Player Screenshot](./screenshots/player.png) |

---

## 🧩 API Endpoints

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| GET    | `/api/songs`            | Fetch all songs       |
| GET    | `/api/songs/:id`        | Fetch a specific song |
| POST   | `/api/playlist`         | Create a new playlist |
| GET    | `/api/playlist/:userId` | Fetch user playlists  |

---

## 🧑‍💻 Developer

**Sumit Kumar**
Full Stack MERN Developer
📧 [[your-email@example.com](mailto:your-email@example.com)]
💼 [LinkedIn Profile or Portfolio Link]

---

## 🏁 Deployment

* **Frontend:** Deployed on Render using Vite build.
* **Backend:** Node.js API hosted on Render.
* **Database:** MongoDB Atlas (Cloud-based NoSQL database).

---

## ⭐ Acknowledgements

* Inspired by Spotify UI
* Open-source music data API (if used)
* Deployed with ❤️ using Render

---

## 📜 License

This project is licensed under the **MIT License** – free to use and modify.

---

> Built with passion and React ⚛️ by **Sumit Kumar** ✨
> *“Code your music, play your dream.”*
