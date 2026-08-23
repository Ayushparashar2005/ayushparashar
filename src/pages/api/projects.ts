import { projects } from '../../db/schema';
import { createCrudRoute } from "../../lib/createCrudRoute";

export const { POST, PUT, DELETE, prerender } = createCrudRoute({
  table: projects,
  tableName: 'projects',
  defaultValues: (data, maxOrder) => ({
    title: data.title,
    description: data.description || 'Project description goes here...',
    category: data.category || 'Engineering',
    status: data.status || 'DRAFT',
    githubUrl: data.githubUrl || null,
    liveUrl: data.liveUrl || null,
    tech: data.tech || [],
    displayOrder: maxOrder + 1
  }),
  updateFields: (data) => ({
    title: data.title,
    description: data.description,
    category: data.category,
    status: data.status,
    githubUrl: data.githubUrl,
    liveUrl: data.liveUrl,
    tech: data.tech,
    updatedAt: new Date()
  })
});
