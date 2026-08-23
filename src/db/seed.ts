import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log('Seeding data...');

  const projectsToInsert = [
    {
      id: crypto.randomUUID(),
      title: 'KindMinds AI',
      slug: 'kindminds-ai',
      category: 'AI',
      githubUrl: 'Ayushparashar2005/kindminds',
      status: 'PUBLISHED',
      displayOrder: 1,
    },
    {
      id: crypto.randomUUID(),
      title: 'Fashion Recommender System',
      slug: 'fashion-recommender-system',
      category: 'AI',
      githubUrl: 'Ayushparashar2005/fashion-recommender-system-project',
      status: 'PUBLISHED',
      displayOrder: 2,
    },
  ];

  for (const project of projectsToInsert) {
    await db.insert(schema.projects).values(project).onConflictDoNothing();
  }

  console.log('Seeding complete.');
}

seed().catch(console.error);
