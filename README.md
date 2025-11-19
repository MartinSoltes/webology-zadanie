# 📄 Document Management App

A full-stack web application for uploading, managing, downloading, and tagging documents.  
Includes user authentication, multi-tag filtering, autocomplete tagging, and pagination.

---

## 🚀 Tech Stack

### **Frontend**
- React + TypeScript  
- Vite  
- React Query  
- React Router  
- Axios  
- TailwindCSS  
- SCSS  
- JWT authentication  

### **Backend**
- Laravel  
- MySQL  
- tymon/jwt-auth  
- Laravel Storage (public disk)  

---

## 📦 Features

### **Authentication**
- User registration and login  
- JWT-based API authentication  
- Protected API + frontend routes  

### **Documents**
- Uploading files  
- Editing metadata and tags  
- Deleting documents  
- Downloading files via streamed binary  
- React Query caching & refetching  

### **Tags**
- JSON array stored in DB  
- Multiple tags per document  
- Autocomplete tag input  
- Arrow key navigation  
- Enter / Tab / Comma confirmation  
- Auto-add unfinished tag on blur  
- Remove tags with chip UI  
- Backend tag listing endpoint  
- Frontend tag filtering with chips  

### **Documents List**
- Paginated list via Laravel `paginate(10)`  
- Pagination controls on frontend  
- Multi-tag filtering  
- Optional filter persistence  
- React Query state management  

---

## 🗂 API Endpoints

### **Auth**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register user |
| POST | `/api/login` | Login + receive JWT |

### **Documents**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents` | Paginated list + tag filtering |
| POST | `/api/documents` | Upload new document |
| GET | `/api/documents/{id}` | Fetch document |
| PUT | `/api/documents/{id}` | Update name/tags |
| DELETE | `/api/documents/{id}` | Delete document |
| GET | `/api/documents/{id}/download` | Download file |

### **Tags**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/documents-tags` | List unique tags |

---

## 🔧 Installation & Setup

### Backend
```bash
git clone <repo-url>
cd sholty-docs
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan storage:link
php artisan serve
```

### Frontend
```bash
cd sholty-docs-frontend
npm install
echo "VITE_API_URL=http://localhost:8000/api" > .env
npm run dev
```

---
## 🎯 How It Works

### Upload Flow
1. User enters document name + tags
2. Chooses a file
3. FormData is sent to Laravel
4. File stored in /storage/app/public/documents/{userId}
5. Metadata + tags saved to DB
6. React Query auto-refreshes document list

### Download Flow
1. Frontend calls /documents/{id}/download
2. Laravel streams file with correct headers
3. Blob is converted to downloadable file in browser
