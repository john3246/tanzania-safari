# Tanzania Safari Magic - Deployment Guide

## Overview
This guide covers the deployment of the Tanzania Safari Magic CMS system to Render (or any Node.js hosting platform).

## Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis (for email queue)
- Render account (or equivalent hosting)

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database Connection
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Application Settings
PORT=3000
NODE_ENV=production
JWT_SECRET=your-super-secret-64-character-hex-string

# Email Configuration (Namecheap Private Email)
EMAIL_HOST=mail.privateemail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=info@tanzaniasafarimagic.com
EMAIL_PASS=your_email_password
EMAIL_FROM="Tanzania Safari Magic <info@tanzaniasafarimagic.com>"
ADMIN_EMAIL=info@tanzaniasafarimagic.com
ADMIN_URL=https://your-domain.com/admin
SITE_URL=https://your-domain.com

# Redis Configuration (for email queue)
REDIS_URL=redis://redis-host:6379

# Email Queue Configuration
QUEUE_CONCURRENCY=5
QUEUE_RETRY_ATTEMPTS=5
QUEUE_BACKOFF_MS=5000

# Email Rate Limiting
EMAIL_MAX_PER_MINUTE=20
EMAIL_MAX_PER_HOUR=200

# Logging
LOG_LEVEL=info

# CORS
ALLOWED_ORIGIN=https://your-domain.com,https://www.your-domain.com
```

## Database Migration

On first deployment, run the database migrations:

```bash
# Run initial RBAC schema
psql $DATABASE_URL -f database/migrations/01_cms_schema.sql

# Run full CMS schema
psql $DATABASE_URL -f database/migrations/02_cms_full_schema.sql
```

## Render Deployment Steps

### 1. Create PostgreSQL Database
- Go to Render Dashboard → New → PostgreSQL
- Set database name, region, and plan
- Copy the internal database URL to your `.env`

### 2. Create Redis Instance
- Go to Render Dashboard → New → Redis
- Set region and plan
- Copy the internal Redis URL to your `.env`

### 3. Deploy Web Service
- Go to Render Dashboard → New → Web Service
- Connect your GitHub repository
- Configure build and start commands:
  - Build Command: `npm install`
  - Start Command: `node server.js`
- Add environment variables from the list above
- Deploy

### 4. Run Database Migrations
After the web service is deployed, you'll need to run the migrations. You can do this via:
- Render's shell access
- Or by temporarily adding a migration script to your package.json

### 5. Create Default Admin User
After migration, create the first admin user via the API:
```bash
POST /api/admin/users
{
  "username": "admin",
  "email": "admin@yourdomain.com",
  "password": "secure_password",
  "role_id": 1  // Super Admin role
}
```

## CMS Modules Implemented

### High-Priority Modules (Completed)
1. **Users CRUD** - User management with RBAC
2. **Roles CRUD** - Role management with permission assignment
3. **Permissions CRUD** - Permission management
4. **Tour Categories CRUD** - Safari tour categories
5. **Destinations CRUD** - Tour destinations with regions
6. **Tours CMS** - Full tour management with SEO, gallery, related tours
7. **Media Library** - File upload with WebP optimization
8. **Pages CMS** - Dynamic pages (hero, about, FAQ, policies)
9. **Menus Management** - Navigation menu management
10. **Site Settings** - Company info, SMTP, social media, SEO defaults
11. **Audit Logs** - System activity logging
12. **Email Templates** - Email template management
13. **Bookings Management** - Booking status workflow with email notifications
14. **Reports** - Bookings, tours, customers, email statistics

### Public API Endpoints
- `/api/public/tours` - Public tours listing
- `/api/public/tours/:slug` - Single tour details
- `/api/public/destinations` - Destinations listing
- `/api/public/categories` - Tour categories
- `/api/public/pages` - CMS pages
- `/api/public/menus` - Navigation menus
- `/api/public/settings` - Site settings

## Architecture

### Backend Structure
```
├── controllers/
│   └── admin/          # CMS controllers
├── repositories/       # Data access layer
├── services/           # Business logic layer
├── routes/
│   └── admin/          # API routes
├── middleware/         # Auth, validation, etc.
├── database/
│   └── migrations/     # SQL migration files
└── server.js          # Application entry point
```

### Design Patterns
- **Repository Pattern** - Data access abstraction
- **Service Layer Pattern** - Business logic separation
- **MVC Architecture** - Model-View-Controller
- **RBAC** - Role-Based Access Control

## Security Features
- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting
- Input validation with Zod
- SQL injection prevention (parameterized queries)
- XSS protection
- Password hashing with bcrypt
- JWT authentication

## Performance Features
- WebP image optimization
- Database indexing
- Pagination for large datasets
- Email queue with BullMQ + Redis
- Static file serving

## Monitoring
- Health check endpoint: `/health`
- Audit logging for all admin actions
- Email delivery tracking
- Error logging with Winston

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is accessible
- Ensure SSL mode is correct

### Email Issues
- Verify SMTP credentials
- Check Redis connection for queue
- Review email logs in database

### File Upload Issues
- Ensure uploads directory exists
- Check file permissions
- Verify storage limits

## Post-Deployment Checklist
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Default admin user created
- [ ] Email SMTP verified
- [ ] Redis connection tested
- [ ] Health check endpoint accessible
- [ ] Public API endpoints tested
- [ ] Admin login functional
- [ ] File uploads working
- [ ] Email queue processing

## Support
For issues or questions, refer to the codebase documentation or contact the development team.
