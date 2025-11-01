# 🎵 Z Music Player

<div align="center">

![React](https://img.shields.io/badge/React-18.2-%2361DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-%23339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-%2347A248?style=for-the-badge&logo=mongodb)
![Render](https://img.shields.io/badge/Deploy-Render-%2346E3B7?style=for-the-badge&logo=render)

*A modern, feature-rich music streaming experience with beautiful visuals and powerful functionality*

[🚀 Live Demo](#) • [📖 Documentation](#) • [🐛 Report Bug](https://github.com/your-username/z-music-player/issues) • [💡 Request Feature](https://github.com/your-username/z-music-player/issues)

![Z Music Player Preview](https://via.placeholder.com/800x400/6366f1/ffffff?text=Z+Music+Player+Showcase)

</div>

## ✨ Features

### 🎵 Music Experience
| Feature | Description | Status |
|---------|-------------|--------|
| 🎧 **Audio Visualizer** | Real-time waveform & particle effects | ✅ Implemented |
| 📱 **Mini Player** | Compact floating player mode | ✅ Implemented |
| 🎨 **Theme System** | Dark/Light mode with smooth transitions | ✅ Implemented |
| 🎤 **Lyrics Display** | Synchronized lyrics with music | 🚧 In Progress |
| 🔄 **Crossfade** | Smooth transitions between tracks | ✅ Implemented |

### 👤 User Features
| Feature | Description | Status |
|---------|-------------|--------|
| 👤 **User Profiles** | Personalized avatars and stats | ✅ Implemented |
| ⭐ **Premium Badges** | Special indicators for premium users | ✅ Implemented |
| 📊 **Playback Stats** | Listening history and analytics | 🚧 In Progress |
| 💾 **Progress Saving** | Resume from last position | ✅ Implemented |

### ⌨️ Technical Features
| Feature | Description | Status |
|---------|-------------|--------|
| ⌨️ **Keyboard Shortcuts** | Full keyboard navigation | ✅ Implemented |
| 📱 **PWA Support** | Install as mobile app | ✅ Implemented |
| 🌐 **Offline Cache** | Cache recent music locally | 🚧 In Progress |
| 🎛️ **Equalizer** | Audio customization options | 🔜 Planned |

---

## 🚀 Quick Start

### 📋 Prerequisites

Ensure you have the following installed:

```bash
# Required Software
node --version  # v16 or higher
npm --version   # v8 or higher
mongod --version # MongoDB (optional for local dev)
```

**🛠️ Installation**
```bash
# 1. Clone the repository
git clone https://github.com/your-username/z-music-player.git
cd z-music-player

# 2. Install backend dependencies
cd server
npm install

# 3. Install frontend dependencies
cd ../client
npm install
⚙️ Environment Configuration
```
## ⚙️ Environment Configuration
```bash
# Backend Environment (server/.env)
cd server
touch .env
```
```env
# 🗄️ Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/musicdb?retryWrites=true&w=majority

# 🔐 Security
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars

# 🚀 Server Settings
NODE_ENV=development
PORT=5000

# 🌐 CORS & API
CLIENT_URL=http://localhost:3000
API_VERSION=v1
```
```bash
# Frontend Environment (client/.env)
cd client
touch .env
```

```env
# 🔗 API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_APP_NAME="Z Music Player"

# 🎨 UI Settings
REACT_APP_DEFAULT_THEME=dark
REACT_APP_ENABLE_PWA=true
```

## 🎯 Development Startup
```bash
# Terminal 1 - Start Backend Server
cd server
npm run dev

# Terminal 2 - Start Frontend Development Server
cd client
npm start
```
**🌐 Access the application: http://localhost:3000**

## 🏗️ Project Architecture
```text
z-music-player/
├── 🗂️ client/                 # React Frontend
│   ├── 📁 public/            # Static assets & PWA files
│   ├── 📁 src/
│   │   ├── 🧩 components/    # Reusable UI components
│   │   ├── 🎮 hooks/         # Custom React hooks
│   │   ├── 🗃️ contexts/      # State management
│   │   ├── 📄 pages/         # Route components
│   │   ├── 🛣️ routes/        # Routing configuration
│   │   ├── 🎨 styles/        # CSS & theme files
│   │   └── 🔧 utils/         # Helper functions
│   └── 📦 package.json
├── 🗂️ server/                 # Node.js Backend
│   ├── 🎮 controllers/       # Business logic
│   ├── 🗃️ models/           # MongoDB schemas
│   ├── 🛣️ routes/           # API endpoints
│   ├── 🛡️ middleware/       # Authentication & validation
│   ├── ⚙️ config/           # Database & app configuration
│   ├── 📁 public/           # Static files (songs, images)
│   │   ├── 🎵 songs/        # Music files (.mp3, .wav)
│   │   └── 🖼️ assets/       # Images, covers, avatars
│   └── 🚀 server.js         # Application entry point
└── 📄 README.md
```

## 🎮 Usage Guide
## 🎵 Basic Music Controls
|Action|Keyboard Shortcut|Mouse/Touch
|----|----|-------------|
|Play/Pause |Space or K | Click play button
|Next Track |	L  or →	Swipe left / Click next
|Previous Track	|J or ←	Swipe right / Click previous
|Volume Up |↑	Drag volume slider
|Volume Down |	↓	Drag volume slider
|Mute	M	|Click volume icon
|Like Song	| F	Click heart icon

## 🎨 Theme Customization
```javascript
// Available theme options
const themes = {
  dark: { primary: '#8B5CF6', background: '#0F0F0F' },
  light: { primary: '#7C3AED', background: '#FFFFFF' },
  premium: { primary: '#F59E0B', background: '#1E1B2E' }
};
```

## 📱 Mobile Gestures
|Gesture |Action
|------|-
|👆 Tap	|Play/Pause
|👆 Double Tap	|Like/Unlike
|➡️ Swipe Right	|Previous Track
|⬅️ Swipe Left	|Next Track
|⬇️ Swipe Down	|Close player
|⬆️ Swipe Up	|Expand player

## 🔌 API Reference
## 🎵 Songs Endpoints
```http
GET    /api/songs           # Get all songs
POST   /api/songs           # Upload new song (Admin)
GET    /api/songs/:id       # Get song by ID
PUT    /api/songs/:id       # Update song metadata
DELETE /api/songs/:id       # Delete song
GET    /api/songs/search?q= # Search songs
```

## 📁 Playlists Endpoints
```http
GET    /api/playlists              # Get user playlists
POST   /api/playlists              # Create new playlist
GET    /api/playlists/:id          # Get playlist details
PUT    /api/playlists/:id          # Update playlist
DELETE /api/playlists/:id          # Delete playlist
POST   /api/playlists/:id/songs    # Add song to playlist
```

## 👤 User Endpoints
```http
GET    /api/users/profile         # Get user profile
PUT    /api/users/profile         # Update profile
GET    /api/users/favorites       # Get favorite songs
POST   /api/users/favorites/:id   # Toggle favorite
GET    /api/users/history         # Get listening history
```

## 🚀 Deployment
## 📦 Production Build
```bash
# Build frontend for production
cd client
npm run build

# The build folder is ready for deployment
# Contains optimized, minified files
``` 

## ☁️ Deploy to Render
**Backend Service (Web Service)**
```yaml
# render.yaml configuration
service: web
name: z-music-backend
rootDirectory: server
buildCommand: npm install
startCommand: npm start
envVars:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: your-mongodb-atlas-uri
Frontend Service (Static Site)
yaml
service: static
name: z-music-frontend
rootDirectory: client
buildCommand: npm install && npm run build
publishDirectory: client/build
envVars:
  - key: REACT_APP_API_URL
    value: https://z-music-backend.onrender.com
```

## 🔧 Environment Variables for Production
```env
# Backend Production .env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/musicdb
JWT_SECRET=your-production-jwt-secret
PORT=10000
CLIENT_URL=https://your-frontend.onrender.com

# Frontend Production .env
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_ENABLE_PWA=true
GENERATE_SOURCEMAP=false
```

## 🛠️ Development
### 📝 Available Scripts
```bash
# 🎯 Frontend Scripts
npm start              # Start development server
npm run build          # Create production build
npm test               # Run test suite
npm run eject          # Eject from Create React App
npm run lint           # Run ESLint
npm run format         # Format code with Prettier

# 🔧 Backend Scripts  
npm run dev            # Start with nodemon (development)
npm start              # Start production server
npm run test           # Run backend tests
npm run lint           # Lint backend code
```

## 🧪 Testing
```bash
# Run frontend tests
cd client
npm test

# Run backend tests
cd server
npm test

# Run full test suite
npm run test:all
```

## 🔍 Debugging
```bash
# Frontend debugging
npm run start:debug    # Start with debug mode

# Backend debugging
npm run dev:debug      # Start backend with inspector
``` 

## 🤝 Contributing
**We love your input! Want to contribute? Here's how:**

## 📋 Contribution Workflow
```bash
# 1. Fork the repository
git fork https://github.com/your-username/z-music-player.git

# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make your changes and commit
git add .
git commit -m "feat: add amazing feature"

# 4. Push to branch
git push origin feature/amazing-feature

# 5. Open Pull Request
```

## 🎯 Commit Message Convention
```bash
feat: add new visualizer component     # New feature
fix: resolve audio playback issue      # Bug fix
docs: update API documentation         # Documentation
style: format code with prettier       # Code style
refactor: improve player performance   # Code refactoring
test: add player component tests       # Testing
```

## 🐛 Reporting Issues
**When reporting bugs, please include:**

```markdown
## Bug Report Template

**Description**: Brief bug description
**Steps to Reproduce**: 
1. Step one
2. Step two
3. See error

**Expected Behavior**: What should happen
**Actual Behavior**: What actually happens
**Environment**:
- OS: [e.g. Windows, macOS]
- Browser: [e.g. Chrome, Safari]
- Version: [e.g. 1.0.0]

**Screenshots**: If applicable
```

## 📄 License
### This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments
>**React Team** - Amazing frontend framework

>**MongoDB Atlas** - Reliable database hosting

>**Render** - Seamless deployment platform

>**Framer Motion** - Beautiful animations

>**Lucide Icons** - Consistent iconography

<div align="center">
📞 Support
Need help?

📧 Email: support@zmusic.com

💬 Discord: Join our community

🐛 Issues: GitHub Issues

Made with ❤️ and 🎵 by the Z Music Team

⬆ Back to Top

</div> ```
