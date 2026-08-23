import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      hasDatabaseUrl: !!(import.meta.env?.DATABASE_URL || process.env.DATABASE_URL),
      hasBetterAuthSecret: !!(import.meta.env?.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET),
      hasBetterAuthUrl: !!(import.meta.env?.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL),
      hasVercelUrl: !!(import.meta.env?.VERCEL_URL || process.env.VERCEL_URL),
      hasGithubId: !!(import.meta.env?.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID),
      hasGithubSecret: !!(import.meta.env?.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET),
      hasGoogleId: !!(import.meta.env?.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID),
      hasGoogleSecret: !!(import.meta.env?.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET),
      nodeEnv: import.meta.env?.NODE_ENV || process.env.NODE_ENV,
    }, null, 2),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
