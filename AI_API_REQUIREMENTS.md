# API Requirements: SourceNet AI Chat Integration

## Overview
Kami membutuhkan API backend untuk mengintegrasikan fitur AI Chat di aplikasi SourceNet. Fitur ini akan memungkinkan pengguna untuk berinteraksi dengan AI assistant yang dapat membantu mereka memahami DataPods, memberikan rekomendasi, dan menjawab pertanyaan terkait platform.

## Tech Stack Requirements
- **Framework**: NestJS (sesuai dengan arsitektur backend yang ada)
- **Database**: PostgreSQL (untuk menyimpan chat history)
- **AI Provider**: OpenAI GPT-4 atau alternatif (Claude, Gemini, dll)
- **Authentication**: Menggunakan sistem auth yang sudah ada (ZK Login)

---

## API Endpoints

### 1. POST `/api/ai/chat`
**Deskripsi**: Mengirim pesan ke AI dan mendapatkan respons

**Request Headers**:
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

**Request Body**:
```typescript
{
  "message": string;           // Pesan dari user
  "conversationId"?: string;   // Optional, untuk melanjutkan percakapan
  "context"?: {                // Optional, konteks tambahan
    "dataPodId"?: string;      // Jika chat terkait DataPod tertentu
    "page"?: string;           // Halaman saat ini (buyer, seller, detail, dll)
  }
}
```

**Response (200 OK)**:
```typescript
{
  "success": true,
  "data": {
    "conversationId": string;  // ID percakapan
    "message": string;         // Respons dari AI
    "timestamp": string;       // ISO 8601 timestamp
    "tokens": {                // Optional, untuk monitoring
      "prompt": number;
      "completion": number;
      "total": number;
    }
  }
}
```

**Response (400 Bad Request)**:
```typescript
{
  "success": false,
  "error": {
    "code": "INVALID_MESSAGE",
    "message": "Message cannot be empty"
  }
}
```

**Response (429 Too Many Requests)**:
```typescript
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": number  // Seconds until retry allowed
  }
}
```

---

### 2. GET `/api/ai/conversations`
**Deskripsi**: Mendapatkan daftar percakapan user

**Request Headers**:
```json
{
  "Authorization": "Bearer <jwt_token>"
}
```

**Query Parameters**:
```typescript
{
  "page"?: number;      // Default: 1
  "limit"?: number;     // Default: 20, Max: 100
  "sortBy"?: "createdAt" | "updatedAt";  // Default: "updatedAt"
  "order"?: "asc" | "desc";              // Default: "desc"
}
```

**Response (200 OK)**:
```typescript
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": string;
        "title": string;          // Auto-generated dari first message
        "lastMessage": string;    // Preview pesan terakhir
        "createdAt": string;
        "updatedAt": string;
        "messageCount": number;
      }
    ],
    "pagination": {
      "page": number;
      "limit": number;
      "total": number;
      "totalPages": number;
    }
  }
}
```

---

### 3. GET `/api/ai/conversations/:conversationId`
**Deskripsi**: Mendapatkan detail percakapan dan semua pesan

**Request Headers**:
```json
{
  "Authorization": "Bearer <jwt_token>"
}
```

**Response (200 OK)**:
```typescript
{
  "success": true,
  "data": {
    "conversation": {
      "id": string;
      "title": string;
      "createdAt": string;
      "updatedAt": string;
      "messages": [
        {
          "id": string;
          "role": "user" | "assistant";
          "content": string;
          "timestamp": string;
        }
      ]
    }
  }
}
```

**Response (404 Not Found)**:
```typescript
{
  "success": false,
  "error": {
    "code": "CONVERSATION_NOT_FOUND",
    "message": "Conversation not found"
  }
}
```

---

### 4. DELETE `/api/ai/conversations/:conversationId`
**Deskripsi**: Menghapus percakapan

**Request Headers**:
```json
{
  "Authorization": "Bearer <jwt_token>"
}
```

**Response (200 OK)**:
```typescript
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

---

### 5. POST `/api/ai/chat/stream` (Optional - Nice to Have)
**Deskripsi**: Streaming response dari AI untuk UX yang lebih baik

**Request**: Same as `/api/ai/chat`

**Response**: Server-Sent Events (SSE)
```
event: message
data: {"chunk": "Hello", "done": false}

event: message
data: {"chunk": " there!", "done": false}

event: message
data: {"chunk": "", "done": true, "conversationId": "xxx"}
```

---

## Database Schema

### Table: `ai_conversations`
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_updated_at (updated_at)
);
```

### Table: `ai_messages`
```sql
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  context JSONB,  -- Untuk menyimpan context seperti dataPodId, page, dll
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_created_at (created_at)
);
```

---

## AI System Prompt

Berikut adalah system prompt yang harus digunakan untuk AI:

```
You are SourceNet AI, an intelligent assistant for the SourceNet platform - a decentralized data marketplace built on the Sui blockchain.

Your role is to help users:
1. Understand how to buy and sell DataPods (encrypted data packages)
2. Navigate the platform features
3. Understand blockchain transactions and Walrus storage
4. Answer questions about data privacy and encryption
5. Provide recommendations for DataPods based on user needs

Key platform features:
- DataPods: Encrypted data packages stored on Walrus (decentralized storage)
- Blockchain: Sui blockchain for transactions and ownership
- Encryption: Client-side encryption/decryption for data privacy
- Escrow: On-chain escrow system for secure payments
- ZK Login: Zero-knowledge proof authentication

Guidelines:
- Be helpful, concise, and accurate
- If you don't know something, admit it
- Provide step-by-step guidance when needed
- Use simple language, avoid excessive technical jargon
- Always prioritize user privacy and security

When discussing DataPods, you can reference:
- Title, description, category, and price
- Seller information (if public)
- File metadata (size, type)

Never:
- Make up information about specific DataPods
- Provide financial advice
- Share private user information
- Execute transactions on behalf of users
```

---

## Business Logic Requirements

### 1. Rate Limiting
- **Per User**: 20 requests per minute
- **Per IP**: 100 requests per minute
- Gunakan Redis untuk tracking

### 2. Context Awareness
Ketika user memberikan `dataPodId` dalam context:
1. Fetch DataPod details dari database
2. Include informasi DataPod dalam prompt ke AI
3. Format:
```
User is viewing DataPod:
- Title: [title]
- Description: [description]
- Category: [category]
- Price: [price] SUI
- Seller: [seller_name]
```

### 3. Conversation Title Generation
- Auto-generate title dari first user message
- Gunakan AI untuk summarize (max 50 characters)
- Fallback: Truncate first message

### 4. Token Management
- Track token usage per request
- Store di `ai_messages.tokens_used`
- Optional: Implement user quota/limits

### 5. Error Handling
- Retry logic untuk AI API failures (max 3 retries)
- Fallback response jika AI unavailable:
  ```
  "I'm currently experiencing technical difficulties. Please try again in a moment."
  ```

### 6. Security
- Validate user owns conversation before access
- Sanitize user input (prevent prompt injection)
- Rate limit per user and IP
- Log all AI interactions for audit

---

## Environment Variables

```env
# AI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Rate Limiting
RATE_LIMIT_PER_USER=20
RATE_LIMIT_WINDOW=60000  # 1 minute in ms

# Redis (for rate limiting)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

---

## Testing Requirements

### Unit Tests
- [ ] Message validation
- [ ] Conversation creation
- [ ] Token counting
- [ ] Rate limiting logic

### Integration Tests
- [ ] POST `/api/ai/chat` - successful chat
- [ ] POST `/api/ai/chat` - with context (dataPodId)
- [ ] GET `/api/ai/conversations` - pagination
- [ ] GET `/api/ai/conversations/:id` - conversation details
- [ ] DELETE `/api/ai/conversations/:id` - delete conversation
- [ ] Rate limiting enforcement

### E2E Tests
- [ ] Full conversation flow
- [ ] Multiple users, isolated conversations
- [ ] Context-aware responses

---

## Performance Requirements

- **Response Time**: < 3 seconds for non-streaming
- **Streaming**: First chunk within 1 second
- **Database Queries**: Optimized with proper indexes
- **Caching**: Cache frequent queries (e.g., conversation list)

---

## Monitoring & Logging

### Metrics to Track
- Total requests per endpoint
- Average response time
- Token usage (total, per user)
- Error rate
- Rate limit hits

### Logs
```typescript
{
  "timestamp": "2025-11-23T13:00:00Z",
  "userId": "uuid",
  "conversationId": "uuid",
  "endpoint": "/api/ai/chat",
  "tokensUsed": 150,
  "responseTime": 1250,
  "status": "success"
}
```

---

## Migration Path

1. **Phase 1**: Basic chat endpoint (`POST /api/ai/chat`)
2. **Phase 2**: Conversation management (GET, DELETE)
3. **Phase 3**: Context awareness (DataPod integration)
4. **Phase 4**: Streaming support (Optional)
5. **Phase 5**: Advanced features (voice, image analysis)

---

## Questions for Backend Team

1. Apakah kita sudah punya OpenAI API key atau perlu setup account baru?
2. Apakah Redis sudah tersedia untuk rate limiting?
3. Berapa budget token per bulan untuk AI API?
4. Apakah perlu implement user quota/limits?
5. Apakah streaming response diperlukan di fase 1?

---

## Frontend Integration Notes

Frontend sudah memiliki komponen AI Chat di:
- `app/components/AIChatWidget.tsx`

Frontend akan memanggil API dengan format:
```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: userMessage,
    conversationId: currentConversationId,
    context: {
      dataPodId: currentDataPodId,
      page: 'detail'
    }
  })
});
```

---

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

## Priority

**HIGH PRIORITY**:
- POST `/api/ai/chat` (basic)
- Database schema
- Rate limiting
- Authentication

**MEDIUM PRIORITY**:
- GET `/api/ai/conversations`
- GET `/api/ai/conversations/:id`
- Context awareness

**LOW PRIORITY**:
- DELETE conversations
- Streaming support
- Advanced analytics
