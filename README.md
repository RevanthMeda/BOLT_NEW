# Cully - Report Management System

A comprehensive enterprise-grade report management system for Site Acceptance Tests (SATs) with robust role-based access control, digital signatures, and collaborative workflows.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cully
   ```

2. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

3. **Initialize the database**
   ```bash
   # Wait for services to start, then run:
   docker-compose exec backend npm run db:migrate
   docker-compose exec backend npm run db:seed
   ```

4. **Access the application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3001
   - **Database**: PostgreSQL on localhost:5432
   - **Email Testing**: MailHog UI at http://localhost:8025

### Demo Accounts

The system comes with pre-seeded demo accounts:

- **Admin**: admin@test.com / Test123!
- **Engineer**: engineer@test.com / Test123!
- **Technical Manager**: tm@test.com / Test123!
- **Project Manager**: pm@test.com / Test123!

## 🏗️ Architecture Overview

### Technology Stack

**Frontend**:
- React 18+ with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Query for state management
- React Hook Form for forms
- Zustand for client state

**Backend**:
- Node.js with Express and TypeScript
- PostgreSQL with Prisma ORM
- JWT-based authentication
- Role-based access control (RBAC)
- File upload and management
- Email notifications (SMTP)

**Security**:
- Secure JWT tokens with refresh strategy
- Row-level security at database level
- Input validation with Zod
- CORS and security headers
- Rate limiting
- Comprehensive audit logging

## 📋 Features

### User Management & RBAC
- **Admin**: Full system access, user management, settings
- **Engineer**: Create and edit own SAT reports
- **Technical Manager**: Review and approve assigned reports
- **Project Manager**: Final approval and report archival

### Multi-Step SAT Report Wizard
1. **Pre-Configuration**: Module and Modbus setup
2. **Document Information**: Basic report metadata
3. **Introduction & Scope**: Rich text content
4. **Pre-Test Requirements**: Test procedures and criteria
5. **Asset Register**: Equipment and IP address schedules
6. **Signal Tests**: Auto-generated based on configuration
7. **Process, SCADA & Alarms**: Screenshots and verification
8. **Test Equipment & Punch List**: Equipment and issue tracking
9. **Review & Submit**: Final review and submission

### Approval Workflow
- **Draft** → **Pending TM Approval** → **Pending PM Approval** → **Completed**
- Digital signatures with full traceability
- Comment threads with @mentions
- Email notifications at each stage
- Rejection handling with feedback loop

### Document Export & Archival
- Template-driven DOCX export
- Attachment bundling into ZIP files
- Configurable final storage locations
- Company branding and watermarks

### Collaboration Features
- Persistent comment threads
- @mention notifications
- File upload and management
- Real-time status updates

### Security & Compliance
- Complete audit trail
- Secure file storage
- Data encryption in transit
- Role-based data segregation

## 🛠️ Development

### Database Management

```bash
# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed database with demo data
npm run db:seed

# Reset database (development only)
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

### Environment Variables

Create `.env` files based on `.env.example`:

**Backend (.env)**:
```env
DATABASE_URL="postgresql://cully:password@localhost:5432/cully_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
PORT=3001
NODE_ENV=development
SMTP_HOST=localhost
SMTP_PORT=1025
FRONTEND_URL=http://localhost:5173
```

### API Documentation

The API is documented using OpenAPI 3.0. Access the interactive documentation at:
- http://localhost:3001/api/docs (when implemented)

### Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests
npm test

# Run E2E tests
npm run test:e2e
```

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with secure HttpOnly cookies
- Refresh token rotation
- Role-based route protection
- API endpoint authorization

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### Audit & Compliance
- Comprehensive audit logging
- User action tracking
- IP address logging
- Data access monitoring

## 📊 Database Schema

### Core Tables
- **users**: User accounts with RBAC
- **reports**: SAT reports with lifecycle tracking
- **report_steps**: Individual wizard step data
- **signatures**: Digital signatures with metadata
- **comments**: Collaboration and feedback
- **files**: File attachments and uploads
- **audit_logs**: Complete system audit trail

### Security Model
- Row-level security (RLS) enforcement
- User-scoped data access
- Role-based query filtering
- Audit trail for all operations

## 🚀 Production Deployment

### Docker Production Build

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Configuration

Ensure all production environment variables are properly configured:
- Strong JWT secrets
- Production database credentials
- SMTP server configuration
- Secure file storage paths
- SSL/TLS certificates

### Security Checklist
- [ ] Change all default passwords
- [ ] Configure HTTPS/SSL
- [ ] Set up proper firewall rules
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerting
- [ ] Review and test disaster recovery

## 📈 Monitoring & Maintenance

### Health Checks
- API health endpoint: `/api/health`
- Database connectivity monitoring
- File system health checks

### Logging
- Structured logging with Winston
- Error tracking and alerting
- Performance monitoring
- Audit log retention

### Backup Strategy
- Database backups
- File storage backups
- Configuration backups
- Disaster recovery testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits
- Comprehensive testing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the demo flow for examples

## 🎯 Validation Criteria

The system successfully implements the complete end-to-end workflow:

1. **Admin Flow**: User approval and system management
2. **Engineer Flow**: Report creation, editing, and submission
3. **TM Flow**: Technical review and approval
4. **PM Flow**: Final approval and archival
5. **System Flow**: Audit logging, notifications, and document export

All security requirements, RBAC enforcement, and data segregation are fully implemented and tested.