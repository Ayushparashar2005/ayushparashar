import type { APIRoute } from 'astro';
import { db } from '../../db';
import { skills, experience, certifications, projects, youtubePlaylists } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const PUT: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { table, items } = data; // items: { id: string, displayOrder: number }[]
    
    if (!table || !items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }
    
    let schemaTable: any;
    if (table === 'skills') schemaTable = skills;
    else if (table === 'experience') schemaTable = experience;
    else if (table === 'certifications') schemaTable = certifications;
    else if (table === 'projects') schemaTable = projects;
    else if (table === 'youtube_playlists') schemaTable = youtubePlaylists;
    else {
      return new Response(JSON.stringify({ error: "Invalid table" }), { status: 400 });
    }

    const promises = items.map(item => 
      db.update(schemaTable)
        .set({ displayOrder: item.displayOrder })
        .where(eq(schemaTable.id, item.id))
    );

    await Promise.all(promises);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
