import ytpl from 'ytpl';

async function test() {
    const playlistId = 'UUTWZFNloPx0rNAd8Dhesdqg'; // Uploads playlist
    try {
        const playlist = await ytpl(playlistId, { pages: Infinity });
        console.log(`Found ${playlist.items.length} videos!`);
        for (let i = 0; i < Math.min(5, playlist.items.length); i++) {
            console.log(playlist.items[i].title);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
