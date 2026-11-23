import { expect, test } from 'vitest';
import { tabFromToolResult } from './toolResults';

test('generate with a bare type: the default-version note becomes the tab info, not content', () => {
  const tab = tabFromToolResult({
    name: 'generate',
    args: { ref: 'MAPEM', minimal: true, comment: 'Minimal MAP' },
    output: 'Generated as _mapem_v2, the default version of MAPEM\n\n{"map":{}}',
    error: null,
  });
  expect(tab?.content.startsWith('{')).toBe(true);
  expect(tab?.info?.resolvedRef).toBe('_mapem_v2');
  expect(tab?.originalInput).toBe('# Minimal MAP\n# generate ref=MAPEM format=JER minimal');
});
