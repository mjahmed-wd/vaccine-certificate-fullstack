/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  // Configure static generation
  staticPageGenerationTimeout: 0,
  // Disable static generation for dynamic routes
  unstable_includeFiles: ['node_modules/.prisma/**/*'],
  // Enable ISR for dynamic routes
  unstable_runtimeJS: true,
}

module.exports = nextConfig 