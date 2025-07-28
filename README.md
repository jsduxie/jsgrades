# JSGrades - Qualification Tracking Platform

[![CI](https://github.com/jsduxie/jsgrades/actions/workflows/ci.yml/badge.svg)](https://github.com/jsduxie/jsgrades/actions/workflows/ci.yml)
[![Deploy](https://github.com/jsduxie/jsgrades/actions/workflows/vercel-deploy.yml/badge.svg)](https://github.com/jsduxie/jsgrades/actions/workflows/vercel-deploy.yml)
[![codecov](https://codecov.io/gh/jsduxie/jsgrades/branch/main/graph/badge.svg)](https://codecov.io/gh/jsduxie/jsgrades)
[![License](https://img.shields.io/github/license/jsduxie/jsgrades)](LICENSE)

A comprehensive full-stack web application for tracking academic assessments, qualifications, and grade progress. Built with modern technologies to provide students with a centralised platform for academic management.

## Live Demo

- **Production**: [JSGrades Platform](https://jsgrades.vercel.app)

## Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## Features

### Core Functionality
- **Qualification Management**: Track multiple academic qualifications with detailed progress monitoring
- **Assessment Tracking**: Record and manage individual assessments and overall qualifications
- **Task Tracking**: Manage tasks related to ongoing qualifications.
- **Grade Analytics**: Visual dashboards with progress charts and grade trend analysis
- **Multi-level Support**: Support for various qualification levels.

### User Experience
- **Responsive Design**: Optimizsd for desktop, tablet, and mobile devices
- **Dark/Light Theme**: User preference-based theme switching
- **Real-time Updates**: Live progress tracking and instant grade calculations
- **Intuitive Navigation**: Clean, modern UI with excellent user experience

### Security & Authentication
- **Firebase Authentication**: Secure user authentication with email and Google sign-in.

### Analytics & Reporting
- **Progress Visualization**: Interactive charts and graphs for grade tracking
- **Performance Insights**: Detailed analytics on academic performance trends

## 🛠 Technology Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Material-UI](https://mui.com/)
- **UI Components**: Custom component library with [Radix UI](https://www.radix-ui.com/)
- **State Management**: React Context API with custom hooks
- **Forms**: [React Hook Form](https://react-hook-form.com/) for efficient form handling

### Backend
- **Runtime**: Node.js with TypeScript
- **API**: Next.js API Routes with RESTful design
- **Database**: PostgreSQL with optimized schema design
- **Authentication**: [Firebase Auth](https://firebase.google.com/products/auth)
- **File Storage**: Firebase Storage for document management

### Development & DevOps
- **Language**: TypeScript for type safety and better developer experience
- **Testing**: Jest + Testing Library for comprehensive test coverage
- **Linting**: ESLint + Prettier for code quality and consistency
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Hosting**: Vercel for seamless deployment and scaling
- **Monitoring**: Codecov for test coverage tracking

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • React 19      │    │ • TypeScript    │    │ • Optimized     │
│ • Tailwind CSS  │    │ • Node.js       │    │   Schema        │
│ • Material-UI   │    │ • Firebase Auth │    │ • Audit Logs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Design Principles
- **Separation of Concerns**: Clear separation between presentation, business logic, and data layers
- **Scalability**: Designed to handle growing user base and data volume
- **Security First**: Security considerations integrated at every level
- **Performance**: Optimized for fast loading times and smooth user experience

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or yarn package manager
- PostgreSQL database
- Firebase project setup

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/jsduxie/jsgrades.git
cd jsgrades
```

2. **Install dependencies**
```bash
cd jsgrades
npm install
```

3. **Environment setup**
```bash
cp .env.local
# Configure your environment variables
```

4. **Database setup**
```bash
# Run database migrations
npm run db:migrate
# Seed initial data
npm run db:seed
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

Create a `.env.local` file in the `jsgrades` directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_apiKey=
NEXT_PUBLIC_FIREBASE_authDomain=
NEXT_PUBLIC_FIREBASE_projectId=
NEXT_PUBLIC_FIREBASE_storageBucket=
NEXT_PUBLIC_FIREBASE_messagingSenderId=
NEXT_PUBLIC_FIREBASE_appId=
NEXT_PUBLIC_FIREBASE_measurementId=
FIREBASE_SDK_KEY=

# Database
DATABASE_URL=your_db_url
DATABASE_URL_DEV=your_dev_db_url
DB_PASS=your_db_password
DB_USER=your_db_username

# Application
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
STATUS=DEV
```

##  Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Check Prettier formatting
npm run format:fix   # Fix Prettier formatting

# Testing
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Database
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with test data
npm run db:reset     # Reset database
```

### Project Structure

```
jsgrades/
├── app/                    # Next.js 13+ app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── home/             # Dashboard pages
│   └── qualifications/   # Qualification management
├── components/            # Reusable React components
├── lib/                  # Utility functions and configurations
├── types/                # TypeScript type definitions
├── tests/                # Test files
└── public/               # Static assets
```

## Testing

The project maintains high test coverage with comprehensive testing strategies:

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint and database interaction testing
- **E2E Tests**: Critical user journey testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- UserAuth.test.tsx
```

Current test coverage: ![Coverage](https://img.shields.io/codecov/c/github/jsduxie/jsgrades)

## Deployment

### Production Deployment

The application is automatically deployed using GitHub Actions:

1. **Push to main branch** triggers the deployment pipeline
2. **Tests run** ensuring code quality
3. **Build process** optimizes the application
4. **Deploy to Vercel** for production hosting

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod
```

## API Documentation

### Authentication Endpoints

```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
```

### Qualifications API

```http
GET    /api/qualifications          # Get all qualifications
POST   /api/qualifications          # Create new qualification
GET    /api/qualifications/:id      # Get specific qualification
PUT    /api/qualifications/:id      # Update qualification
DELETE /api/qualifications/:id      # Delete qualification
```

### User Management

```http
GET    /api/user/:uid               # Get user profile
PUT    /api/user/:uid               # Update user profile
```

For detailed API documentation, see [API Documentation](docs/api.md) *(to be created)*

## Contributing

Contributions are welcome! Please read the [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Code of Conduct
- Development Process
- Pull Request Process
- Issue Templates

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**James Duxbury** - [GitHub](https://github.com/jsduxie) | [LinkedIn](https://linkedin.com/in/jsduxie)

---

## Acknowledgments

- Next.js team for the amazing framework
- Material-UI for the component library
- Firebase for authentication and storage services
- Vercel for hosting and deployment platform

---

**⭐ Star this repository if you find it helpful!**
