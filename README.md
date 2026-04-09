# Support Management System

A full-stack Support Management System with multi-department workflow routing, role-based access control, and approval workflows built with React and Node.js.

---

## Features

### Multi-Department Support
- **IT Department**: Handles all approved tickets and direct IT requests
- **Underwriting Department**: Reviews and approves underwriting-related tickets
- **MIS Department**: Reviews and approves MIS-related tickets

### Workflow Routing
1. **Direct IT Request** → Ticket goes directly to IT
2. **Underwriting Request** → Underwriting approves/rejects → If approved, forwards to IT
3. **MIS Request** → MIS approves/rejects → If approved, forwards to IT

### User Roles
| Role | Description |
|------|-------------|
| Admin | IT Admin - Full system access, user management |
| User | Regular user - Create tickets, view own tickets |
| Underwriting | Officer - Approve/reject underwriting tickets |
| MIS | Officer - Approve/reject MIS tickets |

### Ticket Status Flow
`Open` → `Pending` → `Approved` → `Open (in IT)` → `Closed`
            ↓
         `Rejected` → `Closed`

---

## Tech Stack

### Frontend
- React 18 (Vite)
- React Router v6
- Axios for HTTP requests
- Tailwind CSS for styling
- date-fns for date formatting

### Backend
- Node.js + Express.js
- JWT Authentication
- Zod Validation
- Multer (file uploads)
- Cloudinary (file storage)

### Database
- MySQL

---

## Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm or yarn

---

## Project Structure

```
support_system/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── database.js
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── BrandBarController.js
│   │   ├── ContactController.js
│   │   ├── DashboardController.js
│   │   ├── LookupController.js
│   │   ├── NoticeController.js
│   │   ├── TicketController.js
│   │   ├── UserController.js
│   │   └── ActivityLogController.js
│   │   ├── MessageController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── ipMiddleware.js
│   │   ├── role.js
│   │   ├── upload.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── activityLogs.js
│   │   ├── auth.js
│   │   ├── brandbar.js
│   │   ├── contacts.js
│   │   ├── dashboard.js
│   │   ├── knowledgeBase.js
│   │   ├── lookups.js
│   │   ├── messages.js
│   │   ├── notices.js
│   │   ├── tickets.js
│   │   ├── twoFactor.js
│   │   └── users.js
│   ├── services/
│   │   ├── ActivityLogService.js
│   │   ├── AttachmentService.js
│   │   ├── AuthService.js
│   │   ├── BrandBarService.js
│   │   ├── MessageService.js
│   │   ├── NoticeService.js
│   │   ├── TicketService.js
│   │   ├── TypingService.js
│   │   └── UserService.js
│   ├── utils/
│   │   ├── dbInit.js
│   │   └── ipHelper.js
│   ├── database/
│   │   └── schema.sql
│   ├── scripts/
│   ├── src/
│   │   └── index.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd support_system
```

### 2. Database Setup

```bash
cd backend

# Create database and import schema
mysql -u root -p < database/schema.sql

# Or use the initialization script
node utils/dbInit.js
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=support_system

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:

```bash
# Development
npm run dev

# Production
npm start
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | MySQL host | localhost |
| `DB_USER` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | support_system |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiry | 7d |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/logout` | User logout |

### Users (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create user |
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user |
| PATCH | `/api/users/:id/status` | Enable/Disable user |

### Tickets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tickets` | Create ticket |
| GET | `/api/tickets` | List tickets |
| GET | `/api/tickets/:id` | Get ticket details |
| PATCH | `/api/tickets/:id/status` | Update status |
| POST | `/api/tickets/:id/reply` | Add message |
| POST | `/api/tickets/:id/approve` | Approve (UW/MIS) |
| POST | `/api/tickets/:id/reject` | Reject (UW/MIS) |
| POST | `/api/tickets/:id/upload` | Upload attachment |

### Dashboard (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/branch-stats` | Branch statistics |
| GET | `/api/dashboard/stats` | Overall statistics |

### Lookups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lookups/departments` | List departments |
| GET | `/api/lookups/branches` | List branches |

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin (IT) | admin@support.com | admin123 |

---

## Default Branches

1. Head Office (HO)
2. Dhaka Central (DC)
3. Chittagong North (CN)
4. Sylhet (SY)
5. Rajshahi (RJ)

---

## Ticket Workflow Demo

### Scenario 1: Direct IT Request
1. User creates ticket with problem_type = "it"
2. Ticket goes directly to IT department
3. IT processes and closes

### Scenario 2: Underwriting Approval Flow
1. User creates ticket with problem_type = "underwriting"
2. Ticket goes to Underwriting queue
3. Underwriting Officer reviews and approves
4. Ticket automatically forwards to IT
5. IT processes and closes

### Scenario 3: MIS Approval Flow
1. User creates ticket with problem_type = "mis"
2. Ticket goes to MIS queue
3. MIS Officer reviews and rejects
4. Ticket is closed with rejection status

---

## UI Features

- **Role-based Sidebar**: Different navigation for each role
- **Dashboard Cards**: Quick stats overview
- **Branch Drill-down**: Click branch card to see branch-specific tickets
- **Filters**: Filter by status, date range, branch
- **File Upload**: Drag & drop image/PDF support
- **Status Badges**: Color-coded status indicators
- **Chat UI**: Thread-style message display
- **Approval Actions**: Approve/Reject with remarks

---

## License

MIT License