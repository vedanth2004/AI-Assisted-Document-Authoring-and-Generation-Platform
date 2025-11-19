# Quick Setup Guide

## Prerequisites
- Python 3.8+
- Node.js 16+ and npm
- Google Gemini API Key

## Setup Steps

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# OR
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# OR
cp .env.example .env  # macOS/Linux

# Edit .env and add:
# SECRET_KEY=your-random-secret-key
# GEMINI_API_KEY=your-gemini-api-key

# Start backend server
python main.py
```

Backend will run on http://localhost:8000

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start frontend server
npm start
```

Frontend will run on http://localhost:3000

## Getting Gemini API Key

1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key to your `.env` file

## Usage

1. Open http://localhost:3000 in browser
2. Register a new account
3. Create a project
4. Generate content
5. Refine and export

For detailed documentation, see README.md

