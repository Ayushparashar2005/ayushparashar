async function test() {
    const channelId = 'UCTWZFNloPx0rNAd8Dhesdqg';
    try {
        const response = await fetch(`https://invidious.jing.rocks/api/v1/channels/${channelId}/videos?page=1`);
        if (!response.ok) {
            console.error('Failed to fetch:', response.status);
            return;
        }
        const data = await response.json();
        console.log(`Found ${data.length} videos on page 1!`);
        for (let i = 0; i < Math.min(5, data.length); i++) {
            console.log(data[i].title);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
