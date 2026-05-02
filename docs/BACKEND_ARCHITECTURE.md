# Backend Architecture - v1 Chat Application

## 1. High Level Architecture
- **API Server:** Node.js + Express
- **Realtime Layer:** Socket.io (abstracts WebSocket management, handles presence, rooms/channels, reconnections natively).
- **Database Layer (Conceptual):** PostgreSQL for durable storage. (Implemented as mock relational structures in the prototype).
- **Cache / PubSub:** Redis (mocked in prototype via Node EventEmitters / Maps).
- **Media Storage:** S3-compatible Blob storage (mocked via local static directory).

## 2. Message Flow
1. **Connect:** Authenticated connection via `socket.handshake.auth.token`.
2. **Channel Join:** User joins `user:${userId}` room for global events, and `chat:${chatId}` for active rooms.
3. **Sending:** Client emits `message:send(payload)`.
   - Server processes to relational DB `messages` table.
   - Dispatches via Redis pub/sub.
   - All server nodes receive pub/sub event, emit to `chat:${chatId}`.
4. **Offline:** If recipients are not in `chat:${chatId}`, they will fetch the history via REST sync upon reconnecting, or via a `/api/chats?since=` polling fallback.

## 3. Database Schema (Postgres-like Conceptual)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50),
  last_seen TIMESTAMP
);

CREATE TABLE chats (
  id UUID PRIMARY KEY,
  type ENUM('direct', 'group'),
  last_message_id UUID,
  updated_at TIMESTAMP
);

CREATE TABLE chat_participants (
  chat_id UUID,
  user_id UUID,
  role ENUM('admin', 'member'),
  unread_count INT,
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES chats(id),
  sender_id UUID REFERENCES users(id),
  content TEXT,
  media_url TEXT,
  status ENUM('sent', 'delivered', 'read'),
  created_at TIMESTAMP
);
```

## 4. Scalability Strategy
- The Express/Socket.io servers are stateless.
- Use `socket.io-redis-adapter` to share events across horizontally scaled nodes.
- For chat list load optimization: Cache recent chat lists in Redis sorted sets.
- Message pagination uses cursor-based pagination (e.g. `?cursor={message_uuid}`) to guarantee consistency as new messages arrive.

## 5. Security (Non-E2EE)
- JWT validated at the gateway / socket connection handshake.
- Payload sanitization to defend against XSS.
- Rate limiting message emission (e.g., max 10 messages/sec/user) via Redis token bucket.
