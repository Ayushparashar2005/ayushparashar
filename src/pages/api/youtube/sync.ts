import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { youtubeVideos } from '../../../db/schema';
import { fetchLatestYouTubeVideos } from '../../../lib/youtube';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // In a real app, verify the auth session here before proceeding
    
    // Assuming VOYXGE channel ID or similar
    const channelId = import.meta.env?.YOUTUBE_CHANNEL_ID || process.env.YOUTUBE_CHANNEL_ID;
    
    if (!channelId) {
       return new Response(JSON.stringify({ success: false, error: 'YOUTUBE_CHANNEL_ID missing' }), { status: 500 });
    }

    const videos = await fetchLatestYouTubeVideos(channelId, 5);
    let addedCount = 0;

    for (const video of videos) {
      const videoId = video.contentDetails.videoId;
      
      const existing = await db.query.youtubeVideos.findFirst({
         where: (yv: any, { eq }: any) => eq(yv.id, videoId)
      });
      
      if (!existing) {
         await db.insert(youtubeVideos).values({
            id: videoId,
            title: video.snippet.title,
            thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
            publishedAt: new Date(video.contentDetails.videoPublishedAt),
            status: 'PUBLISHED'
         });
         addedCount++;
      }
    }

    return new Response(JSON.stringify({ success: true, added: addedCount }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
};
