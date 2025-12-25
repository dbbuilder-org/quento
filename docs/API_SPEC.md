# API Specification
## Quento Backend Services

**Version:** 1.0
**Last Updated:** December 2025
**Base URL:** `https://api.quento.app/v1`
**AI Development Partner:** ServiceVision (https://www.servicevision.net)

---

## 1. Overview

### 1.1 API Design Principles

- **RESTful** - Standard REST conventions for predictability
- **JSON** - All request/response bodies use JSON
- **Versioned** - API version in URL path (`/v1/`)
- **Authenticated** - JWT-based authentication for protected routes
- **Rate Limited** - Per-user and per-endpoint limits
- **Documented** - OpenAPI 3.0 specification

### 1.2 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens are obtained via the `/auth/login` endpoint and expire after 15 minutes.
Use the `/auth/refresh` endpoint with a refresh token to obtain new access tokens.

### 1.3 Common Response Formats

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-12-25T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      {"field": "email", "message": "This field is required"}
    ]
  },
  "meta": {
    "timestamp": "2025-12-25T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### 1.4 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `AI_UNAVAILABLE` | 503 | AI services temporarily unavailable |

---

## 2. Authentication Endpoints

### 2.1 Register

Create a new user account.

```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "full_name": "Jane Smith",
  "company_name": "Smith Bakery"
}
```

**Validation:**
- `email`: Required, valid email format
- `password`: Required, min 8 chars, must include number and special char
- `full_name`: Optional, max 255 chars
- `company_name`: Optional, max 255 chars

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "full_name": "Jane Smith",
      "company_name": "Smith Bakery",
      "current_ring": 1,
      "created_at": "2025-12-25T10:30:00Z"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_in": 900
    }
  }
}
```

---

### 2.2 Login

Authenticate and obtain tokens.

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "full_name": "Jane Smith",
      "current_ring": 2
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_in": 900
    }
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```

---

### 2.3 Refresh Token

Obtain a new access token using a refresh token.

```
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 900
  }
}
```

---

### 2.4 Logout

Invalidate the current session.

```
POST /auth/logout
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

---

### 2.5 Forgot Password

Request a password reset email.

```
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "If an account exists, a reset link has been sent"
  }
}
```

---

### 2.6 Reset Password

Complete password reset with token from email.

```
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "newSecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Password successfully reset"
  }
}
```

---

## 3. Chat/Conversation Endpoints

### 3.1 Create Session

Start a new conversation session.

```
POST /chat/sessions
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "initial_context": {
    "source": "onboarding",
    "business_type": "bakery"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "ses_xyz789",
      "user_id": "usr_abc123",
      "ring_phase": "core",
      "status": "active",
      "created_at": "2025-12-25T10:30:00Z"
    },
    "initial_message": {
      "id": "msg_001",
      "role": "assistant",
      "content": "Welcome! I'm excited to learn about your business. Let's start with the most important thing: your story. What does your business do, and what makes it special?",
      "created_at": "2025-12-25T10:30:00Z"
    }
  }
}
```

---

### 3.2 List Sessions

Get all conversation sessions for the current user.

```
GET /chat/sessions
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status`: Filter by status (`active`, `archived`) - optional
- `limit`: Max results (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "ses_xyz789",
        "title": "Austin Bakery Growth Plan",
        "ring_phase": "plan",
        "status": "active",
        "message_count": 24,
        "last_message_at": "2025-12-25T10:30:00Z",
        "created_at": "2025-12-20T08:00:00Z"
      }
    ],
    "pagination": {
      "total": 3,
      "limit": 20,
      "offset": 0,
      "has_more": false
    }
  }
}
```

---

### 3.3 Get Session

Get details of a specific session including messages.

```
GET /chat/sessions/{session_id}
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `message_limit`: Number of messages to include (default: 50)
- `message_offset`: Message pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "ses_xyz789",
      "title": "Austin Bakery Growth Plan",
      "ring_phase": "plan",
      "status": "active",
      "business_context": {
        "business_name": "Austin Sourdough",
        "industry": "Food & Beverage",
        "location": "Austin, TX",
        "goals": ["Increase online orders", "Build social presence"]
      },
      "created_at": "2025-12-20T08:00:00Z",
      "updated_at": "2025-12-25T10:30:00Z"
    },
    "messages": [
      {
        "id": "msg_001",
        "role": "assistant",
        "content": "Welcome! I'm excited to learn about your business...",
        "created_at": "2025-12-20T08:00:00Z"
      },
      {
        "id": "msg_002",
        "role": "user",
        "content": "We're a small organic bakery in Austin...",
        "created_at": "2025-12-20T08:01:00Z"
      }
    ],
    "message_pagination": {
      "total": 24,
      "limit": 50,
      "offset": 0,
      "has_more": false
    }
  }
}
```

---

### 3.4 Send Message

Send a message in a conversation session.

```
POST /chat/sessions/{session_id}/messages
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "content": "We're a small organic bakery in Austin. We focus on sourdough and pastries made with local ingredients.",
  "attachments": []
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_message": {
      "id": "msg_002",
      "role": "user",
      "content": "We're a small organic bakery in Austin...",
      "created_at": "2025-12-25T10:30:00Z"
    },
    "assistant_message": {
      "id": "msg_003",
      "role": "assistant",
      "content": "A local organic bakery! That's a story people connect with. The farm-to-table movement is strong in Austin...",
      "created_at": "2025-12-25T10:30:02Z",
      "metadata": {
        "ring_phase": "core",
        "tokens_used": 245,
        "suggested_actions": ["share_website", "describe_customers"]
      }
    },
    "session_update": {
      "ring_phase": "core",
      "should_advance": false
    }
  }
}
```

---

### 3.5 Delete Session

Delete (archive) a conversation session.

```
DELETE /chat/sessions/{session_id}
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Session archived successfully"
  }
}
```

---

## 4. Analysis Endpoints

### 4.1 Start Analysis

Begin a new web presence analysis.

```
POST /analysis
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "website_url": "https://austinsourdough.com",
  "session_id": "ses_xyz789",
  "include_competitors": true,
  "include_social": true
}
```

**Validation:**
- `website_url`: Required, valid URL
- `session_id`: Optional, links analysis to conversation
- `include_competitors`: Optional, default true
- `include_social`: Optional, default true

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "id": "ana_def456",
      "website_url": "https://austinsourdough.com",
      "status": "pending",
      "progress": 0,
      "estimated_time_seconds": 45,
      "created_at": "2025-12-25T10:30:00Z"
    }
  }
}
```

---

### 4.2 List Analyses

Get all analyses for the current user.

```
GET /analysis
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status`: Filter by status (`pending`, `processing`, `completed`, `failed`)
- `limit`: Max results (default: 20)
- `offset`: Pagination offset

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "analyses": [
      {
        "id": "ana_def456",
        "website_url": "https://austinsourdough.com",
        "status": "completed",
        "overall_score": 73,
        "completed_at": "2025-12-25T10:31:00Z",
        "created_at": "2025-12-25T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 2,
      "limit": 20,
      "offset": 0
    }
  }
}
```

---

### 4.3 Get Analysis

Get detailed analysis results.

```
GET /analysis/{analysis_id}
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "id": "ana_def456",
      "website_url": "https://austinsourdough.com",
      "status": "completed",
      "progress": 100,
      "created_at": "2025-12-25T10:30:00Z",
      "completed_at": "2025-12-25T10:31:00Z",
      "results": {
        "overall_score": 73,
        "scores": {
          "seo": 68,
          "content": 82,
          "mobile": 90,
          "speed": 65,
          "social": 45
        },
        "content_analysis": {
          "summary": "The website effectively communicates the artisan nature of the bakery...",
          "key_messages": [
            "Locally sourced ingredients",
            "Handcrafted sourdough",
            "Family recipes"
          ],
          "word_count": 1250,
          "reading_level": "8th grade"
        },
        "seo_analysis": {
          "title": "Austin Sourdough | Artisan Bakery",
          "meta_description": "Handcrafted sourdough bread...",
          "issues": [
            {
              "severity": "high",
              "issue": "Missing H1 on products page",
              "recommendation": "Add descriptive H1 heading"
            }
          ]
        },
        "competitors": [
          {
            "name": "Easy Tiger Bake Shop",
            "url": "https://easytigerusa.com",
            "strengths": ["Strong SEO", "Active social media"],
            "seo_score": 85
          }
        ],
        "social_presence": {
          "platforms": {
            "instagram": {
              "found": true,
              "followers": 2340,
              "engagement_rate": "3.2%"
            },
            "facebook": {
              "found": true,
              "followers": 1890
            }
          }
        },
        "quick_wins": [
          "Add meta descriptions to product pages",
          "Optimize images with alt text",
          "Add Google Business profile"
        ]
      }
    }
  }
}
```

---

### 4.4 Get Analysis Status

Poll for analysis progress (useful for real-time updates).

```
GET /analysis/{analysis_id}/status
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "processing",
    "progress": 65,
    "current_step": "Analyzing competitor websites",
    "steps_completed": [
      "Website scraping",
      "Content extraction",
      "SEO analysis"
    ],
    "steps_remaining": [
      "Competitor analysis",
      "Social presence scan",
      "Final synthesis"
    ]
  }
}
```

---

### 4.5 Delete Analysis

Delete an analysis and its results.

```
DELETE /analysis/{analysis_id}
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Analysis deleted successfully"
  }
}
```

---

## 5. Strategy Endpoints

### 5.1 Generate Strategy

Generate a strategy from analysis results.

```
POST /strategy/generate
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "analysis_id": "ana_def456",
  "session_id": "ses_xyz789",
  "preferences": {
    "budget": "low",
    "timeline": "3_months",
    "team_size": "solo",
    "focus_areas": ["social_media", "local_seo"]
  }
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "strategy": {
      "id": "str_ghi789",
      "status": "generating",
      "analysis_id": "ana_def456",
      "created_at": "2025-12-25T10:35:00Z"
    }
  }
}
```

---

### 5.2 List Strategies

Get all strategies for the current user.

```
GET /strategy
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "strategies": [
      {
        "id": "str_ghi789",
        "title": "Austin Sourdough Growth Strategy",
        "status": "active",
        "action_items_total": 12,
        "action_items_completed": 3,
        "created_at": "2025-12-25T10:35:00Z"
      }
    ]
  }
}
```

---

### 5.3 Get Strategy

Get detailed strategy with recommendations and action items.

```
GET /strategy/{strategy_id}
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "strategy": {
      "id": "str_ghi789",
      "title": "Austin Sourdough Growth Strategy",
      "status": "active",
      "executive_summary": "Austin Sourdough can become the go-to destination for artisan bread lovers by amplifying their local, organic story across digital channels.",
      "vision_statement": "To be Austin's most beloved bakery, known for quality, community, and authentic craft.",
      "key_strengths": [
        "Authentic brand story with local focus",
        "Quality product with loyal customer base",
        "Good foundation for online ordering"
      ],
      "critical_gaps": [
        "Limited social media presence",
        "SEO optimization needed",
        "No email marketing"
      ],
      "recommendations": [
        {
          "id": "rec_001",
          "title": "Social Media Presence",
          "priority": "high",
          "summary": "Build an engaging Instagram presence showcasing the baking process",
          "impact": "Increase brand awareness and customer engagement",
          "current_state": "Minimal posting, low engagement",
          "target_state": "Regular posting schedule with 5K+ engaged followers"
        }
      ],
      "action_items": [
        {
          "id": "act_001",
          "title": "Create Instagram content calendar",
          "description": "Plan 4 weeks of Instagram content focusing on behind-the-scenes baking",
          "recommendation_id": "rec_001",
          "priority": "high",
          "effort": "medium",
          "category": "social_media",
          "status": "pending",
          "expected_impact": "Foundation for consistent social presence"
        }
      ],
      "ninety_day_priorities": [
        "Launch consistent Instagram presence",
        "Optimize Google Business profile",
        "Set up basic email capture"
      ],
      "created_at": "2025-12-25T10:35:00Z",
      "updated_at": "2025-12-25T10:40:00Z"
    }
  }
}
```

---

### 5.4 Update Action Items

Update the status of action items.

```
PUT /strategy/{strategy_id}/actions
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "updates": [
    {
      "action_id": "act_001",
      "status": "completed",
      "notes": "Created 4-week content calendar in Notion"
    },
    {
      "action_id": "act_002",
      "status": "in_progress"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "updated": 2,
    "action_items": [
      {
        "id": "act_001",
        "status": "completed",
        "completed_at": "2025-12-25T11:00:00Z"
      },
      {
        "id": "act_002",
        "status": "in_progress"
      }
    ],
    "progress": {
      "total": 12,
      "completed": 4,
      "in_progress": 1,
      "pending": 7,
      "completion_percentage": 33
    }
  }
}
```

---

### 5.5 Export Strategy

Export strategy to various formats.

```
POST /strategy/{strategy_id}/export
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "format": "pdf",
  "include_sections": ["summary", "recommendations", "action_items"],
  "branding": {
    "include_logo": true,
    "primary_color": "#2D5A3D"
  }
}
```

**Supported Formats:**
- `pdf` - Formatted PDF document
- `markdown` - Markdown file
- `notion` - Notion-compatible export
- `trello` - Trello board JSON

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "download_url": "https://api.quento.app/exports/str_ghi789_export.pdf",
    "expires_at": "2025-12-25T12:00:00Z",
    "format": "pdf",
    "file_size": 245678
  }
}
```

---

## 6. User Endpoints

### 6.1 Get Current User

Get the current authenticated user's profile.

```
GET /users/me
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "full_name": "Jane Smith",
      "company_name": "Austin Sourdough",
      "current_ring": 3,
      "settings": {
        "notifications_enabled": true,
        "email_updates": "weekly",
        "theme": "light"
      },
      "usage": {
        "analyses_this_month": 2,
        "strategies_generated": 1,
        "tokens_used_today": 12500
      },
      "created_at": "2025-12-01T08:00:00Z",
      "last_login_at": "2025-12-25T10:00:00Z"
    }
  }
}
```

---

### 6.2 Update User

Update user profile and settings.

```
PUT /users/me
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "full_name": "Jane M. Smith",
  "company_name": "Austin Sourdough Co.",
  "settings": {
    "notifications_enabled": true,
    "email_updates": "daily"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "full_name": "Jane M. Smith",
      "company_name": "Austin Sourdough Co.",
      "settings": {
        "notifications_enabled": true,
        "email_updates": "daily"
      },
      "updated_at": "2025-12-25T11:00:00Z"
    }
  }
}
```

---

### 6.3 Get Progress

Get user's journey progress through the Rings of Growth.

```
GET /users/me/progress
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "current_ring": 3,
    "rings": {
      "core": {
        "status": "completed",
        "completed_at": "2025-12-20T09:00:00Z",
        "insights": ["Business story captured", "Goals identified"]
      },
      "discover": {
        "status": "completed",
        "completed_at": "2025-12-21T10:00:00Z",
        "insights": ["Website analyzed", "Competitors identified"]
      },
      "plan": {
        "status": "in_progress",
        "started_at": "2025-12-22T08:00:00Z",
        "insights": ["Strategy generated", "12 action items created"]
      },
      "execute": {
        "status": "locked",
        "unlock_requirements": ["Complete strategy review"]
      },
      "optimize": {
        "status": "locked",
        "unlock_requirements": ["Complete initial action items"]
      }
    },
    "milestones": [
      {
        "title": "First Analysis Complete",
        "achieved_at": "2025-12-21T10:00:00Z"
      },
      {
        "title": "Strategy Generated",
        "achieved_at": "2025-12-22T09:00:00Z"
      }
    ],
    "days_active": 5,
    "total_conversations": 3,
    "total_messages": 47
  }
}
```

---

### 6.4 Delete Account

Delete user account and all associated data.

```
DELETE /users/me
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "confirmation": "DELETE_MY_ACCOUNT",
  "password": "currentPassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Account scheduled for deletion. You have 30 days to recover your account by logging in.",
    "deletion_date": "2026-01-24T00:00:00Z"
  }
}
```

---

## 7. WebSocket API

### 7.1 Chat WebSocket

Real-time chat connection for streaming AI responses.

```
WebSocket: wss://api.quento.app/ws/chat/{session_id}
```

**Connection:**
```javascript
const ws = new WebSocket(
  `wss://api.quento.app/ws/chat/${sessionId}`,
  ['Authorization', accessToken]
);
```

**Client Messages:**

```json
// Send message
{
  "type": "message",
  "content": "Tell me more about SEO optimization"
}

// Typing indicator
{
  "type": "typing",
  "is_typing": true
}

// Request message history
{
  "type": "history",
  "limit": 20
}
```

**Server Messages:**

```json
// AI response streaming
{
  "type": "stream",
  "message_id": "msg_004",
  "content": "SEO optimization ",
  "is_complete": false
}

// Stream complete
{
  "type": "stream_complete",
  "message_id": "msg_004",
  "full_content": "SEO optimization is crucial for...",
  "metadata": {
    "tokens_used": 245,
    "ring_phase": "plan"
  }
}

// Ring advancement
{
  "type": "ring_advance",
  "from_ring": 2,
  "to_ring": 3,
  "message": "Congratulations! You've completed the Discover phase."
}

// Error
{
  "type": "error",
  "code": "RATE_LIMITED",
  "message": "Please wait before sending another message"
}
```

---

### 7.2 Analysis WebSocket

Real-time updates for analysis progress.

```
WebSocket: wss://api.quento.app/ws/analysis/{analysis_id}
```

**Server Messages:**

```json
// Progress update
{
  "type": "progress",
  "progress": 45,
  "current_step": "Analyzing SEO structure",
  "message": "Found 12 pages to analyze"
}

// Step complete
{
  "type": "step_complete",
  "step": "seo_analysis",
  "partial_results": {
    "seo_score": 68,
    "issues_found": 5
  }
}

// Analysis complete
{
  "type": "complete",
  "analysis_id": "ana_def456",
  "overall_score": 73,
  "redirect_to": "/analysis/ana_def456"
}

// Error
{
  "type": "error",
  "code": "SCRAPING_FAILED",
  "message": "Unable to access website. Please check the URL."
}
```

---

## 8. Rate Limiting

### 8.1 Limits

| Endpoint Category | Rate Limit | Window |
|-------------------|------------|--------|
| Authentication | 10 requests | 1 minute |
| Chat messages | 30 requests | 1 minute |
| Analysis start | 5 requests | 1 hour |
| Strategy generation | 3 requests | 1 hour |
| General API | 100 requests | 1 minute |

### 8.2 Headers

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703505600
```

### 8.3 Rate Limited Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 45
  }
}
```

---

## 9. OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:

```
GET /openapi.json
GET /openapi.yaml
```

Interactive documentation (Swagger UI):
```
GET /docs
```

Alternative documentation (ReDoc):
```
GET /redoc
```

---

*API Specification maintained by ServiceVision AI Development Team*
