# Backend Engineering Action Items & Integration Specification

This document provides a comprehensive list of all required backend updates, API contract changes, bug fixes, database schema additions, and background workers needed for the **Client-Agency Portal**.

---

## 1. Bug Fixes & API Behavior Adjustments

### 1.1 Admin-Only Client Account Creation (`POST /api/auth/register`)
- **Business Rule**: Clients **do not self-register**. Agency account managers create client accounts directly from the Agency Dashboard (`agency-front`) and provide the login credentials to their clients.
- **Route Specification**:
  - `POST /api/auth/register` must be a **protected route** requiring an Agency Admin Bearer token header (`Authorization: Bearer <agencyToken>`).
  - **Request Body**:
    ```json
    {
      "name": "Ahmed Ali",
      "email": "client@acmedesign.com",
      "password": "Password123",
      "companyName": "Acme Media Corp",
      "contactPhone": "+201000000000",
      "role": "client"
    }
    ```
  - **Response**: `201 Created` returning the created client profile and user ID.

### 1.2 Validation on Empty Query Parameters (`GET /api/requests`)
- **Current Behavior**: Passing empty strings like `GET /api/requests?status=&priority=` returns `400 Validation Error: Invalid enum value received ''`.
- **Required Change**: Treat empty string query parameters (`""`) as `undefined`/all records instead of throwing Zod/Joi validation errors.

### 1.3 Request Status Update Endpoint (`PATCH /api/requests/:id/status`)
- **Current Behavior**: `PATCH /api/requests/:id` and `PUT /api/requests/:id` return `404 Not Found`.
- **Required Change**: Implement `PATCH /api/requests/:id/status` endpoint:
  - **Request Body**: `{ "status": "submitted" | "in_review" | "in_progress" | "done" | "rejected" }`
  - **Action**: Updates request status in DB and emits real-time Socket.io notification (`request_status_updated`).

---

## 2. Social Media & Meta Graph API Integration

### 2.1 OAuth Redirect & CORS Configuration (`GET /api/social/facebook/connect`)
- **Required Change**:
  - Accept `Authorization: Bearer <token>` in header OR query token parameter (`?token=...`).
  - Instead of returning an implicit 302 redirect (which triggers browser CORS errors on AJAX calls), return a JSON payload with the OAuth URL:
  ```json
  {
    "success": true,
    "redirectUrl": "https://www.facebook.com/v19.0/dialog/oauth?client_id=1753790175918694&redirect_uri=..."
  }
  ```

### 2.2 Connected Accounts Listing (`GET /api/social/:clientId/accounts`)
- **Response Format**:
  ```json
  {
    "success": true,
    "accounts": [
      {
        "id": "uuid",
        "clientId": "client-uuid",
        "platform": "facebook",
        "pageId": "1098234812345",
        "pageName": "Brand Official Page",
        "instagramId": "17841405309211562",
        "instagramUsername": "@brandofficial",
        "createdAt": "2026-09-15T12:00:00.000Z"
      }
    ]
  }
  ```

### 2.3 Post Publishing & Scheduling (`POST /api/social/:clientId/publish`)
- **Request Body**:
  ```json
  {
    "accountId": "social-account-uuid",
    "message": "Check out our latest project! 🚀",
    "imageUrl": "https://ik.imagekit.io/sample.jpg",
    "scheduledPublishTime": 1726405200000
  }
  ```
- **Logic**:
  - If `scheduledPublishTime` is missing or in the past ➔ Call Meta Graph API immediately and return `{ "success": true, "results": [...] }`.
  - If `scheduledPublishTime` is in the future ➔ Save post record to `SocialPosts` DB table with status `'scheduled'`.

---

## 3. Database Schemas to Add

### 3.1 `SocialAccounts` Table
```sql
CREATE TABLE "SocialAccounts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId" UUID NOT NULL REFERENCES "Clients"("id") ON DELETE CASCADE,
  "platform" VARCHAR(20) NOT NULL CHECK ("platform" IN ('facebook', 'instagram')),
  "pageId" VARCHAR(100) NOT NULL,
  "pageName" VARCHAR(255) NOT NULL,
  "pageAccessToken" TEXT NOT NULL,
  "instagramId" VARCHAR(100),
  "instagramUsername" VARCHAR(100),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 `SocialPosts` Table
```sql
CREATE TABLE "SocialPosts" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId" UUID NOT NULL REFERENCES "Clients"("id") ON DELETE CASCADE,
  "accountId" UUID NOT NULL REFERENCES "SocialAccounts"("id") ON DELETE CASCADE,
  "message" TEXT NOT NULL,
  "imageUrl" TEXT,
  "scheduledPublishTime" TIMESTAMP WITH TIME ZONE,
  "status" VARCHAR(20) NOT NULL DEFAULT 'published' CHECK ("status" IN ('draft', 'scheduled', 'published', 'failed')),
  "publishedId" VARCHAR(100),
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. Background Cron Job Specification

Add a 60-second cron task (`node-cron` or `BullMQ`) to process scheduled social posts:

```javascript
import cron from 'node-cron';

// Run every 60 seconds
cron.schedule('* * * * *', async () => {
  const pendingPosts = await db.SocialPosts.findAll({
    where: {
      status: 'scheduled',
      scheduledPublishTime: { [Op.lte]: new Date() }
    },
    include: ['SocialAccount']
  });

  for (const post of pendingPosts) {
    try {
      const result = await publishToMetaGraphApi(post.SocialAccount, post);
      await post.update({ status: 'published', publishedId: result.id });
    } catch (err) {
      await post.update({ status: 'failed', errorMessage: err.message });
    }
  }
});
```

---

## 5. Client Subscriptions & Overview Endpoints

### 5.1 Assign Subscription to Client (`POST /api/clients/:id/subscribe`)
- **Request Body**: `{ "planId": "plan-uuid", "billingCycle": "monthly" }`
- **Action**: Links plan to client, calculates renewal date (+30 days), resets monthly deliverable quota.

### 5.2 Client Overview Dashboard (`GET /api/clients/:id/overview`)
- Returns client details, active subscription package, deliverable usage (`used/total`), connected social accounts, and upcoming scheduled posts in a single unified JSON response.
