# NeuroSciRank

A transparent academic ranking platform for neuroscience researchers. Showcase your work, discover peers, and track your impact through a fair, data-driven ranking system.

## Features

- **DOI-Based Publications:** Add research papers using their DOI. Metadata is automatically fetched from Crossref.
- **Transparent Ranking:** Weekly-updated rankings based on publication recency, impact, and volume.
- **Researcher Profiles:** Build your profile with institution, research field, and bio.
- **Discovery:** Search and browse researchers and publications across neuroscience.
- **Future-Ready:** Designed to support ORCID integration and additional OAuth providers.

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm)
- MySQL/TiDB database

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository>
   cd NeuroSciRank
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file with:
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/neurosci
   JWT_SECRET=your-secret-key-here
   VITE_APP_ID=your-manus-app-id
   OAUTH_SERVER_URL=https://api.manus.im
   OWNER_OPEN_ID=your-owner-id
   OWNER_NAME=Your Name
   VITE_OAUTH_PORTAL_URL=https://manus.im/oauth
   VITE_APP_TITLE=NeuroSciRank
   VITE_APP_LOGO=/logo.svg
   ```

3. **Initialize database:**
   ```bash
   pnpm db:push
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

5. **Run tests:**
   ```bash
   pnpm test
   ```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation including:
- Technology stack
- Database schema
- Ranking algorithm
- API endpoints
- Frontend architecture

## Ranking Algorithm

### Scoring Formula

Each publication contributes to a researcher's score based on:

1. **Base Score:** 10 points per publication
2. **Recency Bonus:**
   - Last year: +10 points
   - Last 3 years: +5 points
   - Last 5 years: +2 points
   - Older: +1 point
3. **Impact Bonus:** +5 points for publications in high-impact journals (Nature, Science, Cell, etc.)

**Total Score** = Sum of all publication scores

### Ranking Calculation

- Rankings are recalculated every **Sunday at 00:00 UTC**
- Users are ranked by total score (descending)
- Ties are broken by registration date (earlier = higher rank)
- Ranking history is maintained for analytics

## API Documentation

All API endpoints use tRPC for end-to-end type safety.

### Authentication

```typescript
// Get current user
const user = await trpc.auth.me.useQuery();

// Logout
await trpc.auth.logout.useMutation();
```

### User Management

```typescript
// Get current user profile
const profile = await trpc.user.getMe.useQuery();

// Update profile
await trpc.user.updateProfile.useMutation({
  name: "John Doe",
  field: "Neurobiology",
  institution: "MIT",
  bio: "Studying neural circuits..."
});

// Get public profile
const publicProfile = await trpc.user.getPublicProfile.useQuery({
  userId: 123
});
```

### Publications

```typescript
// Add publication via DOI
await trpc.publications.add.useMutation({
  doi: "10.1038/nature12373"
});

// Get user's publications
const pubs = await trpc.publications.getMyPublications.useQuery({
  limit: 50,
  offset: 0
});

// Get public user's publications
const userPubs = await trpc.publications.getUserPublications.useQuery({
  userId: 123,
  limit: 50,
  offset: 0
});
```

### Ranking

```typescript
// Get top ranked users
const topUsers = await trpc.ranking.getTopUsers.useQuery({
  limit: 50,
  offset: 0
});

// Get user's rating
const rating = await trpc.ranking.getUserRating.useQuery({
  userId: 123
});

// Admin: Manually trigger ranking recalculation
await trpc.ranking.recalculate.useMutation();
```

### Search

```typescript
// Search users and publications
const results = await trpc.search.query.useQuery({
  q: "neural circuits",
  type: "all", // "users" | "publications" | "all"
  limit: 20,
  offset: 0
});
```

## Deployment

### Deploy to Render

1. **Create Render account** at https://render.com

2. **Create PostgreSQL database:**
   - Go to Render Dashboard → New → PostgreSQL
   - Note the connection string

3. **Create Web Service:**
   - Connect your GitHub repository
   - Set build command: `pnpm install && pnpm build`
   - Set start command: `pnpm start`
   - Add environment variables:
     ```
     DATABASE_URL=<your-postgres-url>
     JWT_SECRET=<generate-random-string>
     VITE_APP_ID=<your-manus-app-id>
     OAUTH_SERVER_URL=https://api.manus.im
     OWNER_OPEN_ID=<owner-id>
     OWNER_NAME=<owner-name>
     VITE_OAUTH_PORTAL_URL=https://manus.im/oauth
     VITE_APP_TITLE=NeuroSciRank
     VITE_APP_LOGO=/logo.svg
     NODE_ENV=production
     ```

4. **Run migrations:**
   - Connect to your Render PostgreSQL
   - Run: `pnpm db:push`

### Deploy to Railway

1. **Create Railway account** at https://railway.app

2. **Create MySQL database:**
   - Go to Railway Dashboard → New → MySQL
   - Copy connection string

3. **Create Node.js service:**
   - Connect your GitHub repository
   - Add environment variables (same as above)
   - Railway will auto-detect Node.js and deploy

4. **Run migrations:**
   - Use Railway CLI or connect directly
   - Run: `pnpm db:push`

### Deploy Frontend to Vercel

1. **Create Vercel account** at https://vercel.com

2. **Import project:**
   - Connect your GitHub repository
   - Vercel auto-detects Next.js/React setup
   - Add environment variables:
     ```
     VITE_OAUTH_PORTAL_URL=https://manus.im/oauth
     VITE_APP_TITLE=NeuroSciRank
     VITE_APP_LOGO=/logo.svg
     ```

3. **Deploy:**
   - Vercel automatically deploys on push to main

## Project Structure

```
NeuroSciRank/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities and tRPC client
│   │   └── App.tsx        # Main app component
│   └── public/            # Static assets
├── server/                # Node.js backend
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database queries
│   ├── auth.ts            # Authentication utilities
│   ├── crossref.ts        # Crossref API integration
│   ├── ranking.ts         # Ranking algorithm
│   ├── jobs.ts            # Background jobs
│   └── _core/             # Framework internals
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Drizzle schema
├── ARCHITECTURE.md        # Architecture documentation
└── README.md              # This file
```

## Testing

Run the test suite:

```bash
pnpm test
```

Tests cover:
- Authentication utilities (password hashing, validation)
- Ranking algorithm (scoring calculations)
- Crossref integration (DOI validation)
- API endpoints (via vitest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests for new functionality
4. Run `pnpm test` to ensure all tests pass
5. Submit a pull request

## Security

- **Authentication:** Manus OAuth for secure login
- **Password Hashing:** PBKDF2-SHA256 for stored passwords
- **DOI Validation:** Format validation + Crossref API verification
- **Input Validation:** All inputs validated with Zod schemas
- **Database:** Prepared statements via Drizzle ORM

## Performance

- Database indices on frequently queried columns
- Pagination for all list endpoints
- Weekly ranking recalculation (not real-time)
- Static asset caching via CDN
- Lazy loading of frontend components

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
- Ensure MySQL/TiDB is running
- Check DATABASE_URL is correct
- Verify database exists

### OAuth Error
```
Error: Invalid VITE_APP_ID
```
- Verify VITE_APP_ID matches your Manus OAuth application
- Check OAUTH_SERVER_URL is correct
- Ensure callback URL is registered in Manus

### Migration Error
```
Error: Migration failed
```
- Check database permissions
- Ensure DATABASE_URL is correct
- Run: `pnpm db:push` to apply pending migrations

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
2. Review test files for usage examples
3. Open an issue on GitHub

## Roadmap

- [ ] ORCID integration
- [ ] Citation metrics
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Public API
- [ ] Social features (follow, bookmark)
- [ ] Publication recommendations
