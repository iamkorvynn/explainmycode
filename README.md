# ExplainMyCode

A full-stack coding workspace platform with AI-powered code explanations, real-time execution, and intelligent analysis. Built with TypeScript/React frontend and Python/FastAPI backend.

## 🌟 Features

- **Authentication & User Management**
  - JWT-based authentication with signup, login, and OAuth (Google, GitHub)
  - Password reset flow with email verification
  - Persistent user accounts with profile management

- **Coding Workspace**
  - Multi-file workspace editor with syntax highlighting
  - Real-time code editing with Monaco Editor
  - Persistent workspace storage with version control
  - File tree navigation and organization

- **Code Execution**
  - Multi-language code execution (Python, JavaScript, TypeScript, Java, C++, Go, and more)
  - Multiple execution backends: Judge0, Compiler.io, OneCompiler
  - Live output and error handling
  - Execution time and resource tracking

- **AI-Powered Analysis**
  - Code explanations and documentation generation
  - Bug detection and suggestions
  - Performance analysis and optimization recommendations
  - Mentor chat for interactive code discussions
  - Comment generation and code summarization

- **Dashboard & Analytics**
  - Code execution analytics and performance metrics
  - Workspace statistics and insights
  - Algorithm visualization and trace analysis
  - Progress tracking

## 🏗️ Architecture

```
explainmycode/
├── frontend/          # React + TypeScript (63.2%)
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── backend/           # Python + FastAPI (35.4%)
│   ├── app/
│   ├── requirements.txt
│   ├── .env.example
│   └── alembic/
├── docker-compose.yml
└── render.yaml
```

**Stack:**
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI, React Router
- **Backend**: FastAPI, SQLAlchemy, Alembic (migrations), Pydantic
- **Database**: SQLite (dev), PostgreSQL (production)
- **Auth**: JWT with refresh tokens, OAuth 2.0
- **AI**: Groq API, Claude API
- **Deployment**: Docker, Railway, Render, Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- pnpm or npm

### Local Development

1. **Install dependencies:**
```bash
npm install
python -m pip install -r backend/requirements.txt
```

2. **Setup environment files:**
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

3. **Start the full stack:**
```bash
npm run dev
```

This starts:
- **Frontend**: http://127.0.0.1:5173
- **Backend API**: http://127.0.0.1:8000
- **API Docs**: http://127.0.0.1:8000/docs

### Demo Credentials
- **Username**: `demo`
- **Password**: `demo12345`

## 📚 Available Scripts

### Frontend
```bash
npm run dev:frontend    # Start Vite dev server (port 5173)
npm run build           # Build for production
```

### Backend
```bash
npm run dev:backend     # Start FastAPI server with auto-migrations (port 8000)
npm run test:backend    # Run pytest suite
```

### Full Stack
```bash
npm run dev             # Run frontend and backend concurrently
npm run docker:up       # Build and run production Docker stack
npm run docker:down     # Stop Docker stack
```

## 🐳 Docker Deployment

Production deployment using Docker Compose:

```bash
# Setup production env files
cp .env.production.example .env.production
cp backend/.env.production.example backend/.env.production

# Edit with your production values
# Then deploy:
npm run docker:up
```

Services:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8080/docs (proxied)

## 🌐 Production Deployment

### Recommended Architecture
- **Frontend**: Vercel
- **Backend API**: Render
- **Database**: Render PostgreSQL
- **Cache/Rate Limiting**: Render Key Value

### Environment Configuration

**Backend Environment Variables:**
```
ENVIRONMENT=production
DATABASE_URL=postgres://...
SECRET_KEY=<generate-secure-key>
LLM_MODE=live              # Must be 'live' in production
GROQ_API_KEY=<your-key>
CLAUDE_API_KEY=<your-key>
GOOGLE_CLIENT_ID=<your-id>
GOOGLE_CLIENT_SECRET=<your-secret>
GITHUB_CLIENT_ID=<your-id>
GITHUB_CLIENT_SECRET=<your-secret>
JUDGE0_BASE_URL=<judge0-url>
JUDGE0_API_KEY=<judge0-key>
BACKEND_BASE_URL=https://your-api-domain.com
FRONTEND_BASE_URL=https://your-frontend-domain.com
```

**Vercel Configuration:**
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://your-backend-domain.com/api/v1`

### Deployment Guides
- See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment checklist and third-party service setup
- See [RAILWAY_SUPABASE_DEPLOYMENT.md](RAILWAY_SUPABASE_DEPLOYMENT.md) for Railway + Supabase hosted path

## ⚙️ OAuth Setup

Google and GitHub OAuth are supported. Set these environment variables to enable:

```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
BACKEND_BASE_URL=https://your-backend-url
FRONTEND_BASE_URL=https://your-frontend-url
```

Detailed provider setup in [DEPLOYMENT.md](DEPLOYMENT.md).

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests -q
```

### CI/CD
GitHub Actions runs on every commit:
- Frontend build verification
- Backend test suite
- Type checking

See [.github/workflows/ci.yml](.github/workflows/ci.yml) for details.

## 📖 API Documentation

Interactive API docs available at:
- **Development**: http://localhost:8000/docs
- **Production**: `https://your-backend-domain.com/docs`

### Key Endpoints

**Authentication:**
- `POST /api/v1/auth/signup` - Create new account
- `POST /api/v1/auth/login` - Login with credentials
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout

**Workspaces:**
- `GET /api/v1/workspaces` - List user workspaces
- `POST /api/v1/workspaces` - Create workspace
- `GET /api/v1/workspaces/{id}` - Get workspace details
- `PUT /api/v1/workspaces/{id}` - Update workspace

**Code Execution:**
- `POST /api/v1/execute` - Execute code
- `GET /api/v1/execute/{id}` - Get execution result

**AI Analysis:**
- `POST /api/v1/ai/explain` - Get code explanation
- `POST /api/v1/ai/bugs` - Detect bugs in code
- `POST /api/v1/ai/chat` - Chat with AI mentor
- `POST /api/v1/ai/summary` - Generate code summary

## 🛠️ Development

### Project Structure

**Frontend** (`src/`):
- `components/` - Reusable UI components (Radix UI based)
- `pages/` - Page components (IDE, Dashboard, Analysis)
- `hooks/` - Custom React hooks
- `services/` - API client and business logic
- `styles/` - Tailwind CSS configuration

**Backend** (`backend/app/`):
- `models/` - SQLAlchemy database models
- `schemas/` - Pydantic request/response schemas
- `routes/` - API endpoint definitions
- `services/` - Business logic (auth, execution, AI)
- `crud/` - Database operations
- `core/` - Configuration and utilities
- `tests/` - Test suite

### Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test:backend` and `npm run build`
4. Submit a pull request

## 📋 Important Notes

- **Production Only**: Production deployments enforce live AI and execution providers (no mocking)
- **Email Setup**: Password reset requires valid SMTP configuration
- **Security**: Keep `SECRET_KEY` secure and unique per environment
- **Database**: Migrations run automatically on backend startup

## 📄 License

See LICENSE file for details.

## 🤝 Support

For issues, questions, or feature requests, please open a GitHub issue or check the deployment guides.
