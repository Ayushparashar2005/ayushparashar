import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { projects, projectDrafts } from '../../../db/schema';
import { fetchGithubUserRepos, fetchGithubRepo, fetchGithubReadme } from '../../../lib/github';
import { analyzeReadmeWithGemini } from '../../../lib/gemini';
import { inArray } from 'drizzle-orm';
import crypto from 'crypto';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const githubUsername = 'Ayushparashar2005';
    const userRepos = await fetchGithubUserRepos(githubUsername);
    
    // Filter to just non-forks
    const reposToSync = userRepos.filter((r: any) => !r.fork);
    
    const results = [];
    let successCount = 0;

    for (const repoData of reposToSync) {
      const repoName = repoData.full_name;
      try {
        const existingProject = await db.query.projects.findFirst({
          where: (projects: any, { eq }: any) => eq(projects.githubUrl, repoName)
        });
        
        const existingDraft = await db.query.projectDrafts.findFirst({
          where: (drafts: any, { eq }: any) => eq(drafts.repoFullName, repoName)
        });

        if (existingProject || existingDraft) {
          results.push({ repo: repoName, status: 'already_exists' });
          continue;
        }

        // We already have repoData from the initial fetch list, so no need to call fetchGithubRepo!
        const readme = await fetchGithubReadme(repoName);
        
        if (!readme) {
           results.push({ repo: repoName, status: 'no_readme' });
           continue;
        }

        const aiAnalysis = await analyzeReadmeWithGemini(readme, repoName);
        
        await db.insert(projectDrafts).values({
          id: crypto.randomUUID(),
          repoFullName: repoName,
          title: repoData.name || aiAnalysis.title || repoName,
          description: aiAnalysis.description || repoData.description,
          tech: aiAnalysis.tech || [],
          category: aiAnalysis.category || 'Engineering',
          githubUrl: repoName
        });
        
        results.push({ repo: repoName, status: 'draft_created' });
        successCount++;

      } catch (err: any) {
        console.error(`Error processing ${repoName}:`, err);
        results.push({ repo: repoName, status: 'error', error: err.message });
      }
    }

    if (successCount === 0 && results.some(r => r.status === 'error')) {
      const firstError = results.find(r => r.status === 'error')?.error;
      return new Response(JSON.stringify({ success: false, error: firstError || "Failed to process repositories" }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};
