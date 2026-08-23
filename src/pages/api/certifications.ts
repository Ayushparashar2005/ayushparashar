import { certifications } from '../../db/schema';
import { createCrudRoute } from '../../lib/createCrudRoute';

export const { POST, PUT, DELETE, prerender } = createCrudRoute({
  table: certifications,
  tableName: 'certifications',
  defaultValues: (data, maxOrder) => {
    if (!data.title || !data.issuer || !data.date) throw new Error("Missing required fields");
    return {
      title: data.title,
      issuer: data.issuer,
      date: data.date,
      credentialUrl: data.credentialUrl || null,
      displayOrder: data.displayOrder ?? (maxOrder + 1)
    };
  },
  updateFields: (data) => ({
    title: data.title,
    issuer: data.issuer,
    date: data.date,
    credentialUrl: data.credentialUrl,
    displayOrder: data.displayOrder
  })
});
