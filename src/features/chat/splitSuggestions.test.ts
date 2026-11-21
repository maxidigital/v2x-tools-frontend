import { expect, test } from 'vitest';
import { splitSuggestions } from './ChatMarkdown';

test('takes the suggestions block out of the answer', () => {
  const r = splitSuggestions('Done.\n\n:::suggestions\n- Decode it again\n- Show it bit by bit\n:::\n');
  expect(r.body).toBe('Done.');
  expect(r.suggestions).toEqual(['Decode it again', 'Show it bit by bit']);
});

test('hides a block that is still streaming', () => {
  expect(splitSuggestions('Done.\n\n:::sugg').body).toBe('Done.');
  expect(splitSuggestions('Done.\n\n:::suggestions\n- Deco')).toEqual({ body: 'Done.', suggestions: ['Deco'] });
  expect(splitSuggestions('a: b').body).toBe('a: b');
  expect(splitSuggestions('If you want:').body).toBe('If you want:');
});
