# Folder Structure Reference Guide

## Complete Directory Map

```
AUTO DM 2/
│
├── 📁 backend/                          # Node.js/Express server
│   │
│   ├── 📁 src/                          # Source code
│   │   ├── server.js                    # Main Express app
│   │   │
│   │   ├── 📁 config/                   # Configuration files
│   │   │   ├── database.js              # MongoDB setup
│   │   │   ├── env.js                   # Environment variables
│   │   │   └── instagram.js             # Instagram API config
│   │   │
│   │   ├── 📁 middleware/               # Express middleware
│   │   │   ├── auth.js                  # JWT auth middleware
│   │   │   └── errorHandler.js          # Global error handler
│   │   │
│   │   ├── 📁 models/                   # Mongoose schemas
│   │   │   ├── User.js                  # User model
│   │   │   ├── InstagramAccount.js      # Connected accounts
│   │   │   ├── AutomationRule.js        # Automation rules
│   │   │   ├── Message.js               # Messages
│   │   │   ├── Conversation.js          # Conversations/threads
│   │   │   └── Subscription.js          # Billing subscriptions
│   │   │
│   │   ├── 📁 routes/                   # API routes
│   │   │   ├── auth.js                  # /auth endpoints
│   │   │   ├── instagram.js             # /instagram endpoints
│   │   │   ├── rules.js                 # /rules endpoints
│   │   │   ├── conversations.js         # /conversations endpoints
│   │   │   ├── billing.js               # /billing (Stripe)
│   │   │   └── webhook.js               # /webhook (Instagram)
│   │   │
│   │   ├── 📁 services/                 # Business logic
│   │   │   ├── instagram.js             # Instagram Graph API
│   │   │   ├── ruleEngine.js            # Core matching logic
│   │   │   └── stripe.js                # Payment processing
│   │   │
│   │   └── 📁 utils/                    # Utilities
│   │       ├── logger.js                # Logging (Winston)
│   │       └── validators.js            # Input validation
│   │
│   ├── 📁 config/                       # Root config
│   │   ├── database.js
│   │   ├── env.js
│   │   └── instagram.js
│   │
│   ├── 📁 tests/                        # Unit tests
│   │   ├── auth.test.js
│   │   ├── rules.test.js
│   │   └── instagram.test.js
│   │
│   ├── 📁 migrations/                   # Database migrations
│   │   ├── 001_initial_schema.js
│   │   └── 002_add_indexes.js
│   │
│   ├── 📁 logs/                         # Application logs
│   │   ├── error.log
│   │   ├── combined.log
│   │   └── access.log
│   │
│   ├── package.json                     # Node dependencies
│   ├── .env.example                     # Environment template
│   └── .gitignore
│
├── 📁 frontend/                         # Next.js React app
│   │
│   ├── 📁 app/                          # Next.js App Router
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Home / Landing page
│   │   │
│   │   ├── 📁 login/                    # Login route
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 signup/                   # Signup route
│   │   │   └── page.tsx
│   │   │
│   │   └── 📁 dashboard/                # Protected dashboard
│   │       ├── page.tsx                 # Dashboard home
│   │       ├── layout.tsx               # Dashboard layout
│   │       │
│   │       ├── 📁 accounts/             # Account management
│   │       │   ├── page.tsx
│   │       │   └── components/
│   │       │
│   │       ├── 📁 inbox/                # Messages inbox
│   │       │   ├── page.tsx
│   │       │   └── components/
│   │       │
│   │       ├── 📁 rules/                # Rule editor
│   │       │   ├── page.tsx
│   │       │   └── [ruleId]/
│   │       │
│   │       ├── 📁 billing/              # Billing settings
│   │       │   ├── page.tsx
│   │       │   └── components/
│   │       │
│   │       └── 📁 settings/             # User settings
│   │           ├── page.tsx
│   │           └── components/
│   │
│   ├── 📁 components/                   # Reusable components
│   │   ├── CyberUI.tsx                  # UI system
│   │   ├── CyberGrid.tsx                # Grid layout
│   │   ├── DashboardModules.tsx         # Dashboard cards
│   │   ├── RuleBuilder.tsx              # Rule editor
│   │   └── StatsGlobe.tsx               # Analytics viz
│   │
│   ├── 📁 hooks/                        # Custom React hooks
│   │   ├── useAuth.ts                   # Auth state hook
│   │   ├── useInstagram.ts              # Instagram hook
│   │   └── useFetch.ts                  # Data fetching
│   │
│   ├── 📁 lib/                          # Library utilities
│   │   ├── api.ts                       # Axios API client
│   │   └── store.ts                     # Zustand store
│   │
│   ├── 📁 types/                        # TypeScript types
│   │   ├── index.ts                     # All type definitions
│   │   ├── user.ts                      # User types
│   │   ├── instagram.ts                 # Instagram types
│   │   └── rules.ts                     # Rule types
│   │
│   ├── 📁 utils/                        # Helper functions
│   │   ├── validators.ts                # Client-side validators
│   │   ├── helpers.ts                   # Common helpers
│   │   └── constants.ts                 # Constants
│   │
│   ├── 📁 styles/                       # Global styles
│   │   ├── globals.css                  # Tailwind + global CSS
│   │   ├── variables.css                # CSS variables
│   │   └── animations.css               # Animations
│   │
│   ├── 📁 public/                       # Static assets
│   │   ├── logo.svg
│   │   ├── favicon.ico
│   │   └── robots.txt
│   │
│   ├── next.config.js                   # Next.js config
│   ├── next-env.d.ts                    # Generated types
│   ├── tailwind.config.ts               # Tailwind config
│   ├── tsconfig.json                    # TypeScript config
│   ├── tsconfig.node.json               # TS config (build)
│   ├── postcss.config.js                # PostCSS config
│   ├── package.json                     # Dependencies
│   ├── .env.local.example               # Environment template
│   └── .gitignore
│
├── 📁 docker/                           # Docker configuration
│   ├── Dockerfile.backend               # Backend image
│   ├── Dockerfile.frontend              # Frontend image
│   ├── docker-compose.yml               # Compose file
│   └── .dockerignore
│
├── 📁 deployment/                       # Deployment files
│   ├── production.env                   # Prod environment
│   ├── nginx.conf                       # Nginx config
│   ├── systemd.service                  # Linux service
│   └── pm2.config.js                    # PM2 config
│
├── 📁 scripts/                          # Utility scripts
│   ├── setup.sh                         # Dev setup
│   ├── deploy.sh                        # Production deploy
│   ├── seed.js                          # Database seeding
│   └── backup.sh                        # Database backup
│
├── 📁 tests/                            # Integration tests
│   ├── 📁 e2e/                          # End-to-end tests
│   │   ├── auth.e2e.test.ts
│   │   ├── rules.e2e.test.ts
│   │   └── billing.e2e.test.ts
│   │
│   └── 📁 api/                          # API tests
│       ├── auth.test.ts
│       ├── instagram.test.ts
│       └── rules.test.ts
│
├── 📁 docs/                             # Documentation
│   ├── FULL_ARCHITECTURE.md             # Complete architecture
│   ├── SYSTEM_FLOW.md                   # System flows
│   ├── FOLDER_STRUCTURE.md              # This file
│   ├── API.md                           # API documentation
│   ├── DATABASE.md                      # Database design
│   ├── DEPLOYMENT.md                    # Deployment guide
│   ├── SECURITY.md                      # Security practices
│   ├── CONTRIBUTING.md                  # Contribution guide
│   └── TROUBLESHOOTING.md               # Troubleshooting guide
│
├── 📄 README.md                         # Project overview
├── 📄 QUICKSTART.md                     # Quick start guide
├── 📄 LAUNCH_GUIDE.md                   # Launch checklist
├── 📄 BUILD_SUMMARY.md                  # Build status
├── 📄 DEPLOYMENT_GUIDE.md               # Deployment steps
├── 📄 ARCHITECTURE.md                   # Architecture overview
├── 📄 INDEX.md                          # Documentation index
│
├── .gitignore                           # Git ignore rules
├── .env.example                         # Environment template
└── docker-compose.yml                   # Root compose file
```

---

## Directory Purpose & Content

### Backend Structure

#### `backend/src/config/`
Configuration management for:
- **database.js**: MongoDB connection URI, options, pool size
- **env.js**: Environment variable validation and defaults
- **instagram.js**: Instagram Graph API credentials and settings

#### `backend/src/middleware/`
Express middleware for:
- **auth.js**: JWT verification, token extraction
- **errorHandler.js**: Global error catching and formatting

#### `backend/src/models/`
Mongoose schemas defining:
- **User.js**: User accounts, authentication, profile
- **InstagramAccount.js**: Connected Instagram accounts
- **AutomationRule.js**: Automation rules with triggers/actions
- **Message.js**: Individual messages (both manual and automated)
- **Conversation.js**: Message threads/conversations
- **Subscription.js**: Billing subscription records

#### `backend/src/routes/`
REST API endpoints:
- **auth.js**: `POST /register`, `POST /login`, `POST /logout`
- **instagram.js**: Connect accounts, list accounts, disconnect
- **rules.js**: CRUD operations on automation rules
- **conversations.js**: Fetch inbox, get messages, send messages
- **billing.js**: Manage subscriptions, Stripe integration
- **webhook.js**: Receive Instagram webhooks

#### `backend/src/services/`
Business logic:
- **instagram.js**: Instagram Graph API calls, token refresh
- **ruleEngine.js**: Pattern matching and automation logic
- **stripe.js**: Payment processing and subscription management

#### `backend/src/utils/`
Helper utilities:
- **logger.js**: Structured logging (Winston/Bunyan)
- **validators.js**: Input validation functions

#### `backend/tests/`
Unit tests for core logic

#### `backend/migrations/`
Database schema migrations

#### `backend/logs/`
Application log files (git ignored)

---

### Frontend Structure

#### `frontend/app/`
Next.js App Router pages:
- **layout.tsx**: Root HTML structure and providers
- **page.tsx**: Landing page / home route
- **login/page.tsx**: Login form
- **signup/page.tsx**: Signup form
- **dashboard/**: Protected routes (require authentication)
  - **page.tsx**: Main dashboard
  - **accounts/**: Account management page
  - **inbox/**: Messages/conversations
  - **rules/**: Rule builder and list
  - **billing/**: Subscription management
  - **settings/**: User settings

#### `frontend/components/`
Reusable React components:
- **CyberUI.tsx**: Custom UI system with theme support
- **CyberGrid.tsx**: Grid layout component
- **DashboardModules.tsx**: Dashboard card modules
- **RuleBuilder.tsx**: Interactive rule creation form
- **StatsGlobe.tsx**: 3D globe analytics visualization

#### `frontend/hooks/`
Custom React hooks:
- **useAuth.ts**: Authentication state management
- **useInstagram.ts**: Instagram data and operations
- **useFetch.ts**: Data fetching wrapper

#### `frontend/lib/`
Shared libraries:
- **api.ts**: Axios instance with auth header injection
- **store.ts**: Zustand store for global state

#### `frontend/types/`
TypeScript type definitions:
- **index.ts**: All shared type interfaces

#### `frontend/utils/`
Utility functions:
- **validators.ts**: Client-side validation
- **helpers.ts**: Common helper functions
- **constants.ts**: Application constants

#### `frontend/styles/`
Global styling:
- **globals.css**: Tailwind imports and global styles
- **variables.css**: CSS custom properties
- **animations.css**: Keyframe animations

#### `frontend/public/`
Static assets:
- SVG logos, favicons, images

---

### Root Configuration Files

#### `docker/`
- **Dockerfile.backend**: Multi-stage build for Node.js
- **Dockerfile.frontend**: Multi-stage build for Next.js
- **docker-compose.yml**: Development environment setup

#### `deployment/`
- **production.env**: Production environment variables
- **nginx.conf**: Reverse proxy configuration
- **systemd.service**: Linux systemd service file
- **pm2.config.js**: PM2 process manager config

#### `scripts/`
- **setup.sh**: Initial development environment setup
- **deploy.sh**: Production deployment automation
- **seed.js**: Database seeding for testing
- **backup.sh**: Database backup script

#### `tests/`
- **e2e/**: End-to-end integration tests
- **api/**: API endpoint tests

#### `docs/`
- Comprehensive documentation for all aspects

---

## File Naming Conventions

### Backend
- **Routes**: `lowercase.js` (e.g., `auth.js`)
- **Models**: `PascalCase.js` (e.g., `AutomationRule.js`)
- **Services**: `lowercase.js` (e.g., `ruleEngine.js`)
- **Tests**: `feature.test.js` (e.g., `auth.test.js`)

### Frontend
- **Components**: `PascalCase.tsx` (e.g., `RuleBuilder.tsx`)
- **Pages**: `lowercase/page.tsx` (e.g., `login/page.tsx`)
- **Hooks**: `useCamelCase.ts` (e.g., `useAuth.ts`)
- **Utilities**: `lowercase.ts` (e.g., `validators.ts`)
- **Types**: `lowercase.ts` (e.g., `index.ts`)

---

## Key Patterns

### Backend Request Flow
```
Request
  ↓
Routes (entry point)
  ↓
Middleware (auth, validation)
  ↓
Controllers/Services (business logic)
  ↓
Models (database queries)
  ↓
Response
```

### Frontend Data Flow
```
User Action
  ↓
Component (UI)
  ↓
Hooks (state/logic)
  ↓
API Client (lib/api.ts)
  ↓
Backend
  ↓
Store Update (Zustand)
  ↓
UI Rerender
```

---

## Development Workflow

1. **Feature Development**: Create components/routes in their respective directories
2. **API Integration**: Use `lib/api.ts` for backend calls
3. **State Management**: Use hooks and Zustand store
4. **Testing**: Add tests in `tests/` directory
5. **Documentation**: Update relevant `.md` files

---

**Last Updated**: January 2026
**Version**: 1.0.0
