import { createHighlighter, type Highlighter } from 'shiki';

let highlighter: Highlighter | null = null;
let initPromise: Promise<Highlighter> | null = null;

export function initHighlighter(): Promise<Highlighter> {
  if (highlighter) return Promise.resolve(highlighter);
  if (!initPromise) {
    initPromise = createHighlighter({
      themes: ['github-dark'],
      langs: ['typescript', 'css', 'json', 'bash', 'html', 'javascript'],
    }).then((h) => {
      highlighter = h;
      return h;
    });
  }
  return initPromise;
}