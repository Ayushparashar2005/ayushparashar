import YouTube from 'youtube-sr';

async function test() {
    const channelId = 'UCTWZFNloPx0rNAd8Dhesdqg';
    try {
        const url = `https://www.youtube.com/channel/${channelId}/videos`;
        // wait, youtube-sr has a method to fetch channel videos but usually not well documented for all.
        // let's try getting playlist of uploads
        const uploadsPlaylist = `UUTWZFNloPx0rNAd8Dhesdqg`;
        const playlist = await YouTube.getPlaylist(uploadsPlaylist, { limit: 100 });
        console.log(`Found ${playlist?.videos?.length} videos!`);
        if (playlist && playlist.videos) {
            for (let i = 0; i < Math.min(5, playlist.videos.length); i++) {
                console.log(playlist.videos[i].title);
            }
        }
    } catch (e) {
        console.error(e);
    }
}
test();
