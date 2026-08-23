import { experience } from '../../db/schema';
import { createCrudRoute } from '../../lib/createCrudRoute';

export const { POST, PUT, DELETE, prerender } = createCrudRoute({
  table: experience,
  tableName: 'experience',
  defaultValues: (data, maxOrder) => {
    if (!data.company || !data.role || !data.startDate) throw new Error("Missing required fields");
    return {
      company: data.company,
      role: data.role,
      startDate: data.startDate,
      endDate: data.endDate || null,
      description: data.description || null,
      displayOrder: data.displayOrder ?? (maxOrder + 1)
    };
  },
  updateFields: (data) => ({
    company: data.company,
    role: data.role,
    startDate: data.startDate,
    endDate: data.endDate,
    description: data.description,
    displayOrder: data.displayOrder
  })
});
