export async function fetchLatestYouTubeVideos(channelId: string, maxResults = 5) {
  const apiKey = import.meta.env?.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error("YOUTUBE_API_KEY is missing");

  // First, get the 'uploads' playlist ID for the channel
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  const channelRes = await fetch(channelUrl);
  const channelData = await channelRes.json();
  
  if (!channelData.items || channelData.items.length === 0) {
    throw new Error("Channel not found");
  }

  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // Now fetch items from that playlist
  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`;
  const playlistRes = await fetch(playlistUrl);
  const playlistData = await playlistRes.json();

  return playlistData.items || [];
}
