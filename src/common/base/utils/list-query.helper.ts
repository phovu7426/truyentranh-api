/**
 * Prepare query parameters from request query
 * This function extracts filters and options from query object
 */
export function prepareQuery(query: any = {}): { filters: any; options: any } {
  const filterInput: any = {};
  const optionInput: any = {};
  if (query && typeof query === 'object') {
    if (query.filters && typeof query.filters === 'object') {
      Object.assign(filterInput, query.filters);
    }
    if (query.options && typeof query.options === 'object') {
      Object.assign(optionInput, query.options);
    }
  }
  const rootCompat: any = {};
  if (query.page !== undefined) rootCompat.page = query.page;
  if (query.limit !== undefined) rootCompat.limit = query.limit;
  if (query.sort !== undefined) rootCompat.sort = query.sort;
  // Hỗ trợ sort_by và sort_order (backward compatibility)
  if (query.sort_by && !query.sort) {
    const sortOrder = (query.sort_order || 'DESC').toUpperCase();
    rootCompat.sort = `${query.sort_by}:${sortOrder}`;
  }
  if (query.format !== undefined) rootCompat.format = query.format;
  const options = { ...rootCompat, ...optionInput };
  return { filters: filterInput, options };
}
