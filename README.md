Compensation Management App

A full-stack compensation management platform built for the hackathon assignment.
The system allows compensation administrators to manage salary review cycles, create salary adjustment proposals, approve/reject proposals with proper authorization rules, and maintain employee salary history securely.

Hosting URL: https://compensation-management-app.web.app


GitHub Repository: https://github.com/adarshloka-cmyk/compensation-management-system




Features:
Authentication
User registration and login
Firebase Authentication integration
Role-based access control
Separate admin and employee dashboards
Secure authenticated routes
Employee Features
View current salary
View salary effective date
View salary history
Real-time salary updates after approvals
Restricted access to own records only
Administrator Features
Create review cycles
Create salary proposals
Edit/delete proposals
Approve/reject proposals
Prevent self-approval of proposals
Budget validation
Close review cycles
Salary history generation
Filtering, sorting, and pagination


Setup & Run Instructions
1. Clone the repository
2. Navigate into the project
cd compensation-management-system
3. Install dependencies
npm install
4. Configure Firebase


Create a Firebase project and enable:

Firebase Authentication
Firestore Database

Create a .env file and add:

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
5. Start the development server
npm run dev
6. Open the application
http://localhost:5173

The application should now run locally.

Tech Stack & Rationale
Frontend
React.js
Vite
CSS3


Why React?

React provides component-based architecture, fast UI rendering, reusable components, and simplified state management for dashboard-style applications.

Why Vite?

Vite offers faster development startup and hot module replacement compared to traditional bundlers.

Backend / Database
Firebase Firestore
Why Firestore?

Firestore was chosen because:

It provides persistent cloud-hosted storage
Real-time updates are easy to implement
No separate backend server was required
Easy integration with React
Suitable for rapid prototyping within the hackathon time limit
Authentication
Firebase Authentication
Password Hashing Approach

Passwords are handled securely by Firebase Authentication.
Firebase stores passwords using industry-standard secure hashing internally, so plaintext password storage is never exposed to the application.

Architectural Overview

The application follows a simple component-based frontend architecture.

Main Structure
App.jsx
Root component
Handles authentication state
Controls routing between admin and employee dashboards
Login.jsx
Handles:
User registration
User login
Role selection
Creates Firestore user records
AdminDashboard.jsx

Handles:

Review cycle creation
Proposal creation
Proposal approval/rejection
Salary updates
Salary history generation
Filtering/sorting/pagination
EmployeeDashboard.jsx

Handles:

Current salary display
Salary history display
Automatic refresh of updated salary data
firebase.js

Contains Firebase configuration and initialization.

App.css

Contains complete application styling:

Glassmorphism UI
Responsive layouts
Sidebar navigation
Cards and dashboard styling
Database Structure

The Firestore database contains the following collections:

users

Stores:

email
role
current salary
effective date
reviewCycles

Stores:

cycle title
budget
effective date
status
created-by details
proposals

Stores:

employee details
proposal details
current salary snapshot
proposed salary
status
approval/rejection metadata
salaryHistory

Stores immutable salary history records.

How AI Tools Were Used

AI tools were used extensively during development for:

UI structuring
React component scaffolding
Firestore integration guidance
Business logic refinement
Validation logic
README drafting
AI Assistants Used
ChatGPT
AI-Generated / Assisted Areas
Initial React component structures
Styling ideas and UI improvements
Firestore query patterns
Validation logic suggestions
Proposal workflow logic
README drafting assistance
Hand-Written / Manually Reviewed Areas
Final business rule implementation
Role-based access logic
Proposal approval restrictions
Salary update workflow
Final debugging and integration
Firebase configuration
Final testing and verification
Reviewed / Rejected Suggestions

Several generated suggestions were modified or rejected during implementation, especially:

Proposal approval workflows
Sorting and filtering logic
Cycle-closing behavior
Salary synchronization logic

All final logic was manually tested and verified before submission.

Assumptions

The following assumptions were made during development:

Administrator Creation

Administrators are created during registration by selecting the admin role.

Default Employee Salary

New employees are initialized with a default salary value during account creation.

Default value used:

500000
Review Cycle Dates

The system uses a single effective date for salary application instead of separate start/end dates.

Immediate Salary Update

Employee salary updates occur immediately after proposal approval so future proposals use the latest salary value.



Trade-Offs:

Given the 6-hour development constraint, the following trade-offs were made:

Firebase was used instead of building a custom backend API
Styling and responsiveness were prioritized over advanced animations
Firestore client-side filtering was used instead of server-side querying optimization
No advanced audit logging system was implemented
No email notifications were implemented
No advanced role hierarchy beyond admin/employee

These choices allowed focus on implementing the required business logic completely within the available time.



Future Work:

With additional time, the following improvements would be added:

Dedicated backend API layer
Advanced role management
Real-time notifications
Better responsive mobile design
Advanced analytics dashboard
Export reports to PDF/Excel
Improved Firestore security rules
Search optimization
Better cycle budgeting analytics
Unit and integration testing
CI/CD pipeline integration
Validation Rules Implemented


The system validates:

Unique email registration
Positive review cycle budget
Non-empty cycle title
Non-empty justification
Proposed salary must exceed current salary
Prevention of self-approval/self-rejection
Restriction of employee access to other employee data
Deployment

The project is deployed using Firebase Hosting.

Incremental Commit History

The repository includes multiple incremental commits showing:

Authentication setup
Dashboard creation
Proposal workflow
Salary update logic
UI improvements
Final bug fixes and validations

Single-commit submission was intentionally avoided to demonstrate development progression clearly.



Final Notes:

This project focuses heavily on:

Correct business rule implementation
Data consistency
Secure role-based access
Clear workflow management
Persistent salary history tracking

The application was manually tested across major functional flows before submission.