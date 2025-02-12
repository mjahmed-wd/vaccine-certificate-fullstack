FROM node:20.10-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat netcat-openbsd
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm install

# Development image
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Production image
FROM base AS prod
WORKDIR /app

# Copy application files
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Set build arguments
ARG DATABASE_URL
ARG NEXTAUTH_URL
ARG NEXT_PUBLIC_APP_URL
ARG NEXTAUTH_SECRET
ARG NODE_ENV

# Set environment variables
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client and build
RUN npm install -g pnpm && \
    npx prisma generate && \
    npm run build

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]