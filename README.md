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
