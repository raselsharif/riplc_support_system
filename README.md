# Support Management System

A full-stack Support Management System with multi-department workflow routing, role-based access control, and approval workflows.

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
- React Router
- Axios
- Tailwind CSS
- date-fns

### Backend
- Node.js + Express
- JWT Authentication
- Zod Validation
- Multer (file uploads)
- Cloudinary (file storage)

### Database
- MySQL

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
│   │   ├── DashboardController.js
│   │   ├── LookupController.js
│   │   ├── TicketController.js
│   │   └── UserController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── role.js
│   │   ├── upload.js
│   │   └── validation.js
│   ├── models/
│   │   ├── Approval.js
│   │   ├── Attachment.js
│   │   ├── Branch.js
│   │   ├── Department.js
│   │   ├── Message.js
│   │   ├── StatusHistory.js
│   │   ├── Ticket.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── lookups.js
│   │   ├── tickets.js
│   │   └── users.js
│   ├── services/
│   │   ├── AttachmentService.js
│   │   ├── AuthService.js
│   │   ├── TicketService.js
│   │   └── UserService.js
│   ├── utils/
│   │   └── dbInit.js
│   ├── database/
│   │   └── schema.sql
│   ├── src/
│   │   └── index.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Filters.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── TicketTable.jsx
│   │   │   └── UploadField.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── ItLayout.jsx
│   │   │   ├── OfficerLayout.jsx
│   │   │   └── UserLayout.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AllTickets.jsx
│   │   │   │   ├── BranchList.jsx
│   │   │   │   ├── BranchTickets.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── TicketDetails.jsx
│   │   │   │   └── UsersList.jsx
│   │   │   ├── it/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Tickets.jsx
│   │   │   │   └── TicketDetails.jsx
│   │   │   ├── mis/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Tickets.jsx
│   │   │   │   └── TicketDetails.jsx
│   │   │   ├── underwriting/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Tickets.jsx
│   │   │   │   └── TicketDetails.jsx
│   │   │   └── user/
│   │   │       ├── CreateTicket.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── MyTickets.jsx
│   │   │       └── TicketDetails.jsx
│   │   ├── services/
│   │   │   └── api.js
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

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `departments` | IT, Underwriting, MIS |
| `branches` | Head Office, Dhaka Central, etc. |
| `users` | All system users with roles |
| `tickets` | Main ticket storage |
| `ticket_messages` | Thread messages |
| `ticket_attachments` | Cloudinary file references |
| `ticket_approvals` | Approval workflow records |
| `ticket_status_history` | Audit trail |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |

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
| PATCH | `/api/tickets/:id/status` | Update status (IT only) |
| POST | `/api/tickets/:id/reply` | Add message |
| POST | `/api/tickets/:id/approve` | Approve (UW/MIS only) |
| POST | `/api/tickets/:id/reject` | Reject (UW/MIS only) |
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

## Setup Instructions

### 1. Database Setup

```bash
cd backend

# Create database and tables
mysql -u root -p < database/schema.sql

# Or use the initialization script
node utils/dbInit.js
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Update `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=support_system
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from Dashboard
3. Update `.env` with:
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET

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
