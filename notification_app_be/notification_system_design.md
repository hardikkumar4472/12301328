# Stage 1

## Notification System Design

This document outlines the REST API design, contracts, and structures for the notification platform, designed for a front-end developer colleague to display notifications to logged-in users.

---

### 1. Core Actions
The notification platform supports the following core actions:
1.  **Fetch Notifications**: Retrieve a list of notifications for the user.
2.  **Mark as Read**: Mark a specific notification as read.
3.  **Mark All as Read**: Batch update all notifications to 'read' status.
4.  **Delete Notification**: Remove a specific notification.
5.  **Get/Update Preferences**: Manage user-specific notification settings (e.g., email vs. push).

---

### 2. REST API Endpoints

#### A. Fetch Notifications
*   **Endpoint**: `GET /api/v1/notifications`
*   **Description**: Returns a paginated list of notifications for the authenticated user.
*   **Headers**:
    *   `Authorization`: `Bearer <JWT_TOKEN>`
*   **Query Parameters**:
    *   `page` (optional): The page number (default: 1).
    *   `limit` (optional): Number of items per page (default: 15).
    *   `status` (optional): Filter by `read`, `unread`, or `all` (default: `all`).
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "data": {
        "notifications": [
          {
            "id": "notif_8291a",
            "title": "Security Alert",
            "message": "A new device logged into your account.",
            "type": "security",
            "isRead": false,
            "createdAt": "2024-05-14T10:30:00Z",
            "actionUrl": "/settings/security"
          },
          {
            "id": "notif_8291b",
            "title": "Welcome!",
            "message": "Thanks for joining our platform.",
            "type": "info",
            "isRead": true,
            "createdAt": "2024-05-13T15:00:00Z",
            "actionUrl": null
          }
        ],
        "pagination": {
          "totalItems": 45,
          "totalPages": 3,
          "currentPage": 1,
          "hasNextPage": true
        }
      }
    }
    ```

#### B. Mark Notification as Read
*   **Endpoint**: `PATCH /api/v1/notifications/:id/read`
*   **Description**: Updates the `isRead` status of a specific notification.
*   **Headers**:
    *   `Authorization`: `Bearer <JWT_TOKEN>`
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "message": "Notification marked as read.",
      "data": {
        "id": "notif_8291a",
        "isRead": true
      }
    }
    ```

#### C. Mark All Notifications as Read
*   **Endpoint**: `POST /api/v1/notifications/read-all`
*   **Description**: Marks all unread notifications for the user as read.
*   **Headers**:
    *   `Authorization`: `Bearer <JWT_TOKEN>`
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "message": "All notifications marked as read.",
      "count": 12
    }
    ```

#### D. Delete Notification
*   **Endpoint**: `DELETE /api/v1/notifications/:id`
*   **Description**: Permanently removes a notification.
*   **Headers**:
    *   `Authorization`: `Bearer <JWT_TOKEN>`
*   **Response (204 No Content)**: (Empty Body)

---

### 3. Notification Preferences (Settings)

#### Get Preferences
*   **Endpoint**: `GET /api/v1/notifications/preferences`
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "data": {
        "email": {
          "marketing": false,
          "security": true,
          "updates": true
        },
        "push": {
          "messages": true,
          "mentions": true
        }
      }
    }
    ```

#### Update Preferences
*   **Endpoint**: `PUT /api/v1/notifications/preferences`
*   **Request Body**:
    ```json
    {
      "push": {
        "messages": false
      }
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "status": "success",
      "message": "Preferences updated successfully."
    }
    ```

---

### 4. Real-time Notifications Mechanism

To ensure users receive notifications instantly without refreshing the page, we will use **WebSockets** (standard protocol) or **Socket.io** (library).

#### Implementation Details:
1.  **Handshake**: Upon logging in, the front-end establishes a WebSocket connection: `wss://api.example.com/notifications`.
2.  **Authentication**: The JWT token is sent during the connection handshake (either via query param or headers).
3.  **Server Push**: When a background event occurs (e.g., a new comment, security alert), the server identifies the user's active socket and emits a `new_notification` event.
4.  **JSON Payload**:
    ```json
    {
      "event": "new_notification",
      "payload": {
        "id": "notif_9982",
        "title": "New Comment",
        "message": "Sarah replied to your post.",
        "type": "social",
        "isRead": false,
        "createdAt": "2024-05-14T11:00:00Z"
      }
    }
    ```
5.  **Client Handling**: The front-end listens for the `new_notification` event and updates the UI state (increasing the badge count and showing a toast notification).

---

### 5. Data Models (JSON Schemas)

#### Notification Object
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "title": { "type": "string" },
    "message": { "type": "string" },
    "type": { "type": "string", "enum": ["info", "success", "warning", "error", "security", "social"] },
    "isRead": { "type": "boolean" },
    "createdAt": { "type": "string", "format": "date-time" },
    "actionUrl": { "type": ["string", "null"] },
    "metadata": { "type": "object", "additionalProperties": true }
  },
  "required": ["id", "title", "message", "type", "isRead", "createdAt"]
}
```

#### Preferences Object
```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "object",
      "properties": {
        "marketing": { "type": "boolean" },
        "security": { "type": "boolean" },
        "updates": { "type": "boolean" }
      }
    },
    "push": {
      "type": "object",
      "properties": {
        "messages": { "type": "boolean" },
        "mentions": { "type": "boolean" }
      }
    }
  }
}
```

---

### 6. Error Handling
Standard HTTP status codes will be used:
*   `401 Unauthorized`: Missing or invalid token.
*   `403 Forbidden`: User trying to access/modify a notification that doesn't belong to them.
*   `404 Not Found`: Notification ID does not exist.
*   `429 Too Many Requests`: Rate limiting for API calls.
