# Support Management System - Project Presentation

---

## Slide 1: Overview

### Support Management System
**Multi-Department Ticket Management with Workflow Automation**

A comprehensive support ticket management system built with React and Node.js that streamlines IT support requests across multiple departments with role-based access control.

---

## Slide 2: Problem Statement

### The Challenge
- Multiple departments (IT, Underwriting, MIS) handling support requests
- Manual ticket routing was inefficient
- No clear visibility of ticket status
- Need for approval workflows before escalation

### Our Solution
- Centralized ticket management system
- Automated department routing
- Real-time status tracking
- Built-in approval workflows

---

## Slide 3: Key Features

### Core Features
1. **Multi-Department Support**
   - IT, Underwriting, MIS departments
   - Role-based access control

2. **Smart Workflow Routing**
   - Direct IT requests
   - Underwriting approval flow
   - MIS approval flow

3. **Real-time Communication**
   - Internal notes
   - Message threads
   - File attachments

4. **Dashboard Analytics**
   - Ticket volume charts
   - Department statistics
   - Priority visualization

---

## Slide 4: User Roles

| Role | Access Level |
|------|-------------|
| **Admin** | Full system access, user management |
| **User** | Create/view own tickets |
| **IT** | Handle IT tickets, technical support |
| **Underwriting** | Approve underwriting tickets |
| **MIS** | Approve MIS tickets |

---

## Slide 5: Ticket Flow

```
User creates ticket
       ↓
  [Department Selection]
       ↓
┌─────┴─────┐
↓           ↓
IT      → Underwriting/MIS
     (if selected)
       ↓
  [Approval Process]
       ↓
┌─────┴─────┐
↓           ↓
Approved  Rejected
   ↓         ↓
  IT      Closed
Processing
       ↓
   Closed
```

---

## Slide 6: Technology Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for responsive design
- **Framer Motion** for animations
- **React Router v6** for navigation
- **Axios** for API calls
- **date-fns** for date formatting

### Backend
- **Node.js** + Express.js
- **JWT Authentication**
- **Zod** for validation
- **Multer** for file uploads
- **Cloudinary** for file storage

### Database
- **MySQL**

---

## Slide 7: Dashboard Views

### Admin Dashboard
- 6 stat cards in one row (Total, Open, Pending, Approved, Rejected, Closed)
- Daily ticket volume chart
- Department breakdown
- Priority levels

### User Dashboard
- 5 stat cards (Total, Open, Pending, Approved, Closed)
- Recent tickets list
- Quick create button

### IT/MIS/Underwriting Dashboards
- Department-specific stats
- Branch-wise ticket distribution
- Real-time polling updates

---

## Slide 8: UI/UX Features

### Theme Support
- 5 color themes: Blue, Green, Purple, Orange, Dark
- CSS variables for consistent styling

### Message Thread
- Chat-style conversation
- Internal notes (staff only)
- File attachments
- Theme-aware colors

### Image Preview
- Multiple image navigation
- Keyboard navigation (← →)
- Close with Escape

---

## Slide 9: Recent Enhancements

### UI Improvements
1. **Message Bubble Colors** - Theme-aware styling
2. **Dashboard Cards** - Consistent colors across all views
3. **Pending Status** - Distinct amber→orange gradient
4. **Image Preview** - Next/Previous navigation
5. **Responsive Grid** - All cards in one row on big screens

### Bug Fixes
- Zero value display when no data
- Proper CSS variable usage for dark mode
- Loading state handling

---

## Slide 10: System Architecture

```
┌─────────────┐     ┌─────────────┐
│   Frontend  │────│   Backend   │
│   (React)   │     │  (Node.js)  │
└─────────────┘     └──────┬──────┘
                          ↓
                   ┌─────────────┐
                   │  Database  │
                   │   (MySQL)   │
                   └─────────────┘
```

---

## Slide 11: Project Structure

```
support_system/
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── routes/
│   └── config/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── layouts/
│   └── package.json
└── PRESENTATION.md
```

---

## Slide 12: Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### Installation
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Access
- Open browser: `http://localhost:5173`
- Login withdemo credentials

---

## Slide 13: Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| User | user | user123 |
| IT | it | it123 |
| Underwriting | underwriting | underwriting123 |
| MIS | mis | mis123 |

---

## Slide 14: Future Enhancements

### Planned Features
- [ ] Email notifications
- [ ] Mobile app
- [ ] Knowledge base
- [ ] SLA tracking
- [ ] Report exports
- [ ] Audit logs

---

## Slide 15: Thank You

### Questions?

**Project Repository**: [GitHub URL]

**Live Demo**: Available upon request

---

*Support Management System - Built with React & Node.js*