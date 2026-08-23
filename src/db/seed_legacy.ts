import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seedLegacy() {
  console.log('Clearing existing legacy projects and certifications...');
  await db.delete(schema.projects);
  await db.delete(schema.certifications);
  console.log('Seeding legacy projects and certifications...');
  
  const projectsData = [
    {
      title: 'Kindminds Ai',
      slug: 'kindminds-ai',
      desc: 'KindMinds is a conversational AI web application designed for supportive, reflective interaction rather than pure question‑answering.',
      tags: ['Next.js (App Router)', 'TypeScript', 'Tailwind', 'shadcn/ui'],
      category: 'ai',
      link: 'https://github.com/Ayushparashar2005/kindminds'
    },
    {
      title: 'fashion-recommender-system',
      slug: 'fashion-recommender-system',
      desc: 'A Deep Learning based Fashion Recommender System using the ResNET50 model to suggest similar clothing items based on user input images.',
      tags: ['Python','Deep Learning','Recommender System'],
      category: 'ai',
      link: 'https://github.com/Ayushparashar2005/fashion-recommender-system-project'
    },
    {
      title: 'Spam Email Classification Using LSTM',
      slug: 'spam-email-classification',
      desc: 'Developed a deep learning model using LSTM to classify emails as spam or non-spam. Involved data cleaning, text preprocessing, and exploratory data analysis.',
      tags: ['Python','Deep Learning','NLP'],
      category: 'ai',
      link: 'https://github.com/Ayushparashar2005/Spam-Email-Classification-Using-LSTM'
    },
    {
      title: 'movie-recommender-system',
      slug: 'movie-recommender-system',
      desc: 'A Movie Recommender System built using Python that suggests movies to users based on their preferences and viewing history, utilizing collaborative filtering techniques.',
      tags: ['Python','Machine Learning','Recommender System'],
      category: 'ai',
      link: 'https://github.com/Ayushparashar2005/movie-recommender-system'
    },
    {
      title: "Swastha Prameha",
      slug: "swastha-prameha",
      desc: "SwasthPrameh is a Next.js platform combining Ayurvedic expertise, machine learning, and community health worker tooling to deliver adaptive diabetes care plans.",
      tags: ['AI','Python','Healthcare'],
      category: 'ai',
      link: 'https://github.com/Ayushparashar2005/swastha-prameh'
    },
    {
      title: 'doctalk',
      slug: 'doctalk',
      desc: 'doctalk sumarizes pdf and document built using groq api and kotlin',
      tags: ['kotlin','groq api','AI'],
      category: 'mobile',
      link: 'https://github.com/Ayushparashar2005/doctalk'
    },
    {
      title: 'routesim',
      slug: 'routesim',
      desc: 'RouteSim is an advanced educational tool designed to visualize complex network routing algorithms.',
      tags: ['JavaScript','D3.js','AI'],
      category: 'web',
      link: 'https://github.com/Ayushparashar2005/routesom'
    },
    {
      title: 'WAFinity',
      slug: 'wafinity',
      desc: 'WAFinity is an Advanced Web Application Firewall (WAF) that protects web applications from known threats.',
      tags: ['HTML','CSS','JavaScript','machine learning','flask','python'],
      category: 'web',
      link: 'https://github.com/Ayushparashar2005/cybercyan'
    },
    {
      title: 'Finvest',
      slug: 'finvest',
      desc: 'AI enabled finance advisor and investment management application development using the flutter framework.',
      tags: ['Flutter','Dart','AI','Python','Flask'],
      category: 'mobile',
      link: 'https://github.com/Ayushparashar2005/finvest-ai-finance-app'
    },
    {
      title: 'Sulphur',
      slug: 'sulphur',
      desc: 'A new Flutter project. made a app to sync bus stops with geolocation.',
      tags: ['Flutter','Dart','AI','Python','Flask'],
      category: 'mobile',
      link: 'https://github.com/Ayushparashar2005/sulphur'
    },
    {
      title: 'rockpaperscissors',
      slug: 'rockpaperscissors',
      desc: 'Fun rock-paper-scissors game in java',
      tags: ['Java','Game','CLI'],
      category: 'game',
      link: 'https://github.com/Ayushparashar2005/rockpaperscissors'
    }
  ];

  const certificationsData = [
    { title: 'Artificial Intelligence Course', issuer: 'Samsung Innovation Campus -SIC', date: '2024' },
    { title: 'Ai for beginners', issuer: 'HP LIFE', date: '2024' },
    { title: 'Foundation to AI Data analytics', issuer: 'Samatrix.io', date: '2024' },
    { title: 'Data analytics using python', issuer: 'Samatrix.io', date: '2024' },
    { title: 'C programming', issuer: 'Great learning', date: '2024' },
    { title: 'Data Analytics & Visualization Job Simulation Forage', issuer: 'Forage', date: '2025' }
  ];

  for (let i = 0; i < projectsData.length; i++) {
    const p = projectsData[i];
    await db.insert(schema.projects).values({
      id: crypto.randomUUID(),
      title: p.title,
      slug: p.slug,
      description: p.desc,
      tech: p.tags,
      category: p.category,
      githubUrl: p.link.replace('https://github.com/', ''),
      status: 'PUBLISHED',
      displayOrder: i
    });
  }

  for (let i = 0; i < certificationsData.length; i++) {
    const c = certificationsData[i];
    await db.insert(schema.certifications).values({
      id: crypto.randomUUID(),
      title: c.title,
      issuer: c.issuer,
      date: c.date,
      displayOrder: i + 2 // start after the one inserted earlier
    });
  }

  console.log('Legacy data seeded successfully!');
}

seedLegacy().catch(console.error);
