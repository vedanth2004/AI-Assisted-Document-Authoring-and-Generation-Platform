# AI-Assisted Document Authoring and Generation Platform

A full-stack web application that allows authenticated users to generate, refine, and export structured business documents (Word .docx and PowerPoint .pptx) using AI-powered content generation via Google's Gemini API.

## Features

- **User Authentication**: Secure JWT-based authentication with user registration and login
- **Project Management**: Create, view, and manage multiple document projects
- **Document Configuration**: 
  - Choose between Word (.docx) or PowerPoint (.pptx) formats
  - Define custom document structure (sections for Word, slides for PowerPoint)
  - AI-suggested template generation (bonus feature)
- **AI-Powered Content Generation**: 
  - Generate content section-by-section using Google Gemini API
  - Context-aware generation based on project topic
- **Interactive Refinement**: 
  - Refine individual sections with custom prompts
  - Like/Dislike feedback system
  - Comment system for notes
- **Document Export**: Download completed documents in .docx or .pptx format

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Lightweight database
- **Python-JOSE** - JWT token handling
- **Passlib** - Password hashing
- **Google Generative AI** - Gemini API integration
- **python-docx** - Word document generation
- **python-pptx** - PowerPoint document generation

### Frontend
- **React 18** - Modern React framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **HTML/CSS** - Responsive styling

## Project Structure

```
OceanAI/
├── backend/
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database models and setup
│   ├── auth.py              # Authentication routes and logic
│   ├── projects.py          # Project management endpoints
│   ├── documents.py         # Document-related endpoints
│   ├── generation.py        # AI content generation
│   ├── refinement.py        # Content refinement and feedback
│   ├── export.py            # Document export functionality
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ProjectCreate.js
│   │   │   └── ProjectDetail.js
│   │   ├── contexts/        # React context providers
│   │   │   └── AuthContext.js
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Prerequisites

- **Python 3.8+** - Backend runtime
- **Node.js 16+** and **npm** - Frontend build tools
- **Google Gemini API Key** - For AI content generation

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd OceanAI
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
SECRET_KEY=your-secret-key-change-in-production-use-a-random-string
GEMINI_API_KEY=your-gemini-api-key-here
```

**Getting a Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env` file

### 4. Initialize Database

The database will be automatically created when you start the backend server for the first time. The SQLite database file (`documents.db`) will be created in the `backend` directory.

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 6. Run the Application

#### Start Backend Server

```bash
cd backend

# Make sure virtual environment is activated
python main.py
```

The backend will run on `http://localhost:8000`

#### Start Frontend Development Server

In a new terminal:

```bash
cd frontend

npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## Usage

### 1. Registration & Login

1. Navigate to the application (http://localhost:3000)
2. Click "Register here" to create a new account
3. Fill in your email, username, and password
4. After registration, you'll be automatically logged in

### 2. Create a Project

1. From the Dashboard, click "Create New Project"
2. Enter a project title (optional)
3. Select document type (Word or PowerPoint)
4. Enter the main topic for your document
5. **Option 1**: Click "AI-Suggest Outline" to let AI generate the structure
   - AI will create sections (Word) or slide titles (PowerPoint) based on your topic
   - You can edit, add, or remove items from the generated structure
6. **Option 2**: Manually create the structure
   - Click "Add Section/Slide" to add items
   - Reorder using ↑/↓ buttons
   - Remove items with the "Remove" button
7. Click "Create Project"

### 3. Generate Content

1. Open your project from the Dashboard
2. Click "Generate Content" button
3. Wait for AI to generate content for all sections/slides
4. Content will appear section by section

### 4. Refine Content

For each section/slide:

1. **Refine with AI**: 
   - Enter a refinement prompt (e.g., "Make this more formal", "Convert to bullet points", "Shorten to 100 words")
   - Click "Refine" button
   - The section will be updated with refined content

2. **Provide Feedback**:
   - Click "👍 Like" or "👎 Dislike" to record satisfaction

3. **Add Comments**:
   - Enter notes or comments in the comment box
   - Comments are saved when you click Like/Dislike

### 5. Export Document

1. Once content is generated and refined:
2. Scroll to the "Export Document" section
3. Click "📥 Export DOCX/PPTX" button
4. The document will download to your computer

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Projects
- `GET /api/projects` - Get all user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects/{id}/structure` - Save document structure
- `DELETE /api/projects/{id}` - Delete project

### Generation
- `POST /api/generation/generate` - Generate content for project
- `POST /api/generation/generate-template?project_id={id}` - Generate AI-suggested structure

### Refinement
- `POST /api/refinement/refine` - Refine section content
- `POST /api/refinement/feedback` - Submit feedback
- `GET /api/refinement/{project_id}/history` - Get refinement history

### Export
- `GET /api/export/{project_id}/download` - Download document

## Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | Secret key for JWT token signing | Yes |
| `GEMINI_API_KEY` | Google Gemini API key for AI generation | Yes |

### Frontend

The frontend uses a proxy configured in `package.json` to forward requests to `http://localhost:8000`. For production, set `REACT_APP_API_URL` environment variable.

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Quick Deployment Options

**Recommended: Railway (Easiest)**
- Deploy both backend and frontend
- Automatic PostgreSQL database
- Free tier available
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for full guide

**Alternative Options:**
- **Frontend**: Vercel (optimized for React)
- **Backend**: Render or Railway
- **Database**: PostgreSQL (via hosting platform)

### Quick Start - Railway

1. Push code to GitHub
2. Create Railway account at [railway.app](https://railway.app)
3. Deploy backend:
   - New Project → Deploy from GitHub
   - Root: `backend`
   - Add PostgreSQL database
   - Set env vars: `SECRET_KEY`, `GEMINI_API_KEY`, `DATABASE_URL`
4. Deploy frontend:
   - Add service to same project
   - Root: `frontend`
   - Build: `npm install && npm run build`
   - Start: `npx serve -s build -l $PORT`
   - Set: `REACT_APP_API_URL=<backend-url>`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

## Troubleshooting

### Backend Issues

- **Database errors**: Delete `documents.db` and restart the server to recreate the database
- **Gemini API errors**: Verify your API key is correct and has sufficient quota
- **Import errors**: Make sure all dependencies are installed: `pip install -r requirements.txt`

### Frontend Issues

- **CORS errors**: Ensure backend CORS middleware allows your frontend origin
- **API connection errors**: Verify backend is running on port 8000
- **Build errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Code Quality

- **Backend**: Follows FastAPI best practices with proper separation of concerns
- **Frontend**: Component-based React architecture with context for state management
- **Database**: SQLAlchemy ORM with proper relationships and cascading deletes
- **Security**: Password hashing, JWT authentication, input validation

## Future Enhancements

- User profiles and settings
- Collaborative editing
- Version history for refinements
- Template library
- Advanced export options (PDF, HTML)
- Batch generation for multiple projects
- Real-time collaboration

## License

This project is created for educational/demonstration purposes.

## Support

For issues or questions, please create an issue in the repository or contact the development team.

#   A I - A s s i s t e d - D o c u m e n t - A u t h o r i n g - a n d - G e n e r a t i o n - P l a t f o r m  
 