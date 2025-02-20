# Vaccine Certificate Management System

A modern web application for managing vaccine certificates, built with Next.js, Prisma, and PostgreSQL.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed on your system
- Git (for cloning the repository)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vaccine-certificate
   ```

2. **Environment Setup**
   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - The default environment variables should work out of the box with Docker:
     ```env
     NEXTAUTH_SECRET="jgdsWy8iXGaz/hpyotIhAQKtATY0+1VzlQl07QG4xk4="
     NEXTAUTH_URL="http://localhost:3000"
     NEXT_PUBLIC_APP_URL="http://localhost:3000"
     
     POSTGRES_USER="postgres"
     POSTGRES_PASSWORD="postgres"
     POSTGRES_DB="postgres"
     DATABASE_URL="postgresql://postgres:postgres@postgres:5432/postgres?schema=public"
     ```

3. **Build and Start the Development Environment**
   ```bash
   # Using the npm script (recommended)
   npm run docker:compose:dev

   # Or manually
   docker compose down && docker compose up -d --build
   ```

4. **Initialize the Database**
   ```bash
   # Run database seed
   docker exec frontend-dev npx prisma db seed
   ```

### Production Deployment

1. **Set Production Environment Variables**
   - Create a production environment file:
     ```bash
     cp .env .env.production
     ```
   - Update the following variables in `.env.production`:
     ```env
     NODE_ENV=production
     NEXTAUTH_URL="https://your-domain.com"
     NEXT_PUBLIC_APP_URL="https://your-domain.com"
     ```

2. **Build and Start Production Environment**
   ```bash
   # Using the npm script (recommended)
   npm run docker:compose:prod

   # Or manually
   docker compose -f docker-compose.prod.yml up -d --build
   ```

3. **Verify Production Setup**
   ```bash
   # Check container status
   docker compose -f docker-compose.prod.yml ps
   
   # Check logs
   docker compose -f docker-compose.prod.yml logs frontend
   ```

4. **Access the Application**
   - Development: [http://localhost:3000](http://localhost:3000)
   - Production: https://your-domain.com
   - Use the following credentials to log in:

     **Admin User:**
     - Username: `admin`
     - Password: `admin123`

     **Technician User:**
     - Username: `tech`
     - Password: `admin123`

     **Medical Officer User:**
     - Username: `medical`
     - Password: `admin123`

## 🛠 Tech Stack

- **Frontend:**
  - Next.js 15.1.6
  - React 19
  - TailwindCSS
  - Shadcn UI Components
  - React Hook Form
  - Zod Validation

- **Backend:**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL Database
  - NextAuth.js for Authentication

- **Development:**
  - TypeScript
  - Docker
  - ESLint
  - Prettier

## 📁 Project Structure

```
vaccine-certificate/
├── src/
│   ├── app/              # Next.js 13+ App Router
│   ├── components/       # Reusable UI components
│   ├── lib/             # Utility functions and shared logic
│   └── types/           # TypeScript type definitions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts         # Database seeding script
├── public/             # Static assets
├── docker-compose.yml  # Docker composition file
└── Dockerfile         # Docker build instructions
```

## 🔑 Key Features

- User Authentication (Admin & Technician roles)
- Vaccine Certificate Management
- QR Code Generation for Certificates
- Certificate Verification System
- Responsive Design
- Dark/Light Mode Support

## 🛟 Troubleshooting

### Common Issues

1. **Container not starting:**
   ```bash
   # Check container logs
   docker compose logs frontend
   docker compose logs postgres
   ```

2. **Database connection issues:**
   ```bash
   # Restart the containers
   docker compose down
   docker compose up -d
   ```

3. **Reset Database:**
   ```bash
   # Reset and reseed the database
   docker exec frontend-dev npx prisma db push --force-reset
   docker exec frontend-dev npx prisma db seed
   ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# Vaccine Certificate Management System - Deployment Guide

## Server Access

### SSH Login
```bash
ssh popular@115.69.210.131
```

### Server Requirements
- Node.js (v18 or higher)
- Docker and Docker Compose
- PM2 (for process management)
- Git

## Initial Setup

1. **Clone the Repository**
```bash
cd /var/www
git clone [repository-url] vaccine-certificate
cd vaccine-certificate
```

2. **Environment Setup**
```bash
# Copy the environment file
cp .env.example .env

# Update the following variables in .env:
# - DATABASE_URL=mysql://appuser:apppassword@localhost:3307/vaccine_db
# - JWT_SECRET=[your-secret-key]
# - NEXTAUTH_SECRET=[your-nextauth-secret]
# - NEXTAUTH_URL=http://your-domain.com
```

3. **Install Dependencies**
```bash
npm install
```

## Database Setup

1. **Start Docker Containers**
```bash
# Start MySQL and backup services
docker compose up -d

# Verify containers are running
docker ps
```

2. **Database Migration**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

## Application Deployment

1. **Build the Application**
```bash
# Build Next.js application
npm run build
```

2. **Start with PM2**
```bash
# Start the application
pm2 start npm --name "vaccine-certificate" -- start

# Check status
pm2 status

# View logs
pm2 logs vaccine-certificate
```

3. **Update Application**
```bash
# Pull latest changes
git pull

# Install dependencies if needed
npm install

# Rebuild the application
npm run build

# Restart PM2 process
pm2 restart vaccine-certificate
```

## Docker Commands

### Container Management
```bash
# Start containers
docker compose up -d

# Stop containers
docker compose down

# View container logs
docker logs vaccine-certificate-mysql-1
docker logs vaccine-certificate-backup-1

# Restart containers
docker compose restart
```

### Database Backup
The backup service automatically:
- Creates hourly backups in the `./backups` directory
- Maintains backups for 7 days
- Deletes older backups automatically

Manual backup:
```bash
docker exec vaccine-certificate-mysql-1 mysqldump -u appuser -papppassword vaccine_db > manual_backup.sql
```

## Troubleshooting

### Database Connection Issues
1. Check if MySQL container is running:
```bash
docker ps | grep mysql
```

2. Verify MySQL logs:
```bash
docker logs vaccine-certificate-mysql-1
```

3. Test database connection:
```bash
docker exec -it vaccine-certificate-mysql-1 mysql -u appuser -papppassword vaccine_db
```

### Application Issues
1. Check PM2 logs:
```bash
pm2 logs vaccine-certificate
```

2. Verify Next.js build:
```bash
npm run build
```

3. Check application logs:
```bash
tail -f /var/www/vaccine-certificate/logs/error.log
```

## Security Notes

1. The MySQL root password and application database credentials are set in `docker-compose.yml`
2. Database port 3307 is exposed for local development
3. Ensure proper firewall rules are in place
4. Keep environment variables secure and never commit them to version control

## Maintenance

### Regular Updates
```bash
# Update application
git pull
npm install
npm run build
pm2 restart vaccine-certificate

# Update Docker images
docker compose pull
docker compose up -d
```

### Log Rotation
PM2 handles log rotation automatically. For Docker logs:
```bash
# Clear Docker logs
docker system prune
```

## Support

For any deployment issues or questions, please contact:
- System Administrator: [contact details]
- Development Team: [contact details]

## Updating Deployment

When you need to update the deployed application, follow these steps:

1. **SSH into the server**
   ```bash
   ssh popular@115.69.210.131
   ```

2. **Navigate to project directory**
   ```bash
   cd /var/www/vaccine-certificate
   ```

3. **Clean up existing PM2 processes**
   ```bash
   # Stop and remove all PM2 processes
   pm2 delete all
   pm2 save --force
   ```

4. **Update and build the application**
   ```bash
   # Pull latest changes
   git pull

   # Install dependencies
   npm install

   # Build the application
   npm run build
   ```

5. **Start the application with PM2**
   ```bash
   pm2 start npm --name "vaccine-certificate" -- start
   pm2 save
   ```

6. **Troubleshooting Port Issues**
   If you encounter port 3000 already in use:
   ```bash
   # Find processes using port 3000
   sudo lsof -i :3000 | grep LISTEN

   # Kill the process (replace PID with actual process ID)
   sudo kill -9 <PID>

   # Restart the application
   pm2 delete all
   pm2 save --force
   pm2 start npm --name "vaccine-certificate" -- start
   pm2 save
   ```

7. **Verify Deployment**
   - Check application logs: `pm2 logs vaccine-certificate`
   - Visit the website: https://vaccine.popularsylhet.com/
   - Test core functionality after deployment

**Note**: Always ensure to check the logs for any errors after deployment. If the application is not accessible, verify that nginx is properly configured and running.