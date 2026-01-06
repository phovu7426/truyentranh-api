/**
 * Convert BigInt sâu trong object/array thành number để tránh lỗi JSON stringify.
 * Có thể thay bằng string nếu muốn an toàn hơn.
 */
export const toPlain = (value: any): any => {
  if (typeof value === 'bigint') return Number(value);
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPlain(v)]));
  }
  return value;
};

/**
 * Parse sort string(s) thành Prisma orderBy array/object, có kiểm soát field hợp lệ.
 */
export const buildOrderBy = (
  sort: string | string[] | undefined,
  allowedFields: string[],
  defaultField: string,
  defaultDirection: 'asc' | 'desc' = 'desc',
) => {
  const items = Array.isArray(sort) ? sort : sort ? [sort] : [];
  const order: any[] = [];

  for (const item of items) {
    if (typeof item !== 'string') continue;
    const [rawField, rawDir] = item.split(':');
    const field = (rawField || '').trim();
    const dir = (rawDir || '').toLowerCase() === 'asc' ? 'asc' : 'desc';
    if (field && allowedFields.includes(field)) {
      order.push({ [field]: dir });
    }
  }

  if (order.length === 0 && defaultField) {
    order.push({ [defaultField]: defaultDirection });
  }

  // Prisma chấp nhận object hoặc array; ưu tiên array để giữ nhiều sort
  if (order.length === 1) return order[0];
  return order;
};

