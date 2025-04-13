# Social Network API

This project implements a social network API using hexagonal architecture with TypeScript and Prisma ORM.

## Available Endpoints

### User Endpoints

- `POST /api/users` - Create a new user

  - Request body: `{ "name": "username" }`
  - Response: 201 Created

- `POST /api/users/:user/follow` - Follow another user

  - Request body: `{ "userToFollow": "username" }`
  - Response: 200 OK

- `GET /api/users/:user/timeline` - View a user's timeline

  - Response: 200 OK with timeline data

- `GET /api/users/:user/wall` - View a user's wall (their posts + posts from followed users)
  - Response: 200 OK with wall data

### Message Endpoints

- `POST /api/messages` - Post a new message

  - Request body: `{ "author": "username", "text": "message content" }`
  - Response: 201 Created

- `PUT /api/messages/:messageId` - Edit a message
  - Request body: `{ "text": "new message content" }`
  - Response: 200 OK

## Running the Application

```bash
# Start the server
npm run start

# Using the API with curl examples
# Create a user
curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"Alice"}'

# Post a message
curl -X POST http://localhost:3000/api/messages -H "Content-Type: application/json" -d '{"author":"Alice","text":"Hello, world!"}'

# View a timeline
curl -X GET http://localhost:3000/api/users/Alice/timeline

# Follow a user
curl -X POST http://localhost:3000/api/users/Alice/follow -H "Content-Type: application/json" -d '{"userToFollow":"Bob"}'

# View a wall
curl -X GET http://localhost:3000/api/users/Alice/wall

# Edit a message
curl -X PUT http://localhost:3000/api/messages/1234 -H "Content-Type: application/json" -d '{"text":"Updated message"}'
```

### Testing Script

A test script is provided to quickly test all API endpoints:

```bash
# Make sure the server is running first
npm run start

# In another terminal, run the test script
./scripts/test-api.sh
```

This script will:

1. Create test users (Alice, Bob, Charlie)
2. Post messages from each user
3. Get Alice's timeline
4. Make Alice follow Bob and Charlie
5. Get Alice's wall (which should now include posts from Bob and Charlie)

## Architecture

This project follows hexagonal architecture:

- **Domain**: Contains the business entities and rules
- **Application**: Contains the use cases and secondary ports
- **Interface**: Contains the primary adapters (API, CLI)
- **Infrastructure**: Contains the secondary adapters (repositories, persistence)

## Technologies

- Node.js
- TypeScript
- Express
- Prisma ORM
