import type { APIRoute } from 'astro';
import { db } from '../../db';
import { projectDrafts } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  try {
    const drafts = await db.select().from(projectDrafts);
    return new Response(JSON.stringify(drafts), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    if (!data.id) {
      return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });
    }
    await db.delete(projectDrafts).where(eq(projectDrafts.id, data.id));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
