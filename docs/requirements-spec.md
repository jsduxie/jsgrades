# JSGrades: Qualification Tracker

JSGrades is a full-stack web application to allow users to primarily calculate overall module/year/degree grades (as well as predicted), since this can become complicated with different weightings.

In addition, JSGrades will provide assessment tracking to allow users to stay organised, in addition to visualisation tools to track grade trajectory.

## Key Features
| Feature | Description |
|------|------|
| Authentication | Firebase user authentication to allow signup, login, logout with an email, password or social accounts |
| Qualification Tracks | Generalisable hierarchy of assessments (qualification/year/module/assessment), for example |
| Grade Calculation | Weighted averages of grades based on overall assessment/year weightings, customisable settings |
| Visualisations | Charts to for users to visualise progress over time, and identify their skillsets |
| Persistence | Cloud-based database |
| Task Management | Track assessments by due date, and add optional tasks for organisation |
| Export | Ability to export qualification details in multiple formats |

## Functional Requirements

### FR1 - Authentication
FR1.1: Users are able to sign up, log in, and log out
FR1.2: Users can reset their password through Firebase
FR1.3: Authenticated users can only access their own data
FR1.4: Users should have persistent sessions, being logged out after 30 days of inactivity

### FR2 - Qualification Structure
FR2.1: Users can create and update multiple qualifications
FR2.2: Each qualification can be modelled as a track hierarchy, allowing for differing levels of granularity (i.e. degrees have the overall qualification, degree year, module and assessments, whereas A-Levels have different subjects and assessments within this)
FR2.3: Users can enter both predicted and actual grades, to allow for estimations throughout the year
FR2.4: Overall qualifications include the type, institution, target grade, and graduation/completion date

### FR3 - Grade Calculations
FR3.1: Weighted grades are to be automatically calculated at each level of the hierarchy, for both actual and predicted grades
FR3.2: Users can define different weights and rounding rules for each level of the hierarchy, with default levels

### FR4 - Assessment Tracking
FR4.1: Users have the ability to add one or more assessments as part of the qualification track.
FR4.2: Each assessment includes: title, weight, due date, grade (if available), type (e.g., exam, coursework)
FR4.3: Ability to view all assessments in order of due date
FR4.4: Ability to add subtasks for assessments to aid with organisation

### FR5 - Visualisations
FR5.1: Dynamically refreshed, responsive visualisations to track grade progression over time

### FR6 - Data Management
FR6.1: Isolated and secure user data management
FR6.2: Auto-save and update on input change
FR6.3: Optional saving of data to CSV or PDF
FR6.4: Users can share read-only links to their qualifications

## Non-Functional Requirements
| Category | Requirement |
|------|------|
| Usability | Intuitive, clean, responsive user inferface (UI) throughout |
| Security | Authentication required, with scoped user data access |
| Reliability | Persistent storage in a cloud-based database |
| Performance | <2s load time, <500ms API latency |
| Maintainability | Modular, clean codebase with reusable components |
| Availability | Deployment to scalable hosting solutions |
| Compatability | Compatable with most mainstream browsers on desktop and mobile |

## UI / UX Requirements
- Home Page
- Login / Register / Forgot Password forms
- Dashboard - ability to view statistics, and switch between qualification / assessment tracking / visualisation views
- Qualification view - nested structure, clean and intuitive
- Assessent tracking - variety of views (list/calender)
- Visualisations - grade charts and trends

Addiitonal components:
- Loading animations
- Toasts for success and errors
- Hover tooltips
- Breadcrumb navigation

## Tech Stack
| Component | Technology |
|------|------|
| Frontend | React + Tailwind |
| Visualisations | Recharts / Chart.js |
| Auth | Firebase Auth |
| Backend | Node.js (Express) |
| Database | Postgres |
| Hosting | Vercel (frontend), Render (backend) |
| CI/CD | GitHub Actions |
| State | Context API |
| API |REST |
