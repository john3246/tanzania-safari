# Tanzania Safari Magic - API Documentation

## Overview
This document provides comprehensive API documentation for the Tanzania Safari Magic CMS system. All endpoints are RESTful and return JSON responses with a consistent format.

## Base URL
```
http://your-domain.com/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Authentication Endpoints

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "user_id": "uuid",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password/:token
```

**Request Body:**
```json
{
  "password": "new_password123"
}
```

---

## Admin CMS Endpoints

### Users Management

#### List Users
```http
GET /api/admin/users
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email
- `role_id` (optional): Filter by role
- `is_active` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

#### Get User
```http
GET /api/admin/users/:id
```

#### Create User
```http
POST /api/admin/users
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role_id": "uuid",
  "is_active": true
}
```

#### Update User
```http
PUT /api/admin/users/:id
```

**Request Body:** Same as create user (all fields optional)

#### Delete User (Soft Delete)
```http
DELETE /api/admin/users/:id
```

#### Restore User
```http
POST /api/admin/users/:id/restore
```

---

### Roles Management

#### List Roles
```http
GET /api/admin/roles
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "role_id": "uuid",
      "role_name": "Admin",
      "description": "Administrator role",
      "permissions": [...],
      "user_count": 5
    }
  ]
}
```

#### Create Role
```http
POST /api/admin/roles
```

**Request Body:**
```json
{
  "role_name": "Editor",
  "description": "Content editor role",
  "permissions": ["content.view", "content.edit"]
}
```

#### Update Role
```http
PUT /api/admin/roles/:id
```

#### Delete Role
```http
DELETE /api/admin/roles/:id
```

#### Assign Permission to Role
```http
POST /api/admin/roles/:id/permissions
```

**Request Body:**
```json
{
  "permission_id": "uuid"
}
```

#### Remove Permission from Role
```http
DELETE /api/admin/roles/:id/permissions/:permissionId
```

---

### Permissions Management

#### List Permissions
```http
GET /api/admin/permissions
```

**Query Parameters:**
- `prefix` (optional): Filter by permission prefix (e.g., "content")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "permission_id": "uuid",
      "permission_name": "content.view",
      "description": "View content",
      "prefix": "content"
    }
  ]
}
```

#### Create Permission
```http
POST /api/admin/permissions
```

**Request Body:**
```json
{
  "permission_name": "content.view",
  "description": "View content"
}
```

---

### Tour Categories Management

#### List Categories
```http
GET /api/admin/tour-categories
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `is_active` (optional): Filter by active status
- `is_featured` (optional): Filter by featured status

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "category_id": "uuid",
        "category_name": "Safari Packages",
        "category_slug": "safari-packages",
        "description": "...",
        "icon_class": "fas fa-tree",
        "display_order": 1,
        "is_active": true,
        "is_featured": true,
        "tour_count": 15
      }
    ],
    "pagination": {...}
  }
}
```

#### Create Category
```http
POST /api/admin/tour-categories
```

**Request Body:**
```json
{
  "category_name": "Safari Packages",
  "category_slug": "safari-packages",
  "description": "Description here",
  "icon_class": "fas fa-tree",
  "display_order": 1,
  "is_active": true,
  "is_featured": true
}
```

#### Update Category
```http
PUT /api/admin/tour-categories/:id
```

#### Delete Category
```http
DELETE /api/admin/tour-categories/:id
```

---

### Destinations Management

#### List Destinations
```http
GET /api/admin/destinations
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `region` (optional): Filter by region
- `is_active` (optional): Filter by active status
- `is_featured` (optional): Filter by featured status

**Response:**
```json
{
  "success": true,
  "data": {
    "destinations": [
      {
        "destination_id": "uuid",
        "park_name": "Serengeti National Park",
        "park_slug": "serengeti-national-park",
        "park_location": "Northern Tanzania",
        "park_description": "...",
        "size_sq_km": 14750,
        "established_year": 1951,
        "best_season": "June to October",
        "wildlife_highlights": "Lions, Elephants, Wildebeest migration",
        "featured_image_url": "serengeti-hero",
        "is_unesco_heritage": true,
        "is_active": true,
        "is_featured": true,
        "tour_count": 25
      }
    ],
    "pagination": {...}
  }
}
```

#### Create Destination
```http
POST /api/admin/destinations
```

**Request Body:**
```json
{
  "park_name": "Serengeti National Park",
  "park_slug": "serengeti-national-park",
  "park_location": "Northern Tanzania",
  "park_description": "Description",
  "size_sq_km": 14750,
  "established_year": 1951,
  "best_season": "June to October",
  "wildlife_highlights": "Lions, Elephants",
  "featured_image_url": "serengeti-hero",
  "is_unesco_heritage": true,
  "is_active": true,
  "is_featured": true
}
```

#### Update Destination
```http
PUT /api/admin/destinations/:id
```

#### Delete Destination
```http
DELETE /api/admin/destinations/:id
```

---

### Tours CMS Management

#### List Tours
```http
GET /api/admin/tours
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `category_id` (optional): Filter by category
- `destination_id` (optional): Filter by destination
- `status` (optional): Filter by status (draft, published, archived)
- `is_featured` (optional): Filter by featured status
- `search` (optional): Search by title or description

**Response:**
```json
{
  "success": true,
  "data": {
    "tours": [
      {
        "tour_id": "uuid",
        "tour_name": "7-Day Serengeti Safari",
        "tour_slug": "7-day-serengeti-safari",
        "short_description": "...",
        "detailed_description": "...",
        "base_price_usd": 2500,
        "duration_days": 7,
        "duration_nights": 6,
        "difficulty_level": "Moderate",
        "minimum_pax": 2,
        "maximum_pax": 12,
        "featured_image_url": "serengeti-safari-hero",
        "status": "published",
        "is_featured": true,
        "is_private": false,
        "is_customizable": true,
        "category": {...},
        "destinations": [...],
        "gallery": [...],
        "seo": {...}
      }
    ],
    "pagination": {...}
  }
}
```

#### Create Tour
```http
POST /api/admin/tours
```

**Request Body:**
```json
{
  "tour_name": "7-Day Serengeti Safari",
  "tour_slug": "7-day-serengeti-safari",
  "short_description": "...",
  "detailed_description": "...",
  "base_price_usd": 2500,
  "duration_days": 7,
  "duration_nights": 6,
  "difficulty_level": "Moderate",
  "minimum_pax": 2,
  "maximum_pax": 12,
  "featured_image_url": "serengeti-safari-hero",
  "status": "published",
  "is_featured": true,
  "is_private": false,
  "is_customizable": true,
  "category_id": "uuid",
  "destination_ids": ["uuid1", "uuid2"],
  "seo": {
    "meta_title": "...",
    "meta_description": "...",
    "meta_keywords": "...",
    "og_title": "...",
    "og_description": "...",
    "og_image": "..."
  }
}
```

#### Update Tour
```http
PUT /api/admin/tours/:id
```

#### Delete Tour
```http
DELETE /api/admin/tours/:id
```

#### Add Related Tour
```http
POST /api/admin/tours/:id/related-tours
```

**Request Body:**
```json
{
  "related_tour_id": "uuid"
}
```

#### Remove Related Tour
```http
DELETE /api/admin/tours/:id/related-tours/:relatedTourId
```

---

### Media Library Management

#### List Media
```http
GET /api/admin/media
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `folder` (optional): Filter by folder
- `tags` (optional): Filter by tags (comma-separated)
- `search` (optional): Search by filename or alt text

**Response:**
```json
{
  "success": true,
  "data": {
    "media": [
      {
        "media_id": "uuid",
        "filename": "serengeti-lion.jpg",
        "original_filename": "serengeti-lion.jpg",
        "file_path": "/uploads/2024/01/serengeti-lion.jpg",
        "file_size": 2048576,
        "mime_type": "image/jpeg",
        "width": 1920,
        "height": 1080,
        "alt_text": "Lion in Serengeti",
        "folder": "serengeti",
        "tags": ["lion", "serengeti", "wildlife"],
        "usage_count": 5,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### Upload Media
```http
POST /api/admin/media/upload
```

**Request:** `multipart/form-data`
- `files`: Array of files
- `folder` (optional): Target folder
- `tags` (optional): Comma-separated tags

#### Update Media
```http
PUT /api/admin/media/:id
```

**Request Body:**
```json
{
  "alt_text": "Updated alt text",
  "folder": "new-folder",
  "tags": ["tag1", "tag2"]
}
```

#### Delete Media
```http
DELETE /api/admin/media/:id
```

#### Get Media Usage
```http
GET /api/admin/media/:id/usage
```

---

### Pages CMS Management

#### List Pages
```http
GET /api/admin/pages
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `template` (optional): Filter by template
- `status` (optional): Filter by status
- `parent_id` (optional): Filter by parent page

**Response:**
```json
{
  "success": true,
  "data": {
    "pages": [
      {
        "page_id": "uuid",
        "title": "About Us",
        "slug": "about-us",
        "content": "...",
        "template": "about",
        "status": "published",
        "parent_id": null,
        "display_order": 1,
        "seo": {...},
        "children": [...]
      }
    ],
    "pagination": {...}
  }
}
```

#### Create Page
```http
POST /api/admin/pages
```

**Request Body:**
```json
{
  "title": "About Us",
  "slug": "about-us",
  "content": "Page content",
  "template": "about",
  "status": "published",
  "parent_id": null,
  "display_order": 1,
  "seo": {
    "meta_title": "...",
    "meta_description": "..."
  }
}
```

#### Update Page
```http
PUT /api/admin/pages/:id
```

#### Delete Page
```http
DELETE /api/admin/pages/:id
```

#### Set Homepage
```http
POST /api/admin/pages/:id/set-homepage
```

#### Publish Page
```http
POST /api/admin/pages/:id/publish
```

---

### Menus Management

#### List Menus
```http
GET /api/admin/menus
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "menu_id": "uuid",
      "menu_name": "Main Navigation",
      "menu_slug": "main-navigation",
      "location": "header",
      "is_active": true,
      "items": [...]
    }
  ]
}
```

#### Create Menu
```http
POST /api/admin/menus
```

**Request Body:**
```json
{
  "menu_name": "Main Navigation",
  "menu_slug": "main-navigation",
  "location": "header",
  "is_active": true
}
```

#### Update Menu
```http
PUT /api/admin/menus/:id
```

#### Delete Menu
```http
DELETE /api/admin/menus/:id
```

#### Create Menu Item
```http
POST /api/admin/menus/:id/items
```

**Request Body:**
```json
{
  "label": "Home",
  "url": "/",
  "page_id": "uuid",
  "parent_id": null,
  "display_order": 1,
  "is_active": true
}
```

#### Update Menu Item
```http
PUT /api/admin/menus/:menuId/items/:itemId
```

#### Delete Menu Item
```http
DELETE /api/admin/menus/:menuId/items/:itemId
```

#### Reorder Menu Items
```http
POST /api/admin/menus/:id/reorder
```

**Request Body:**
```json
{
  "item_ids": ["uuid1", "uuid2", "uuid3"]
}
```

---

### Site Settings Management

#### List Settings
```http
GET /api/admin/site-settings
```

**Query Parameters:**
- `category` (optional): Filter by category
- `key` (optional): Filter by key

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "setting_id": "uuid",
      "setting_key": "company_name",
      "setting_value": "Tanzania Safari Magic",
      "setting_type": "string",
      "category": "company",
      "description": "Company name"
    }
  ]
}
```

#### Get Settings as Object
```http
GET /api/admin/site-settings/object
```

**Response:**
```json
{
  "success": true,
  "data": {
    "company_name": "Tanzania Safari Magic",
    "company_email": "info@tanzaniasafarimagic.com",
    "company_phone": "+255 123 456 789",
    "company_address": "Address here"
  }
}
```

#### Create Setting
```http
POST /api/admin/site-settings
```

**Request Body:**
```json
{
  "setting_key": "company_name",
  "setting_value": "Tanzania Safari Magic",
  "setting_type": "string",
  "category": "company",
  "description": "Company name"
}
```

#### Update Setting
```http
PUT /api/admin/site-settings/:id
```

#### Bulk Update Settings
```http
PUT /api/admin/site-settings/bulk
```

**Request Body:**
```json
{
  "settings": [
    {
      "setting_key": "company_name",
      "setting_value": "New Company Name"
    }
  ]
}
```

#### Get Company Info
```http
GET /api/admin/site-settings/company
```

#### Get Contact Info
```http
GET /api/admin/site-settings/contact
```

#### Get SEO Settings
```http
GET /api/admin/site-settings/seo
```

#### Get Social Media Settings
```http
GET /api/admin/site-settings/social
```

#### Get SMTP Settings
```http
GET /api/admin/site-settings/smtp
```

---

### Audit Logs Management

#### List Audit Logs
```http
GET /api/admin/audit-logs
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `action` (optional): Filter by action
- `entity_type` (optional): Filter by entity type
- `actor_id` (optional): Filter by actor
- `from_date` (optional): Filter by date range (ISO format)
- `to_date` (optional): Filter by date range (ISO format)
- `severity` (optional): Filter by severity

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "audit_log_id": "uuid",
        "action": "create",
        "entity_type": "tour",
        "entity_id": "uuid",
        "actor_id": "uuid",
        "actor_name": "John Doe",
        "changes": {...},
        "ip_address": "192.168.1.1",
        "severity": "info",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### Get Audit Log
```http
GET /api/admin/audit-logs/:id
```

#### Get Audit Log Statistics
```http
GET /api/admin/audit-logs/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_logs": 1000,
    "by_action": {
      "create": 300,
      "update": 500,
      "delete": 200
    },
    "by_entity": {
      "tour": 400,
      "user": 300,
      "booking": 300
    },
    "by_severity": {
      "info": 800,
      "warning": 150,
      "error": 50
    }
  }
}
```

---

### Email Templates Management

#### List Email Templates
```http
GET /api/admin/email-templates
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "template_id": "uuid",
        "template_name": "Booking Confirmation",
        "template_slug": "booking-confirmation",
        "subject": "Your Safari Booking is Confirmed",
        "body": "Dear {{customer_name}},...",
        "category": "booking",
        "variables": ["customer_name", "tour_name", "booking_date"],
        "is_active": true,
        "usage_count": 150
      }
    ],
    "pagination": {...}
  }
}
```

#### Create Email Template
```http
POST /api/admin/email-templates
```

**Request Body:**
```json
{
  "template_name": "Booking Confirmation",
  "template_slug": "booking-confirmation",
  "subject": "Your Safari Booking is Confirmed",
  "body": "Dear {{customer_name}},...",
  "category": "booking",
  "is_active": true
}
```

#### Update Email Template
```http
PUT /api/admin/email-templates/:id
```

#### Delete Email Template
```http
DELETE /api/admin/email-templates/:id
```

#### Preview Email Template
```http
POST /api/admin/email-templates/:id/preview
```

**Request Body:**
```json
{
  "variables": {
    "customer_name": "John Doe",
    "tour_name": "7-Day Serengeti Safari",
    "booking_date": "2024-02-15"
  }
}
```

---

### Bookings Management

#### List Bookings
```http
GET /api/admin/bookings-cms
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `tour_id` (optional): Filter by tour
- `user_id` (optional): Filter by user
- `from_date` (optional): Filter by date range
- `to_date` (optional): Filter by date range

**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "booking_id": "uuid",
        "booking_reference": "BK-2024-001",
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "tour_id": "uuid",
        "tour_name": "7-Day Serengeti Safari",
        "booking_date": "2024-02-15",
        "number_of_travelers": 2,
        "total_amount": 5000,
        "status": "confirmed",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### Create Booking
```http
POST /api/admin/bookings-cms
```

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "tour_id": "uuid",
  "booking_date": "2024-02-15",
  "number_of_travelers": 2,
  "total_amount": 5000,
  "special_requests": "Vegetarian meals required"
}
```

#### Update Booking
```http
PUT /api/admin/bookings-cms/:id
```

#### Update Booking Status
```http
POST /api/admin/bookings-cms/:id/status
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

#### Delete Booking
```http
DELETE /api/admin/bookings-cms/:id
```

#### Get Booking Statistics
```http
GET /api/admin/bookings-cms/statistics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_bookings": 500,
    "by_status": {
      "pending": 50,
      "confirmed": 400,
      "cancelled": 50
    },
    "revenue_by_month": {
      "2024-01": 50000,
      "2024-02": 75000
    },
    "top_tours": [...]
  }
}
```

---

### Reports

#### Bookings Report
```http
GET /api/admin/reports/bookings
```

**Query Parameters:**
- `from_date` (optional): Start date
- `to_date` (optional): End date
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "total_bookings": 100,
    "total_revenue": 250000,
    "average_booking_value": 2500,
    "bookings_by_status": {...},
    "bookings_by_month": {...}
  }
}
```

#### Tours Report
```http
GET /api/admin/reports/tours
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_tours": 25,
    "active_tours": 20,
    "most_booked_tours": [...],
    "tours_by_category": {...}
  }
}
```

#### Customers Report
```http
GET /api/admin/reports/customers
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_customers": 300,
    "new_customers_this_month": 25,
    "top_customers_by_spending": [...],
    "customers_by_country": {...}
  }
}
```

#### Email Statistics Report
```http
GET /api/admin/reports/email-stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_emails_sent": 1000,
    "delivered": 950,
    "opened": 800,
    "clicked": 400,
    "failed": 50,
    "by_template": {...}
  }
}
```

#### Revenue Report
```http
GET /api/admin/reports/revenue
```

**Query Parameters:**
- `from_date` (optional): Start date
- `to_date` (optional): End date

**Response:**
```json
{
  "success": true,
  "data": {
    "total_revenue": 500000,
    "revenue_by_month": {...},
    "revenue_by_tour": {...},
    "average_revenue_per_booking": 2500
  }
}
```

#### Dashboard Statistics
```http
GET /api/admin/reports/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_packages": 25,
    "total_destinations": 10,
    "total_bookings": 500,
    "total_enquiries": 150,
    "revenue_this_month": 75000,
    "new_bookings_this_month": 45
  }
}
```

---

## Public API Endpoints

These endpoints are publicly accessible and do not require authentication.

### Tours
```http
GET /api/public/tours
```

**Query Parameters:**
- `category` (optional): Filter by category slug
- `destination` (optional): Filter by destination slug
- `featured` (optional): Filter by featured status
- `limit` (optional): Limit results

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tour_id": "uuid",
      "tour_name": "7-Day Serengeti Safari",
      "tour_slug": "7-day-serengeti-safari",
      "short_description": "...",
      "base_price_usd": 2500,
      "duration_days": 7,
      "featured_image_url": "...",
      "category": {...},
      "destinations": [...]
    }
  ]
}
```

### Tour Details
```http
GET /api/public/tours/:slug
```

### Destinations
```http
GET /api/public/destinations
```

**Query Parameters:**
- `region` (optional): Filter by region
- `featured` (optional): Filter by featured status

### Categories
```http
GET /api/public/categories
```

### Pages
```http
GET /api/public/pages
```

**Query Parameters:**
- `slug` (optional): Get specific page by slug
- `template` (optional): Filter by template

### Menus
```http
GET /api/public/menus
```

**Query Parameters:**
- `location` (optional): Filter by location (header, footer, sidebar, mobile)

### Site Settings
```http
GET /api/public/settings
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate slug) |
| 422 | Validation Error |
| 500 | Internal Server Error |

## Rate Limiting
API requests are rate-limited to 100 requests per minute per IP address.

## Pagination
All list endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

## Filtering and Search
Most list endpoints support filtering and search. Check individual endpoint documentation for available filters.

## Webhooks
Webhooks can be configured to receive notifications for specific events (e.g., new booking, booking status change).

## Support
For API support, contact: support@tanzaniasafarimagic.com
