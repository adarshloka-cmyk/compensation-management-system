# Compensation Management System

A full-stack Compensation Management System built to replace spreadsheet-based employee salary review workflows with a centralized and secure platform.

The application allows compensation administrators to create salary review cycles, propose salary changes, approve/reject proposals with budget validation, and maintain immutable salary history records. Employees can securely access only their own compensation information and salary history.

---

# Features

## Authentication & Authorization

* Firebase Authentication based login and registration
* Role-based access control (Admin / Employee)
* Employees can access only their own salary information
* Admin-only access to review cycles and salary proposals
* Session persistence across refresh/restart

## Review Cycle Management

* Create salary review cycles
* Configure:

  * cycle title
  * effective date
  * budget
* Open / Closed cycle states
* Prevent closing cycles with unresolved proposals

## Salary Proposal Workflow

* Create salary adjustment proposals
* Current employee salary preview
* Automatic proposal cost calculation
* Proposal justification support
* Approve / Reject proposals
* Multi-admin approval workflow
* Self-approval prevention

## Budget Enforcement

* Approval blocked when cycle budget is exceeded
* Remaining budget validation shown during approval

## Salary History

* Immutable salary history tracking
* Previous salary
* New salary
* Effective date
* Applied date
* Change type

## Proposal Management

* Filtering by:

  * status
  * cycle
  * employee
* Sorting by proposal cost
* Pagination support

## UI/UX

* Modern glassmorphism dashboard
* Sidebar navigation
* Responsive layout
* Hover animations and transitions

---

# Setup & Run Instructions

## Prerequisites

Install the following:

* Node.js
* npm
* Firebase account

---

## Clone Repository

```bash
git clone <YOUR_GITHUB_REPO_LINK>
```

```bash
cd compensation-management-system
```

---

## Install Dependencies

```bash
npm install
```

---

## Firebase Setup

Create a Firebase project.

Enable:

* Firebase Authentication
* Firestore Database

Authentication Method:

* Email/Password

---

## Configure Firebase

Create:

```bash
src/firebase.js
```

Add Firebase configuration:

```javascript
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);
```

---

## Firestore Rules

Use temporary hackathon-safe rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## Run Application

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

# Tech Stack & Rationale

## Frontend

### React.js + Vite

Chosen because:

* Fast development speed
* Excellent component architecture
* Lightweight setup for hackathon timeline
* Vite provides very fast local development and builds

---

## Authentication

### Firebase Authentication

Chosen because:

* Easy secure authentication setup
* Password hashing handled automatically by Firebase
* Reliable session management
* Reduced backend implementation time

Password hashing is securely managed internally by Firebase Authentication.
No plaintext passwords are stored anywhere in the application.

---

## Database

### Firebase Firestore

Chosen because:

* Real-time cloud database
* No backend server setup required
* Persistent storage across restarts
* Flexible document-based schema
* Rapid development suitable for 6-hour build window

Collections used:

* users
* reviewCycles
* proposals
* salaryHistory

---

## Styling

### CSS

Custom CSS was used for:

* Glassmorphism UI
* Responsive layouts
* Sidebar navigation
* Animations and hover effects

---

# Architectural Overview

The application follows a modular component-based frontend architecture.

## Key Files

### App.jsx

* Root application component
* Handles authentication state
* Controls role-based rendering
* Sidebar navigation handling

---

### firebase.js

* Firebase initialization
* Authentication configuration
* Firestore setup

---

### pages/Login.jsx

Handles:

* Login
* Registration
* Role selection
* User creation

---

### pages/AdminDashboard.jsx

Handles:

* Review cycle creation
* Proposal creation
* Proposal approval/rejection
* Budget validation
* Filtering and sorting
* Pagination
* Closing review cycles

---

### pages/EmployeeDashboard.jsx

Handles:

* Employee salary view
* Salary history view
* Restricted employee-only access

---

### App.css

Contains:

* Layout styling
* Sidebar design
* Glassmorphism UI
* Responsive behavior
* Animations

---

# How AI Tools Were Used

AI tools were actively used throughout development to accelerate implementation within the 6-hour hackathon constraint.

## AI Tools Used

* ChatGPT

---

## AI-Assisted Areas

* Initial project planning
* React component generation
* Firebase integration guidance
* UI styling improvements
* Pagination and filtering logic
* Proposal approval workflow
* README drafting
* Validation logic suggestions

---

## Manually Reviewed / Edited

All AI-generated code was manually:

* reviewed
* tested
* debugged
* modified
* reorganized

Several generated implementations were simplified or rewritten to better fit:

* business requirements
* UI consistency
* Firebase architecture
* hackathon scope

---

## Observations

AI significantly accelerated:

* UI generation
* repetitive CRUD logic
* layout creation
* architectural brainstorming

However, business-rule correctness (approval restrictions, budget enforcement, role separation) still required careful manual validation and debugging.

---

# Assumptions

## Admin Role Creation

For hackathon simplicity, users can self-select:

* employee
* admin

at registration time.

In production, admin creation would instead be restricted using:

* invite-only onboarding
* backend authorization
* protected admin APIs

---

## Starting Salary

New users manually enter their starting salary during registration.

---

## Budget Validation

Proposals may exceed the budget during creation, but approval is blocked if approving would exceed the cycle budget.

This reflects realistic enterprise workflows where proposals are drafted first and financially reviewed later.

---

## Storage

Firestore serves as both:

* primary database
* persistent storage layer

No separate backend server was implemented.

---

# Trade-offs

Given the 6-hour development constraint, several trade-offs were intentionally made.

## Prioritized

* Core business logic
* Proposal workflow correctness
* Budget validation
* Role isolation
* Persistent storage
* End-to-end usability

---

## Deprioritized

### Backend Server

A dedicated backend API layer was skipped to reduce development time.

### Production Security

Firestore rules are intentionally simplified for rapid hackathon setup.

### Advanced Analytics

No dashboards/charts/reporting were added.

### Enterprise Role Management

Admin creation is simplified.

### Unit Testing

Formal automated testing was not implemented due to time constraints.

### Optimized Querying

Firestore indexing and advanced query optimization were not deeply tuned.

---

# Future Work

With more time, the following improvements would be added.

## Security

* Proper Firestore security rules
* Protected admin creation
* Backend validation APIs
* JWT/session validation layer

---

## Backend

* Dedicated Node.js/Express backend
* REST API layer
* Server-side business rule enforcement

---

## Advanced Features

* Notifications/email alerts
* Audit dashboards
* Budget analytics
* Employee search optimization
* Multi-department support
* Bulk proposal upload
* Approval chains/workflows

---

## Performance

* Firestore indexing optimization
* Lazy loading
* Better pagination
* Query optimization

---

## UI/UX

* Charts and analytics
* Dark/light themes
* Better accessibility
* Improved mobile experience

---

# Incremental Commit History

The repository contains incremental commits showing:

* authentication setup
* dashboard creation
* proposal workflow implementation
* UI improvements
* pagination/filtering additions
* sidebar navigation
* final polishing

This demonstrates the development progression throughout the hackathon.

---

# Demo Flow

Recommended demo sequence:

1. Register employee
2. Register admin
3. Create review cycle
4. Create salary proposal
5. Approve proposal using different admin
6. Demonstrate budget validation
7. Close cycle
8. Login as employee
9. Verify updated salary and salary history

---

# Conclusion

This project demonstrates a fully working end-to-end compensation management workflow system focused on:

* business rule correctness
* role-based security
* budget validation
* salary auditability
* modern dashboard UX

while remaining achievable within a strict 6-hour hackathon development window.
