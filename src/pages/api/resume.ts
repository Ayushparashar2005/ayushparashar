import type { APIRoute } from 'astro';
import { db } from '../../db';
import { identity as identitySchema } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  try {
    const existingRecords = await db.select().from(identitySchema).where(eq(identitySchema.id, 'main'));
    
    if (existingRecords.length > 0 && existingRecords[0].resumeFileData) {
      const base64Data = existingRecords[0].resumeFileData;
      const pdfBuffer = Buffer.from(base64Data, 'base64');
      
      return new Response(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${existingRecords[0].resumeFileName || 'resume.pdf'}"`,
        }
      });
    }

    // Fallback if no resume is found in the database
    return new Response('Resume not found. Please upload it via Patch Bay.', { status: 404 });
  } catch (error) {
    console.error('Error serving resume API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
