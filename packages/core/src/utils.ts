// export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const _noop = () => {};

export const _split = (template: TemplateStringsArray): string[] => template[0].split(',');

export const _pad = (n: number): string => (n < 10 ? '0' + n : String(n));

export const _formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = _pad(date.getMonth() + 1);
  const day = _pad(date.getDate());
  return `${year}-${month}-${day}`;
};

export const _formatTime = (h: number, m: number): string => `${_pad(h)}:${_pad(m)}`;

export const _formatDateTime = (d: Date): string => {
  const date = `${d.getFullYear()}-${_pad(d.getMonth() + 1)}-${_pad(d.getDate())}`;
  const time = `${_pad(d.getHours())}:${_pad(d.getMinutes())}`;
  return `${date} ${time}`;
};

export const _isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// export const formatDate = (dateStr: string): string => {
//   if (!dateStr) {
//     return '-';
//   }
//   const date = new Date(dateStr);
//   return date.toLocaleString('zh-CN', {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit',
//   });
// };

// export const _errMsg = (e: unknown): string => (e instanceof Error ? e.message : String(e));

export type Split<S extends string, D extends string> = S extends `${infer Head}${D}${infer Tail}`
  ? [Head, ...Split<Tail, D>]
  : [S];
