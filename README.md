Sure! Here is a **cleaned, professionally rewritten, and well-structured README** for your project.
I preserved all your content but improved clarity, formatting, grammar, and flow.

---

# **AI-Assisted Document Authoring & Generation Platform**

A full-stack web application that enables authenticated users to generate, refine, and export structured business documents (**Word .docx** and **PowerPoint .pptx**) using **Google’s Gemini AI**.
Users can create projects, design document structures, generate AI-powered content, refine each section, and export fully formatted files.

---

## 🚀 **Key Features**

### 🔐 **User Authentication**

* Secure JWT-based login/registration
* Password hashing for strong security

### 📁 **Project Management**

* Create, view, edit, and delete projects
* Each project stores structure, content, refinements, and export data

### 📝 **Document Configuration**

* Choose output format: **Word (.docx)** or **PowerPoint (.pptx)**
* Add, remove, or reorder sections/slides
* Optional: AI-powered outline generator for automatic structure suggestions

### 🤖 **AI Content Generation**

* Section-by-section content generation using **Google Gemini**
* Context-aware generation based on project topic
* Smart coherence across the entire document

### ✏️ **Interactive Content Refinement**

* Refine individual sections using custom prompts
  *(e.g., “make it formal”, “convert to bullet points”, “shorten to 100 words”)*
* Like/Dislike feedback system
* Comment system for personal notes

### 📥 **Document Export**

* Export completed documents as:

  * **.docx** (Word)
  * **.pptx** (PowerPoint)
* Fully formatted and ready for use

---

## 🧰 **Tech Stack**

### **Backend**

* FastAPI (Python)
* SQLAlchemy ORM
* SQLite (development)
* Python-JOSE (JWT handling)
* Passlib (password hashing)
* Google Gemini API
* python-docx (Word generation)
* python-pptx (PowerPoint generation)

### **Frontend**

* React 18
* React Router
* Axios
* HTML/CSS

---

## 📂 **Project Structure**

```
OceanAI/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── auth.py
│   ├── projects.py
│   ├── documents.py
│   ├── generation.py
│   ├── refinement.py
│   ├── export.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

---

## 🔧 **Prerequisites**

* **Python 3.8+**
* **Node.js 16+**
* **npm**
* **Google Gemini API Key**

---

## 🛠️ **Installation & Setup**

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd OceanAI
```

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows
pip install -r requirements.txt
```

### 3️⃣ Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

Get a Gemini API Key from:
**[https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)**

### 4️⃣ Database Initialization

The SQLite database is automatically created when the backend first runs.

### 5️⃣ Frontend Setup

```bash
cd frontend
npm install
```

### 6️⃣ Run Application

#### Start Backend:

```bash
cd backend
python main.py
```

Backend runs at: **[http://localhost:8000](http://localhost:8000)**

#### Start Frontend:

```bash
cd frontend
npm start
```

Frontend runs at: **[http://localhost:3000](http://localhost:3000)**

---

## 🖥️ **How to Use**

### 1. Register / Login

* Go to `http://localhost:3000`
* Register a new account or log in

### 2. Create a Project

* Enter title, document type, and main topic
* Choose:

  * **AI-Suggested Outline**, or
  * **Manual structure creation**

### 3. Generate Content

* Open the project
* Click **Generate Content**
* AI generates text for each section/slide

### 4. Refine Content

* Provide custom refinement prompts
* Like/Dislike AI results
* Add comments for personal notes

### 5. Export as Word/PPT

* Click **Export Document**
* Download `.docx` or `.pptx`

---

## 📡 **API Endpoints**

### 🔐 Authentication

| Method | Endpoint             | Description  |
| ------ | -------------------- | ------------ |
| POST   | `/api/auth/register` | Register     |
| POST   | `/api/auth/login`    | Login        |
| GET    | `/api/auth/me`       | Current user |

### 📁 Projects

| Method | Endpoint                       |
| ------ | ------------------------------ |
| GET    | `/api/projects`                |
| POST   | `/api/projects`                |
| GET    | `/api/projects/{id}`           |
| POST   | `/api/projects/{id}/structure` |
| DELETE | `/api/projects/{id}`           |

### 🤖 Generation

| Method | Endpoint                                            |
| ------ | --------------------------------------------------- |
| POST   | `/api/generation/generate`                          |
| POST   | `/api/generation/generate-template?project_id={id}` |

### ✏️ Refinement

| Method | Endpoint                               |
| ------ | -------------------------------------- |
| POST   | `/api/refinement/refine`               |
| POST   | `/api/refinement/feedback`             |
| GET    | `/api/refinement/{project_id}/history` |

### 📥 Export

| Method | Endpoint                            |
| ------ | ----------------------------------- |
| GET    | `/api/export/{project_id}/download` |

---

## 🧩 **Environment Variables**

### Backend `.env`

| Variable         | Description     |
| ---------------- | --------------- |
| `SECRET_KEY`     | JWT signing key |
| `GEMINI_API_KEY` | Gemini API key  |

### Frontend

* Set `REACT_APP_API_URL` for production

---

## 🚀 Deployment

### ⚡ Recommended: Railway

* Deploy backend and frontend separately
* Use PostgreSQL in production

Steps summarized:

1. Push code to GitHub
2. Connect Railway → Deploy backend (`backend` folder)
3. Add PostgreSQL + environment variables
4. Deploy frontend (`frontend` folder)
5. Set `REACT_APP_API_URL=<backend-url>`

Full guide in `DEPLOYMENT.md`.

---

## 🛠️ Troubleshooting

### Backend

* Delete `documents.db` for reset
* Check Gemini API key validity
* Reinstall dependencies if import errors occur

### Frontend

* CORS error → Update FastAPI CORS settings
* API errors → Ensure backend is running
* If build issues:

  ```bash
  rm -rf node_modules
  npm install
  ```

---

## 🌟 Future Enhancements

* User profile settings
* Document versioning
* Collaborative editing
* Template marketplace/library
* Export to PDF/HTML
* Real-time project sharing
* Batch document generation

---

## 📄 License

Educational / Demonstration project.

---

If you'd like, I can also:

✅ Turn this into a **GitHub-optimized README**
✅ Add badges (build, license, tech stack)
✅ Add screenshots or demo GIFs
✅ Provide a **DEPLOYMENT.md** or **API Documentation.md** template

Just tell me!
