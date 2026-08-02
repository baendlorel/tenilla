# Tenilla Document

This package is a Vite-powered example and documentation site for Tenilla.

## Development

```bash
pnpm install
pnpm --filter @tenilla/document dev
```

## Build

```bash
pnpm --filter @tenilla/document build
```

## Notes

- Vite is installed only in this package.
- The site resolves local workspace packages through Vite aliases, so it can render examples directly from source files.
- The main navigation is implemented with `TabPanel` and each tab contains live examples plus usage snippets.