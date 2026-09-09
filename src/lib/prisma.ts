import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to initialize Prisma Client');
}

const adapter = new PrismaPg({ connectionString });

/** Slow-query threshold in ms (flags any DB query above it). */
function slowQueryMs(): number {
  const v = Number(process.env.SLOW_QUERY_MS ?? 200);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 200;
}

function makeClient() {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends({
    query: {
      // Performance monitoring: structured warning for every query above
      // the slow threshold (model, operation, duration). Zero behavior change.
      async $allOperations({ model, operation, args, query }) {
        const start = Date.now();
        try {
          return await query(args);
        } finally {
          const durationMs = Date.now() - start;
          const threshold = slowQueryMs();
          if (durationMs > threshold) {
            console.warn(
              JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'warn',
                event: 'slow-query',
                model,
                operation,
                durationMs,
                thresholdMs: threshold,
              })
            );
          }
        }
      },
    },
  });
}

type ExtendedClient = ReturnType<typeof makeClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedClient | undefined;
};

export const prisma: ExtendedClient = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
