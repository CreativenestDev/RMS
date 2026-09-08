import { execSync } from 'child_process';

console.log('🚀 Starting build & migration workflow...');

// 1. Prisma client generation
try {
  console.log('⚡ Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (err) {
  console.warn('⚠️ Prisma generate error:', err.message);
}

// 2. Automated Migration and Seeding
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;

if (dbUrl && (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'))) {
  console.log('🔗 PostgreSQL connection detected. Pushing schema...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('🌱 Checking seed data...');
    execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' });
    console.log('✅ Database synchronized & verified.');
  } catch (err) {
    console.warn('⚠️ Automated migration/seed note:', err.message);
  }
} else {
  console.log('ℹ️ No PostgreSQL URL provided at build time (using resilient demo fallback).');
}

// 3. Next.js production build
console.log('📦 Running Next.js build...');
execSync('next build', { stdio: 'inherit' });