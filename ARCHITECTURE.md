# NeuroSciRank Architecture

## Overview

NeuroSciRank is a full-stack academic platform for neuroscience researchers. It provides a transparent ranking system based on publication metrics, researcher profiles, and discovery features.

## Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- tRPC for end-to-end type-safe API calls
- Wouter for lightweight routing

**Backend:**
- Node.js with Express 4
- TypeScript for type safety
- tRPC for RPC framework
- Drizzle ORM for database access

**Database:**
- MySQL/TiDB for persistent storage
- Drizzle migrations for schema management

**External APIs:**
- Crossref API for DOI metadata fetching
- Manus OAuth for authentication

**Background Jobs:**
- node-cron for scheduling weekly ranking recalculation

## Database Schema

### Users Table
Stores researcher profiles with authentication and profile information.

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  passwordHash VARCHAR(255),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  field VARCHAR(255),
  institution VARCHAR(255),
  bio TEXT,
  orcidId VARCHAR(64),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Publications Table
Stores research papers added by users via DOI.

```sql
CREATE TABLE publications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  doi VARCHAR(255) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  authors JSON NOT NULL,
  journal VARCHAR(255),
  year INT,
  abstract TEXT,
  publicationType ENUM('journal-article', 'conference-proceeding', 'book', 'book-chapter', 'preprint', 'other'),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### UserRatings Table
Stores computed ranking scores updated weekly.

```sql
CREATE TABLE userRatings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL UNIQUE,
  score DECIMAL(10, 2) DEFAULT 0,
  rank INT,
  publicationCount INT DEFAULT 0,
  computedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### PublicationScores Table
Detailed scoring breakdown for transparency.

```sql
CREATE TABLE publicationScores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  publicationId INT NOT NULL,
  userId INT NOT NULL,
  baseScore DECIMAL(10, 2) DEFAULT 10,
  recencyBonus DECIMAL(10, 2) DEFAULT 0,
  impactBonus DECIMAL(10, 2) DEFAULT 0,
  totalScore DECIMAL(10, 2) NOT NULL,
  computedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### RankingHistory Table
Audit trail for tracking ranking changes over time.

```sql
CREATE TABLE rankingHistory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  score DECIMAL(10, 2) NOT NULL,
  rank INT,
  publicationCount INT,
  recordedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Ranking Algorithm

### Scoring Formula

Each publication contributes points based on three factors:

1. **Base Score:** 10 points per publication
2. **Recency Bonus:**
   - Within last year: +10 points
   - Within last 3 years: +5 points
   - Within last 5 years: +2 points
   - Older: +1 point

3. **Impact Bonus:**
   - High-impact journals (Nature, Science, Cell, Lancet, etc.): +5 points
   - Other journals: 0 points

**User Score** = Sum of all publication scores

### Global Ranking

Users are ranked by total score (descending). Ties are broken by user ID (ascending), ensuring earlier registrations rank higher in case of equal scores.

### Recalculation Schedule

Rankings are recalculated every Sunday at 00:00 UTC using a background job (node-cron). The job:
1. Fetches all users and their publications
2. Calculates individual publication scores
3. Sums scores per user
4. Assigns global ranks
5. Records history for analytics

## API Endpoints

### Authentication
- `POST /api/oauth/callback` - OAuth callback (handled by framework)
- `POST /api/trpc/auth.logout` - Logout current user

### User Management
- `GET /api/trpc/user.getMe` - Get current user profile
- `PUT /api/trpc/user.updateProfile` - Update profile (name, field, institution, bio)
- `GET /api/trpc/user.getPublicProfile` - Get public user profile

### Publications
- `POST /api/trpc/publications.add` - Add publication via DOI
- `GET /api/trpc/publications.getMyPublications` - Get user's publications
- `GET /api/trpc/publications.getUserPublications` - Get public user's publications

### Ranking
- `GET /api/trpc/ranking.getTopUsers` - Get top ranked users (paginated)
- `GET /api/trpc/ranking.getUserRating` - Get user's rating details
- `POST /api/trpc/ranking.recalculate` - Admin: manually trigger recalculation

### Search
- `GET /api/trpc/search.query` - Search users and publications

## Frontend Architecture

### Pages
- `/` - Landing page with features and CTA
- `/dashboard` - Authenticated user dashboard (profile, publications, ranking)
- `/ranking` - Global ranking leaderboard
- `/users/:id` - Public researcher profile
- `/search` - Search interface for users and publications

### State Management
- tRPC hooks for server state (queries and mutations)
- React hooks for local UI state
- Manus OAuth for authentication state

### Authentication Flow
1. User clicks "Sign In" button
2. Redirected to Manus OAuth portal
3. After authentication, redirected to `/api/oauth/callback`
4. Session cookie set automatically
5. Frontend reads auth state with `trpc.auth.me.useQuery()`
6. Protected routes redirect to login if not authenticated

## Deployment Architecture

### Development
```
npm install
npm run dev
```

### Production Deployment

**Backend (Render/Railway):**
1. Connect repository to Render/Railway
2. Set environment variables (DATABASE_URL, JWT_SECRET, etc.)
3. Deploy automatically on push

**Frontend (Vercel):**
1. Connect repository to Vercel
2. Configure build command: `npm run build`
3. Configure start command: `npm run preview`
4. Deploy automatically on push

**Database (Managed):**
- Use Render's PostgreSQL or Railway's MySQL
- Run migrations: `pnpm db:push`

## Environment Variables

**Backend:**
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - Session signing secret
- `VITE_APP_ID` - Manus OAuth application ID
- `OAUTH_SERVER_URL` - Manus OAuth server URL
- `OWNER_OPEN_ID` - Owner's Manus OpenID
- `OWNER_NAME` - Owner's name

**Frontend:**
- `VITE_OAUTH_PORTAL_URL` - Manus login portal URL
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Logo URL

## Security Considerations

1. **Authentication:** Manus OAuth handles secure authentication
2. **Password Storage:** PBKDF2 with SHA-256 for password hashing
3. **DOI Validation:** Format validation + Crossref API verification
4. **Rate Limiting:** Consider implementing rate limiting for API endpoints
5. **CORS:** Configure CORS appropriately for production
6. **Input Validation:** All inputs validated with Zod schemas

## Performance Optimizations

1. **Database Indices:** Indices on frequently queried columns (email, DOI, user_id)
2. **Pagination:** All list endpoints support limit/offset pagination
3. **Caching:** Consider Redis for caching ranking data
4. **CDN:** Static assets served via CDN in production
5. **Lazy Loading:** Frontend pages load data on demand

## Future Enhancements

1. **ORCID Integration:** Connect researcher ORCID profiles
2. **Advanced Metrics:** Citation counts, h-index calculations
3. **Notifications:** Email notifications for ranking changes
4. **Export:** Export profile and publication data
5. **Analytics:** Dashboard for tracking trends
6. **API Access:** Public API for third-party integrations
7. **Social Features:** Follow researchers, bookmark publications
