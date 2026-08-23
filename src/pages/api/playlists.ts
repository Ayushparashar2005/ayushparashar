import { youtubePlaylists } from '../../db/schema';
import { createCrudRoute } from '../../lib/createCrudRoute';

export const { POST, PUT, DELETE, prerender } = createCrudRoute({
  table: youtubePlaylists,
  tableName: 'youtubePlaylists',
  defaultValues: (data, maxOrder) => {
    if (!data.id || !data.title) throw new Error("Missing required fields");
    return {
      id: data.id, // User provides YouTube Playlist ID explicitly
      title: data.title,
      thumbnailUrl: data.thumbnailUrl || null,
      displayOrder: data.displayOrder ?? (maxOrder + 1)
    };
  },
  updateFields: (data) => ({
    title: data.title,
    thumbnailUrl: data.thumbnailUrl,
    displayOrder: data.displayOrder
  })
});
