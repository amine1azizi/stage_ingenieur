export interface ListViewOptions<T> {
  search: string;
  searchFn: (item: T) => string;
  filters: ((item: T) => boolean)[];
  sortFn?: (a: T, b: T) => number;
  sortDir: 'asc' | 'desc';
}

export function normalizeListText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase();
}

export function applyListView<T>(items: T[], opts: ListViewOptions<T>): T[] {
  const searchWords = normalizeListText(opts.search)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const result = items.filter((item) => {
    if (!opts.filters.every((filter) => filter(item))) {
      return false;
    }
    const searchableText = normalizeListText(opts.searchFn(item));
    return searchWords.every((word) => searchableText.includes(word));
  });

  if (opts.sortFn) {
    result.sort((a, b) => {
      const comparison = opts.sortFn!(a, b);
      return opts.sortDir === 'asc' ? comparison : -comparison;
    });
  }
  return result;
}
