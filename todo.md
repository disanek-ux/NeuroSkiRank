# NeuroSciRank Project TODO

## Database & Schema
- [x] Design and implement User table with profile fields (name, email, field, institution, bio)
- [x] Design and implement Publication table with DOI-based metadata
- [x] Design and implement UserRating table for weekly ranking scores
- [x] Add indices for efficient queries (email, DOI, user_id)
- [x] Push database migrations with `pnpm db:push`

## Authentication & User Management
- [x] Implement user registration endpoint (email, password, field, institution)
- [x] Implement user login endpoint with JWT/session management
- [x] Implement GET /me endpoint for current user profile
- [x] Implement PUT /me endpoint for profile updates
- [x] Add password hashing with bcrypt
- [x] Design auth flow for future OAuth providers (ORCID)
- [x] Implement protected API routes with authentication middleware

## Publication Management
- [x] Implement DOI format validation
- [x] Integrate with Crossref API for DOI metadata fetching
- [x] Implement POST /publications endpoint (DOI validation + metadata fetch)
- [x] Implement GET /my/publications endpoint
- [x] Implement GET /users/:userId/publications endpoint
- [x] Handle duplicate DOI prevention per user
- [x] Add error handling for invalid/missing DOIs

## Ranking & Scoring System
- [x] Implement scoring formula (base score, recency bonus, journal impact)
- [x] Implement weekly background job for ranking recalculation
- [x] Implement global ranking calculation with tie-breaking
- [x] Implement GET /ranking endpoint (paginated top users)
- [x] Implement GET /users/:id/rating endpoint
- [x] Set up cron job scheduler (node-cron or similar)

## Search Functionality
- [x] Implement GET /search endpoint with query parameters
- [x] Add search over users (name, field, institution)
- [x] Add search over publications (title, journal, DOI, authors)
- [x] Implement pagination for search results
- [x] Add filtering by type (users | publications | all)

## Frontend - Pages & Components
- [x] Create landing/home page with explanation and CTA buttons
- [x] Create registration page with form validation
- [x] Create login page with email/password form
- [x] Create dashboard page (authenticated, shows profile + publications)
- [x] Create ranking page with top researchers table
- [x] Create user profile page (public view)
- [x] Create search page with filters and results
- [x] Create publication add form with DOI input

## Frontend - Layout & Navigation
- [x] Design and implement main navigation structure
- [x] Create header/navbar component
- [x] Implement responsive layout for mobile/desktop
- [x] Add dark theme styling with Tailwind
- [x] Create reusable UI components (cards, tables, modals)
- [x] Implement authentication flow (login/logout/redirect)

## Frontend - API Integration
- [x] Wire up registration form to backend
- [x] Wire up login form to backend
- [x] Wire up profile page to /me endpoint
- [x] Wire up dashboard to fetch user publications
- [x] Wire up publication add form to POST /publications
- [x] Wire up ranking page to GET /ranking endpoint
- [x] Wire up search to GET /search endpoint
- [x] Implement proper error handling and loading states

## Testing
- [ ] Write vitest tests for authentication endpoints
- [ ] Write vitest tests for publication management
- [ ] Write vitest tests for ranking calculation
- [ ] Write vitest tests for search functionality
- [ ] Test DOI validation and Crossref API integration

## Deployment & Documentation
- [x] Create comprehensive README with architecture overview
- [x] Document environment variables and setup
- [x] Create local development setup instructions
- [x] Document deployment process (Render/Railway/Vercel)
- [x] Create API documentation with endpoint examples
- [x] Add database schema documentation
- [x] Document scoring algorithm in detail

## Optional Enhancements
- [ ] Add publication type classification (hypothesis/review/case report)
- [ ] Add manual weight adjustments per publication type
- [ ] Implement user profile customization
- [ ] Add publication filtering/sorting options
- [ ] Implement notification system for ranking updates


## Deployment & Telegram Integration
- [x] Update tRPC client to use environment API URL
- [x] Create .env.example file for reference
- [x] Add Netlify build configuration
- [x] Add Render deployment configuration
- [x] Create Telegram Bot integration guide
- [x] Create comprehensive deployment guide
