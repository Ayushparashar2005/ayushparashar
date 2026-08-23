import { db } from '../src/db/index.js';
import { youtubeVideos } from '../src/db/schema.js';

const CHANNEL_ID = 'UCTWZFNloPx0rNAd8Dhesdqg';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

async function seedYoutube() {
    try {
        console.log(`Fetching RSS feed for channel: ${CHANNEL_ID}...`);
        const response = await fetch(RSS_URL);
        const xmlText = await response.text();

        // Very basic regex parsing since we don't have a DOMParser in Node by default
        // and we don't want to install new heavy dependencies.
        
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;
        const videos = [];

        while ((match = entryRegex.exec(xmlText)) !== null) {
            const entryText = match[1];
            
            const videoIdMatch = entryText.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
            const titleMatch = entryText.match(/<title>(.*?)<\/title>/);
            const publishedMatch = entryText.match(/<published>(.*?)<\/published>/);
            const thumbnailMatch = entryText.match(/<media:thumbnail url="(.*?)"/);
            
            if (videoIdMatch && titleMatch && publishedMatch) {
                videos.push({
                    id: videoIdMatch[1],
                    title: titleMatch[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
                    thumbnailUrl: thumbnailMatch ? thumbnailMatch[1] : `https://i.ytimg.com/vi/${videoIdMatch[1]}/hqdefault.jpg`,
                    publishedAt: new Date(publishedMatch[1]),
                    status: 'PUBLISHED'
                });
            }
        }

        console.log(`Found ${videos.length} videos. Inserting into database...`);

        // Insert into database, on conflict do nothing (or we could update, but doing nothing is fine for simple seed)
        for (const video of videos) {
            try {
                await db.insert(youtubeVideos).values(video).onConflictDoNothing();
                console.log(`+ Inserted: ${video.title}`);
            } catch (err) {
                console.error(`Failed to insert ${video.id}:`, err);
            }
        }

        console.log("YouTube Seeding Complete!");
        process.exit(0);

    } catch (error) {
        console.error("Error seeding youtube data:", error);
        process.exit(1);
    }
}

seedYoutube();
