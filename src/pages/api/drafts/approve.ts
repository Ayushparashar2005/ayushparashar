import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { projectDrafts, projects } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // We expect the edited draft data to be passed in
    const { id, title, description, category, tech, githubUrl } = data;
    
    if (!id || !title) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Insert into projects table
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    await db.insert(projects).values({
      id: crypto.randomUUID(),
      title,
      slug,
      description: description || null,
      tech: tech || [],
      category: category || null,
      githubUrl: githubUrl || null,
      status: 'PUBLISHED',
      displayOrder: 0
    });

    // Delete from projectDrafts
    await db.delete(projectDrafts).where(eq(projectDrafts.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
