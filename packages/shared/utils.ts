export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const noop = () => {};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) {
    return '-';
  }
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
