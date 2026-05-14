# Stage 1
## Notification System Design
The Notification System provides a way for users to receive and manage updates like placements, events, and results. It uses a REST API to allow applications to fetch, read, or delete notifications, requiring JWT authentication for security. To ensure users see new alerts instantly, we can implement WebSockets for real-time updates, alongside a preferences system for choosing alert types.

---
### 1. Core API Endpoints
| Action | Endpoint | Method |
| :--- | :--- | :--- |
| **Get Token** | `/api/v1/get-token` | `GET` |
| **Fetch All** | `/api/v1/notifications` | `GET` |
| **Mark Read** | `/api/v1/notifications/:id/read` | `PATCH` |
| **Mark All Read** | `/api/v1/notifications/read-all` | `POST` |
| **Delete** | `/api/v1/notifications/:id` | `DELETE` |
| **Get Preferences** | `/api/v1/notifications/preferences` | `GET` |
| **Update Preferences** | `/api/v1/notifications/preferences` | `PUT` |
---
### 2. Basic Endpoint Details
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
 Error Handling
Standard HTTP status codes will be used:
*   `401 Unauthorized`: Missing or invalid token.
*   `403 Forbidden`: User trying to access/modify a notification that doesn't belong to them.
*   `404 Not Found`: Notification ID does not exist.


Stage 2:
implemented mongoDB added schemas and storing data on mongo db
