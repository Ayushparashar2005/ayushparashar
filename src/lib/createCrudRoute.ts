import type { APIRoute } from 'astro';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import type { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';

type CrudOptions = {
  table: any; // The Drizzle table object
  tableName: string; // The query key for db.query (e.g. 'projects')
  defaultValues?: (data: any, maxOrder: number) => any;
  updateFields?: (data: any) => any;
};

export function createCrudRoute(options: CrudOptions) {
  const POST: APIRoute = async ({ request }) => {
    try {
      const data = await request.json();
      const newId = crypto.randomUUID();
      
      const allItems = await db.select().from(options.table);
      const maxOrder = allItems.length > 0 && allItems[0].displayOrder !== undefined 
        ? Math.max(...allItems.map((p: any) => p.displayOrder || 0)) 
        : -1;
      
      const insertData = {
        id: newId,
        ...(options.defaultValues ? options.defaultValues(data, maxOrder) : data)
      };

      await db.insert(options.table).values(insertData);

      // We have to use a generic select since db.query[tableName] is hard to type dynamically
      const inserted = await db.select().from(options.table).where(eq(options.table.id, newId)).limit(1);

      return new Response(JSON.stringify(inserted[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  };

  const PUT: APIRoute = async ({ request }) => {
    try {
      const data = await request.json();
      const { id } = data;
      
      const updateData = options.updateFields 
        ? options.updateFields(data)
        : { ...data, id: undefined, updatedAt: new Date() };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      await db.update(options.table).set(updateData).where(eq(options.table.id, id));

      const updated = await db.select().from(options.table).where(eq(options.table.id, id)).limit(1);

      return new Response(JSON.stringify(updated[0]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  };

  const DELETE: APIRoute = async ({ request }) => {
    try {
      const data = await request.json();
      await db.delete(options.table).where(eq(options.table.id, data.id));
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  };

  return { POST, PUT, DELETE, prerender: false };
}
