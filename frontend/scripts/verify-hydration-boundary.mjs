import { readFile } from 'node:fs/promises';

const layoutPath = new URL('../src/app/layout.tsx', import.meta.url);
const layout = await readFile(layoutPath, 'utf8');

if (!/<body[^>]*suppressHydrationWarning/.test(layout)) {
  throw new Error('Root body must suppress extension-induced hydration warnings.');
}

console.log('Hydration boundary check passed.');