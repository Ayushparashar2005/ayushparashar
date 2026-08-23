import { skills } from '../../db/schema';
import { createCrudRoute } from '../../lib/createCrudRoute';

export const { POST, PUT, DELETE, prerender } = createCrudRoute({
  table: skills,
  tableName: 'skills',
  defaultValues: (data, maxOrder) => {
    if (!data.name || !data.category) throw new Error("Missing required fields");
    return {
      name: data.name,
      category: data.category,
      proficiency: data.proficiency || 50,
      displayOrder: data.displayOrder ?? (maxOrder + 1)
    };
  },
  updateFields: (data) => ({
    name: data.name,
    category: data.category,
    proficiency: data.proficiency,
    displayOrder: data.displayOrder
  })
});
