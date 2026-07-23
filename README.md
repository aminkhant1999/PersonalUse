# Aung Songbook

Aung Songbook is a responsive personal web app for storing songs, practising lyrics and chords, and learning music theory. Published songs are available through the public library, while a protected administrator workspace handles editing and publishing.

## Highlights

- Searchable song library with language, genre, key, and sorting controls
- Lyrics-only, chords-only, and combined reader modes
- Adjustable reading size with preferences remembered on the device
- Displayed-key and capo controls that move inversely and transpose every chord in the song
- One reset control that restores the song's original displayed key, capo, and chords
- Automatic conversion of pasted chord sheets into structured lyrics-and-chords JSON
- Draft, review, publish, unpublish, and recoverable soft-delete workflow
- Music-theory course with interactive notation, rhythm, scale, interval, chord, and guitar lessons
- Lesson search, topic navigation, and previous/next lesson controls
- Responsive light and dark themes with accessible navigation and focus states

## Technology

- Node.js 22+
- Express 5
- Vanilla HTML, CSS, and JavaScript modules
- SQLite through `better-sqlite3`
- bcrypt password verification and server-side sessions
- Node's built-in test runner, Supertest, and ESLint

## Project structure

```text
client/                 Browser interface and music-theory lessons
server/app.js           Express application and API routes
server/db.js            SQLite schema, connection, and backups
server/repository.js    Song persistence and queries
server/security.js      Authentication and session handling
server/music.js         Chord transposition utilities
scripts/build.js        Production client build
test/                   API, security, workflow, parser, and music tests
```

## Local setup

1. Install Node.js 22 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your local configuration:

   ```bash
   cp .env.example .env
   ```

4. Generate an administrator password hash:

   ```bash
   npm run hash-password
   ```

5. Add the generated hash to `ADMIN_PASSWORD_HASH` in `.env`. Set `SESSION_SECRET` to a random value of at least 32 characters.
6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000).

The SQLite database is created automatically at the configured `DATABASE_URL`.

## Environment variables

| Variable | Description |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | HTTP port; defaults to `3000` |
| `DATABASE_URL` | SQLite database path; defaults to `./data/songbook.db` |
| `CLIENT_URL` | Exact permitted browser origin |
| `ADMIN_USERNAME` | Administrator login name |
| `ADMIN_PASSWORD_HASH` | bcrypt password hash; never store the plain password |
| `SESSION_SECRET` | Random session-signing value with at least 32 characters |
| `OPENAI_API_KEY` | Optional metadata-assistance key |
| `LYRICS_PROVIDER_API_KEY` | Reserved for a properly licensed lyrics provider |
| `CHORD_PROVIDER_API_KEY` | Reserved for a properly licensed chord provider |

Do not commit `.env`, production credentials, or the `data/` directory.

## Song data and persistence

Songs are stored in SQLite rather than browser storage, so restarting or refreshing the app does not remove them. The configured database directory must be on persistent storage in production.

After song creation, editing, deletion, or publication changes, the app writes a recoverable snapshot to:

```text
data/backups/songbook-latest.db
```

The database and backup directory are intentionally excluded from Git. Back them up separately when moving the app to another computer or host.

### Importing a chord sheet

In the administrator editor, paste a complete chord sheet into **Plain lyrics for search / chord-sheet import**. Section headings such as `[Intro]`, `[Verse 1]`, and `[Chorus]`, together with chord rows, are parsed automatically into the structured JSON field.

Structured content follows this shape:

```json
{
  "sections": [
    {
      "type": "verse",
      "label": "Verse 1",
      "lines": [
        {
          "lyrics": "An authorised lyric line",
          "chords": [
            { "chord": "C", "position": 0 },
            { "chord": "G", "position": 12 }
          ]
        }
      ]
    }
  ]
}
```

Always review the generated alignment before publishing.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the server in watch mode |
| `npm start` | Start the production server |
| `npm run build` | Build the production client in `dist/client` |
| `npm run lint` | Run static code checks |
| `npm test` | Run the automated test suite |
| `npm run seed` | Safely create any missing seed records |
| `npm run hash-password` | Generate a bcrypt administrator password hash |

Before committing a release:

```bash
npm run lint
npm run build
npm test
```

## Deployment

### Render

The included `render.yaml` defines a Node web service with a persistent disk for SQLite.

1. Push the repository to GitHub.
2. Create a Render Blueprint from `render.yaml`.
3. Configure `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `CLIENT_URL`.
4. Let Render generate `SESSION_SECRET`.
5. Deploy and verify `/api/health`, public song browsing, administrator login, and a song edit.

Keep a single application instance while using SQLite. Use PostgreSQL or another shared database before horizontally scaling.

### Docker

Build with the included `Dockerfile`, mount persistent storage at `/app/data`, and provide the same environment variables. Without a persistent volume, song data will disappear when the container is replaced.

## API overview

Public routes:

- `GET /api/health`
- `GET /api/songs`
- `GET /api/songs/:slug`
- `POST /api/songs/:id/open`
- `GET /api/filters`

Authentication routes:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

Protected administrator routes under `/api/admin` provide dashboard data, song management, publication controls, metadata suggestions, and job status.

## Security and content

- Authentication cookies are HTTP-only and SameSite protected.
- Write endpoints require an authenticated administrator session.
- Login attempts are rate-limited.
- Input is validated and sanitised before persistence.
- Add or publish lyrics and chord arrangements only when you have permission to store and display them.

## Troubleshooting

- **Login is unavailable:** set both `ADMIN_PASSWORD_HASH` and `SESSION_SECRET`, then restart.
- **Database cannot open:** make sure the parent directory of `DATABASE_URL` exists and is writable.
- **Songs disappear after deployment:** mount persistent storage and point `DATABASE_URL` to it.
- **A draft is missing from the public library:** publish it from the administrator dashboard.
- **Browser requests are rejected:** set `CLIENT_URL` to the exact deployed origin, including `https://`.

## License

This is a personal-use application. No licence is granted for third-party song lyrics, chord arrangements, or referenced educational material.
