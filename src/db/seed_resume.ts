import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seedResume() {
  console.log('Seeding resume data...');
  
  // Education
  await db.insert(schema.certifications).values({
    id: crypto.randomUUID(),
    title: 'B.Tech in Computer Science (AI and ML)',
    issuer: 'SGT University',
    date: 'June 2027',
    displayOrder: 1
  });

  // Experience
  await db.insert(schema.experience).values({
    id: crypto.randomUUID(),
    company: 'Samatrix Consulting pvt ltd',
    role: 'Data Analyst and Statistical Modeling Intern',
    startDate: 'June 2025',
    endDate: 'July 2025',
    description: 'Optimized call center staffing using M/M/s queue simulation, reducing simulated 95th percentile customer wait time by 40%. Designed and analyzed A/B testing framework. Built survival analysis models using Kaplan-Meier and Cox Proportional Hazards.',
    displayOrder: 1
  });

  // Skills
  const technicalSkills = [
    { name: 'Python', category: 'Languages', prof: 90 },
    { name: 'C++', category: 'Languages', prof: 80 },
    { name: 'Java', category: 'Languages', prof: 70 },
    { name: 'Kotlin', category: 'Languages', prof: 75 },
    { name: 'Dart', category: 'Languages', prof: 60 },
    { name: 'R', category: 'Languages', prof: 50 },
    
    { name: 'TensorFlow', category: 'Technologies', prof: 85 },
    { name: 'PyTorch', category: 'Technologies', prof: 85 },
    { name: 'Django', category: 'Technologies', prof: 75 },
    { name: 'Flask', category: 'Technologies', prof: 75 },
    { name: 'Pandas', category: 'Technologies', prof: 95 },
    { name: 'Flutter', category: 'Technologies', prof: 70 },
    { name: 'Android SDK', category: 'Technologies', prof: 65 }
  ];

  for (let i = 0; i < technicalSkills.length; i++) {
    const s = technicalSkills[i];
    await db.insert(schema.skills).values({
      id: crypto.randomUUID(),
      name: s.name,
      category: s.category,
      proficiency: s.prof,
      displayOrder: i
    });
  }

  console.log('Resume seeded successfully!');
}

seedResume().catch(console.error);
