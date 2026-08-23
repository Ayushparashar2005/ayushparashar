import ytch from 'yt-channel-info';

async function test() {
    const channelId = 'UCTWZFNloPx0rNAd8Dhesdqg';
    try {
        const response = await ytch.getChannelVideos({ channelId, sortBy: 'newest' });
        console.log(`Found ${response.items.length} videos!`);
        for (let i = 0; i < Math.min(5, response.items.length); i++) {
            console.log(response.items[i].title);
        }
        if (response.continuation) {
            console.log('Has more videos!');
            const more = await ytch.getChannelVideosMore({ continuation: response.continuation });
            console.log(`Fetched ${more.items.length} more videos!`);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
