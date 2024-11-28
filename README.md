# Permission System Service

A scalable and efficient hierarchical tweet permission management system built with GraphQL.

---

## Table of Contents
1. [Overview](#overview)  
2. [Technology Stack](#technology-stack)  
3. [Architecture Decisions](#architecture-decisions)  
4. [GraphQL Schema Changes](#graphql-schema-changes)  
5. [Deployment](#deployment)  
6. [Database](#database)  
7. [Future Improvements](#future-improvements)

---

## Overview

This service manages tweet permissions with high performance and scalability by leveraging a denormalized permission model and asynchronous updates.

---

## Technology Stack

- **Remix.js**: Chosen for its ease of integration with modern APIs.
- **PostgreSQL & Prisma**: Provides type-safe database interactions and efficient schema migrations.
- **GraphQL Yoga**: Lightweight, modern GraphQL server with excellent performance and developer experience.
- **Bull/Redis**: Ensures reliable asynchronous job processing for permission updates.
- **Docker**: Simplifies deployment and scaling with containerized environments.

---

## Architecture Decisions

### Flattened Permission Model
- **Why?** Reduces database JOIN operations (specially when we have large tables), optimizing query speed at the cost of increased storage usage and some delays propagating permission updates.
- **How?** Tweets store a flattened array of authorized user IDs, combining direct and inherited group permissions. 
- **Example:**  
  If user `123` and group `A` (with members `456` and `789`) have access, the tweet stores:
  ```json
  {
    "viewUserIds": ["123", "456", "789"]
  }
  ```
  This allows fast permission checks without complex JOIN operations.

---

### Asynchronous Permission Updates
- **Why?** Prevents API timeouts during deep hierarchical permission changes by using background processing.
- **How?** Permissions are updated using a Bull/Redis queue, allowing immediate request acknowledgment while updates are processed in the background.
- **Scaling:** Horizontal scaling is possible by adding more worker instances, and vertical scaling by optimizing batch sizes and permission propagating process.
- **Example:**  
  If user `123` loses access to a parent tweet, workers process child tweet permissions in batches, ensuring fast updates without blocking.

---

## GraphQL Schema Changes

### User Type Addition
- Introduced a `User` type to improve type safety and better represent user data within the GraphQL schema.

### Flexible Group Creation
- Made `userIds` and `groupIds` optional when creating groups, allowing for flexible group definitions that support both users and subgroups.

### Simplified Permission Management
- **View Permissions**: Split into `viewPermissionsUsers` and `viewPermissionsGroups`.
- **Edit Permissions**: Split into `editPermissionsUsers` and `editPermissionsGroups`.
- **Benefits**: Reduces input complexity and eliminates the need for duplicate ID checks, preventing conflicts where IDs like "123" could refer to either a user or a group.

---
## Database

### Primary Indexes
- `t_tweet(id)`
- `t_user(id)`
- `t_group(id)`

### Performance Indexes
- `t_tweet(authorId)`: Optimizes filtering tweets by author
- `t_tweet(parentTweetId)`: Speeds up hierarchical tweet queries
- `t_tweet(category, createdAt)`: Improves category-based pagination order by tweet's creation time
- `t_group_user(groupId, userId)`: Fast group membership checks
- `t_group_group(parentGroupId)`: Efficient group hierarchy traversal

### Benefits
- Reduced query execution time 
- Faster JOIN operations on foreign keys
- Efficient filtering and sorting
- Quick permission validation checks

### Trade-offs
- Additional disk space usage
- Slight write operation overhead
- Index maintenance during updates

---

## Deployment

### Prerequisites
- Docker
- Docker Compose

### Container Architecture
- **App**: The main GraphQL API service.
- **Worker**: Processes permission updates asynchronously.
- **DB**: PostgreSQL database.
- **Redis**: Handles the job queue for permission updates.

### Build & Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Logs & Debugging
```bash
docker-compose logs -f
```

### GraphQL Endpoint
- [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql)

---

## Future Improvements

### Caching
- Implement Prisma second-level caching to reduce database load.
- Introduce GraphQL response caching in Yoga for faster query responses.
- Add a Redis caching layer for frequently accessed data (e.g. (tweetId-userId)----canEdit---> false).

### Performance
- Configure Prisma connection pooling for better database handling under high load.
- Implement rate limiting to prevent API abuse.
- Optimize permission inheritance queries for faster hierarchical updates.

### Monitoring
- Integrate error tracking tools (e.g., Sentry) for improved issue detection.
- Log all errors with a reference number into file
