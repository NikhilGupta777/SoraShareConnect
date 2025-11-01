# Sora Invite Code Sharing Community

## Project Overview
A community-driven web platform for sharing OpenAI Sora invite codes. The system operates on a "pay it forward" model: users receive one code and are encouraged to contribute the four new codes they receive from Sora.

## Current State
Full-stack application built with:
- **Frontend**: React + TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (in-memory storage for MVP)
- **Authentication**: Session-based admin authentication
- **Bot Protection**: Google reCAPTCHA v2

## Features Implemented
### Public-Facing
- Home dashboard showing available code count
- Code request flow with reCAPTCHA verification
- Code distribution system (one code per request)
- Pay-it-forward contribution form (4 code submission)
- Thank you confirmation page

### Admin Panel
- Secure admin login
- Dashboard with statistics (total, available, distributed, used, invalid codes)
- Full code management (CRUD operations)
- Status filtering and updates
- Bulk code addition
- Verification queue (distributed codes)

## Project Structure
```
client/
  └── src/
      ├── pages/
      │   ├── Home.tsx (public dashboard)
      │   ├── RequestCode.tsx (user flow)
      │   ├── AdminLogin.tsx
      │   └── AdminDashboard.tsx
      └── components/ (Shadcn UI components)

server/
  ├── routes.ts (API endpoints)
  ├── storage.ts (storage interface & in-memory implementation)
  ├── seed.ts (initial data seeding)
  └── index.ts (Express server)

shared/
  └── schema.ts (TypeScript types and Zod schemas)
```

## Default Credentials
- **Username**: admin
- **Password**: admin123
- ⚠️ **IMPORTANT**: Change these in production!

## Environment Variables
- `VITE_RECAPTCHA_SITE_KEY`: Google reCAPTCHA site key (test key included)
- `SESSION_SECRET`: Session encryption secret

## Code Status Workflow
1. **Available**: Ready to be given to users
2. **Distributed**: Given to a user, awaiting contribution
3. **Used**: User successfully contributed 4 new codes
4. **Invalid**: Manually marked as expired/non-functional by admin

## Architecture Decisions
- **In-Memory Storage**: Current implementation uses MemStorage for simplicity
- **Session-Based Auth**: Admin authentication using express-session
- **Status Automation**: Code status automatically updates to "used" when user submits 4 new codes
- **Simple Design**: Clean, minimal UI focused on functionality

## Recent Changes
- Initial project setup and database schema design
- Complete frontend implementation with all user flows
- Backend API routes for code management and admin operations
- Database seeding with 4 initial codes and default admin user
- reCAPTCHA integration for bot prevention

## Next Steps
- Consider migrating from in-memory storage to PostgreSQL for persistence
- Add rate limiting per IP address
- Implement email notifications for code distribution
- Add analytics dashboard for tracking trends
- Create automated code validation system
