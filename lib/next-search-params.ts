/** Plain searchParams object from Next.js `use(searchParamsPromise)` */

export type NextSearchParamsRecord = Record<
  string,
  string | string[] | undefined
>;

export function searchParamsRecordToString(sp: NextSearchParamsRecord): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) q.append(key, v);
    } else {
      q.set(key, value);
    }
  }
  return q.toString();
}

export function getSearchParam(
  sp: NextSearchParamsRecord,
  key: string,
): string | undefined {
  const v = sp[key];
  if (Array.isArray(v)) return v[0];
  return v;
}

export function mergeSearchParamsString(
  base: NextSearchParamsRecord,
  updates: Record<string, string | number | null>,
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(base)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      for (const x of v) q.append(k, x);
    } else {
      q.set(k, v);
    }
  }
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) q.delete(key);
    else q.set(key, String(value));
  }
  return q.toString();
}
