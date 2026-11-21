import { expect, test } from 'vitest';
import { prettyJson } from '@/features/chat/toolResults';
test('pretty', () => {
  const s = '{"a":{"b":[1,2],"c":"x,{y}:\\"z"},"big":123456789012345678901234,"e":[],"f":{}}';
  const p = prettyJson(s);
  console.log(p);
  expect(p.replace(/\s/g, '')).toBe(s.replace(/\s/g, ''));
  expect(JSON.parse(p).a.c).toBe('x,{y}:"z');
  expect(p).toContain('123456789012345678901234');
});
