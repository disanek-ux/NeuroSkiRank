# NeuroSciRank API Documentation

All API endpoints use tRPC for end-to-end type safety. The API base path is `/api/trpc`.

## Authentication Endpoints

### `auth.me` (Query)
Get the current authenticated user.

**Request:**
```typescript
const user = await trpc.auth.me.useQuery();
```

**Response:**
```typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}
```

### `auth.logout` (Mutation)
Logout the current user and clear session cookie.

**Request:**
```typescript
await trpc.auth.logout.useMutation();
```

**Response:**
```typescript
{ success: true }
```

## User Management Endpoints

### `user.getMe` (Query)
Get the current user's profile with rating information.

**Request:**
```typescript
const profile = await trpc.user.getMe.useQuery();
```

**Response:**
```typescript
{
  id: number;
  name: string | null;
  email: string | null;
  field: string | null;
  institution: string | null;
  bio: string | null;
  rating: {
    score: number;
    rank: number | null;
    publicationCount: number;
  } | null;
}
```

### `user.updateProfile` (Mutation)
Update the current user's profile information.

**Request:**
```typescript
await trpc.user.updateProfile.useMutation({
  name: "John Doe",
  field: "Neurobiology",
  institution: "MIT",
  bio: "Studying neural circuits and synaptic plasticity"
});
```

**Parameters:**
- `name` (optional): User's full name
- `field` (optional): Research field/specialization
- `institution` (optional): Institution name
- `bio` (optional): Short biography

**Response:**
```typescript
{
  id: number;
  name: string | null;
  email: string | null;
  field: string | null;
  institution: string | null;
  bio: string | null;
}
```

### `user.getPublicProfile` (Query)
Get a public user's profile and publications.

**Request:**
```typescript
const profile = await trpc.user.getPublicProfile.useQuery({
  userId: 123
});
```

**Parameters:**
- `userId` (required): The user ID to fetch

**Response:**
```typescript
{
  id: number;
  name: string | null;
  field: string | null;
  institution: string | null;
  bio: string | null;
  createdAt: Date;
  rating: {
    score: number;
    rank: number | null;
    publicationCount: number;
  } | null;
  publications: Publication[];
}
```

## Publication Endpoints

### `publications.add` (Mutation)
Add a new publication via DOI. Metadata is automatically fetched from Crossref.

**Request:**
```typescript
await trpc.publications.add.useMutation({
  doi: "10.1038/nature12373"
});
```

**Parameters:**
- `doi` (required): Digital Object Identifier (e.g., "10.1038/nature12373" or "https://doi.org/10.1038/nature12373")

**Response:**
```typescript
{
  success: true;
  publication: {
    doi: string;
    title: string;
    authors: string[];
    journal: string;
    year: number;
    publicationType: string;
    abstract?: string;
  };
}
```

**Errors:**
- `BAD_REQUEST`: Invalid DOI format or metadata not found
- `CONFLICT`: Publication already added by this user

### `publications.getMyPublications` (Query)
Get the current user's publications.

**Request:**
```typescript
const pubs = await trpc.publications.getMyPublications.useQuery({
  limit: 50,
  offset: 0
});
```

**Parameters:**
- `limit` (optional, default: 50): Number of results to return
- `offset` (optional, default: 0): Number of results to skip

**Response:**
```typescript
Publication[]
```

### `publications.getUserPublications` (Query)
Get a user's publications (public).

**Request:**
```typescript
const pubs = await trpc.publications.getUserPublications.useQuery({
  userId: 123,
  limit: 50,
  offset: 0
});
```

**Parameters:**
- `userId` (required): The user ID
- `limit` (optional, default: 50): Number of results to return
- `offset` (optional, default: 0): Number of results to skip

**Response:**
```typescript
Publication[]
```

## Ranking Endpoints

### `ranking.getTopUsers` (Query)
Get the top ranked users.

**Request:**
```typescript
const topUsers = await trpc.ranking.getTopUsers.useQuery({
  limit: 50,
  offset: 0
});
```

**Parameters:**
- `limit` (optional, default: 50): Number of results to return
- `offset` (optional, default: 0): Number of results to skip

**Response:**
```typescript
Array<{
  id: number;
  name: string | null;
  field: string | null;
  institution: string | null;
  score: number;
  rank: number | null;
  publicationCount: number;
}>
```

### `ranking.getUserRating` (Query)
Get a specific user's rating details.

**Request:**
```typescript
const rating = await trpc.ranking.getUserRating.useQuery({
  userId: 123
});
```

**Parameters:**
- `userId` (required): The user ID

**Response:**
```typescript
{
  id: number;
  userId: number;
  score: number;
  rank: number | null;
  publicationCount: number;
  computedAt: Date;
  updatedAt: Date;
}
```

**Errors:**
- `NOT_FOUND`: User rating not found

### `ranking.recalculate` (Mutation)
Manually trigger ranking recalculation (admin only).

**Request:**
```typescript
await trpc.ranking.recalculate.useMutation();
```

**Response:**
```typescript
{
  success: true;
  message: "Ranking recalculation triggered";
}
```

**Errors:**
- `FORBIDDEN`: Only admins can trigger recalculation
- `INTERNAL_SERVER_ERROR`: Recalculation failed

## Search Endpoints

### `search.query` (Query)
Search for users and publications.

**Request:**
```typescript
const results = await trpc.search.query.useQuery({
  q: "neural circuits",
  type: "all",
  limit: 20,
  offset: 0
});
```

**Parameters:**
- `q` (required): Search query
- `type` (optional, default: "all"): Search type - "users", "publications", or "all"
- `limit` (optional, default: 20): Number of results per type
- `offset` (optional, default: 0): Number of results to skip

**Response:**
```typescript
{
  users?: Array<{
    id: number;
    name: string | null;
    field: string | null;
    institution: string | null;
  }>;
  publications?: Publication[];
}
```

## Data Types

### Publication
```typescript
{
  id: number;
  userId: number;
  doi: string;
  title: string;
  authors: string[];
  journal: string | null;
  year: number | null;
  abstract: string | null;
  publicationType: string;
  createdAt: Date;
}
```

### User
```typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  field: string | null;
  institution: string | null;
  bio: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}
```

### UserRating
```typescript
{
  id: number;
  userId: number;
  score: number;
  rank: number | null;
  publicationCount: number;
  computedAt: Date;
  updatedAt: Date;
}
```

## Error Handling

All errors follow the tRPC error format:

```typescript
{
  code: "BAD_REQUEST" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "INTERNAL_SERVER_ERROR";
  message: string;
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `BAD_REQUEST` | Invalid input or DOI format |
| `UNAUTHORIZED` | User not authenticated |
| `FORBIDDEN` | User lacks permission (e.g., admin-only endpoint) |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource already exists (e.g., duplicate publication) |
| `INTERNAL_SERVER_ERROR` | Server error |

## Rate Limiting

Currently, there is no rate limiting implemented. Consider adding rate limiting in production using middleware.

## CORS

CORS is configured to allow requests from the frontend domain. In development, all origins are allowed.

## Authentication

All endpoints except public queries (like `ranking.getTopUsers`, `user.getPublicProfile`, `search.query`) require authentication. Authentication is handled via Manus OAuth and session cookies.

Protected endpoints will return `UNAUTHORIZED` if the user is not authenticated.

## Pagination

List endpoints support pagination via `limit` and `offset` parameters:

- `limit`: Number of results to return (default varies by endpoint)
- `offset`: Number of results to skip (default: 0)

Example:
```typescript
// Get second page of 20 results
const results = await trpc.ranking.getTopUsers.useQuery({
  limit: 20,
  offset: 20
});
```

## Timestamps

All timestamps are returned as ISO 8601 strings and automatically converted to JavaScript `Date` objects by tRPC's superjson serializer.

## Examples

### Complete User Registration Flow
```typescript
// 1. User logs in via OAuth (handled automatically)
const user = await trpc.auth.me.useQuery();

// 2. Update profile
await trpc.user.updateProfile.useMutation({
  name: "Jane Smith",
  field: "Cognitive Neuroscience",
  institution: "Stanford University",
  bio: "Researching memory consolidation"
});

// 3. Add first publication
await trpc.publications.add.useMutation({
  doi: "10.1038/nature12373"
});

// 4. Check ranking (updated weekly)
const rating = await trpc.ranking.getUserRating.useQuery({
  userId: user.id
});
```

### Search and Browse
```typescript
// Search for researchers
const results = await trpc.search.query.useQuery({
  q: "neural circuits",
  type: "users"
});

// View researcher profile
const profile = await trpc.user.getPublicProfile.useQuery({
  userId: results.users[0].id
});

// View their publications
const pubs = await trpc.publications.getUserPublications.useQuery({
  userId: results.users[0].id
});
```

### Browse Rankings
```typescript
// Get top 10 researchers
const topUsers = await trpc.ranking.getTopUsers.useQuery({
  limit: 10,
  offset: 0
});

// Get next page
const nextPage = await trpc.ranking.getTopUsers.useQuery({
  limit: 10,
  offset: 10
});
```
