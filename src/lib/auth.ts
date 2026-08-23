import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema
        }
    }),
    baseURL: (import.meta.env?.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL) as string || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
    socialProviders: {
        github: {
            clientId: (import.meta.env?.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID) as string,
            clientSecret: (import.meta.env?.GITHUB_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET) as string,
        },
        google: {
            clientId: (import.meta.env?.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID) as string,
            clientSecret: (import.meta.env?.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET) as string,
        }
    }
});
