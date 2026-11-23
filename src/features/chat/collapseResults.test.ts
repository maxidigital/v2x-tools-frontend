import { expect, test } from 'vitest';
import { collapseResults } from './collapseResults';

const json = '{\n  "header": {\n    "protocolVersion": 2,\n    "messageID": 2,\n    "stationID": 1234\n  }\n}';
const tab = { id: 'abc', number: 3, format: 'JER' as const, content: json };

test('replaces a pasted result with a link to its tab', () => {
  const pasted = '{"header":{"protocolVersion":2,"messageID":2,"stationID":1234}}';
  const r = collapseResults(`Here it is:\n\n\`\`\`json\n${pasted}\n\`\`\`\n\nDone.`, [tab]);
  expect(r).toBe('Here it is:\n\n[result #3 · JER](#result-abc)\n\nDone.');
});

test('keeps fragments and unrelated code', () => {
  const frag = '```json\n"stationID": 1234\n```';
  expect(collapseResults(frag, [tab])).toBe(frag);
  const other = '```\n' + 'x'.repeat(60) + '\n```';
  expect(collapseResults(other, [tab])).toBe(other);
});

test('collapses a block still streaming', () => {
  const r = collapseResults('Here:\n```json\n{\n  "header": {\n    "protocolVersion": 2,\n    "messageID"', [tab]);
  expect(r).toBe('Here:\n[result #3 · JER](#result-abc)');
});
