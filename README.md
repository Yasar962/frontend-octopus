# OCTOPUS

A modern web application for analyzing GitHub repositories, categorizing issues, and generating AI-powered solutions. Built with React, TypeScript, and Vite.

## 🌐 Live Demo

**Deployed on Vercel:** [https://octor-frontend.vercel.app/](https://octor-frontend.vercel.app/)

## ✨ Features

- **GitHub OAuth Authentication** - Secure login with GitHub using OAuth 2.0
- **Repository Analysis** - Analyze any GitHub repository by URL or select from your repositories
- **Intelligent Issue Classification** - Automatically categorizes issues by difficulty:
  - Beginner
  - Moderate
  - Professional
- **AI-Powered Solutions** - Get step-by-step AI-generated solutions for each issue
- **Real-time Progress Updates** - WebSocket integration for live analysis progress
- **Issue Management** - View, filter, and manage repository issues with markdown rendering
- **Image Support** - View and preview images attached to issues
- **Feedback System** - Submit feedback on solution steps that fail

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **React Markdown** - Markdown rendering for issue bodies
- **WebSocket** - Real-time communication
- **ESLint** - Code linting

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A backend API server (see environment variables)

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend-octopus
```

2. Install dependencies:
```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://your-api-server.com
```

**Note:** The API base URL should point to your backend server that handles:
- GitHub OAuth authentication (`/auth/github`)
- Repository analysis (`/analyze`)
- Issue fetching (`/issues`)
- Solution generation (`/solutions`)
- WebSocket connections (`/ws/progress/:repoId`)

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

### Build

Build for production:

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run ESLint to check for code issues:

```bash
npm run lint
```

## 📁 Project Structure

```
frontend-octopus/
├── public/              # Static assets
├── src/
│   ├── components/      # CSS files for components
│   ├── pages/          # Page components
│   │   ├── landing.tsx # Landing/login page
│   │   ├── dashboard.tsx # Main dashboard
│   │   └── login.tsx   # Login wrapper
│   ├── api.ts          # API utilities
│   ├── auth.ts         # Authentication utilities
│   ├── App.tsx         # Main app component with routing
│   └── main.tsx        # Entry point
├── dist/               # Production build output
├── scripts/            # Utility scripts
├── vercel.json         # Vercel deployment configuration
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies and scripts
```

## 🔐 Authentication Flow

1. User clicks "Continue with GitHub" on the landing page
2. Redirects to backend OAuth endpoint (`/auth/github`)
3. Backend handles GitHub OAuth flow
4. User is redirected back with a token
5. Token is stored in `sessionStorage` as `github_token`
6. User is redirected to the dashboard

## 🎯 Usage

1. **Login**: Click "Continue with GitHub" to authenticate
2. **Add Repository**: 
   - Paste a GitHub repository URL, or
   - Select from your GitHub repositories dropdown
   - Click "Analyze Repository"
3. **View Issues**: 
   - Select a repository from the left panel
   - Filter issues by difficulty (Beginner, Moderate, Professional, or All)
   - Click on an issue to view details
4. **Get Solutions**: 
   - Click on an issue to see AI-generated step-by-step solutions
   - Each solution includes file paths, actions, and verification steps
5. **Provide Feedback**: 
   - If a solution step fails, click "❌ This step failed"
   - Submit error details to improve solutions

## 🚢 Deployment

The application is configured for Vercel deployment with:

- **SPA Routing**: All routes are rewritten to `/` for client-side routing
- **Environment Variables**: Set `VITE_API_BASE_URL` in Vercel dashboard

### Deploy to Vercel

1. Connect your repository to Vercel
2. Set the environment variable `VITE_API_BASE_URL`
3. Deploy!

The `vercel.json` file handles routing configuration automatically.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ using React, TypeScript, and Vite**
