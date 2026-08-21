/**
 * Match result interface for pattern matching
 */
export interface MatchResult {
  params: Record<string, string>;
  pattern: string;
}

/**
 * Convert route pattern to regex and extract parameter names
 * @param pattern - Route pattern, e.g. '/users/:id'
 * @returns Regex and parameter names
 */
export function patternToRegex(pattern: string): { regex: RegExp; paramNames: string[] } {
  // Escape special regex characters except for : and *
  const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

  // Replace :param and * patterns
  const paramNames: string[] = [];
  let regexPattern = escapedPattern.replace(/:([^/:]+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)';
  });

  // Handle wildcard (*)
  regexPattern = regexPattern.replace(/\*/g, '.*');

  return {
    regex: new RegExp(`^${regexPattern}$`),
    paramNames
  };
}

/**
 * Match a route pattern against a path
 * @param pattern - Route pattern to match
 * @param path - Path to test against
 * @returns Match result with extracted parameters, or null if no match
 */
export function matchPattern(pattern: string, path: string): MatchResult | null {
  const { regex, paramNames } = patternToRegex(pattern);
  const match = path.match(regex);

  if (!match) return null;

  const params: Record<string, string> = {};
  paramNames.forEach((name, index) => {
    params[name] = match[index + 1] || '';
  });

  return { params, pattern };
}

/**
 * Extract parameters from a route pattern and path
 * @param pattern - Route pattern with parameters
 * @param path - Actual path to extract from
 * @returns Object containing extracted parameters
 */
export function extractParams(pattern: string, path: string): Record<string, string> {
  const result = matchPattern(pattern, path);
  return result ? result.params : {};
}

/**
 * Parse query string into object
 * @param search - Query string (with or without leading '?')
 * @returns Object containing parsed query parameters
 */
export function parseQuery(search: string): Record<string, string> {
  const params: Record<string, string> = {};

  if (!search || search === '?' || search === '#') return params;

  // Remove leading ? or #
  const queryString = search.startsWith('?') || search.startsWith('#')
    ? search.substring(1)
    : search;

  if (!queryString) return params;

  queryString.split('&').forEach((pair) => {
    const [key, value = ''] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });

  return params;
}

/**
 * Stringify query object into query string
 * @param query - Object containing query parameters
 * @returns Query string without leading '?'
 */
export function stringifyQuery(query: Record<string, string>): string {
  return Object.entries(query)
    .filter(([key]) => key !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}
