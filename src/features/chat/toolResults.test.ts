import { expect, test } from 'vitest';
import { tabFromToolResult } from './toolResults';

test('generate with a bare type: the default-version note becomes the tab info, not content', () => {
  const tab = tabFromToolResult({
    name: 'generate',
    args: { ref: 'MAPEM', content: 'MINIMAL', comment: 'Minimal MAP' },
    output: 'Generated as _mapem_v2, the default version of MAPEM\n\n{"map":{}}',
    error: null,
  });
  expect(tab?.content.startsWith('{')).toBe(true);
  expect(tab?.info?.resolvedRef).toBe('_mapem_v2');
  expect(tab?.originalInput).toBe('# Minimal MAP\n# generate ref=MAPEM format=JER content=MINIMAL');
});

test('validate keeps the message in its format, with the check on the Input', () => {
  const tab = tabFromToolResult({
    name: 'validate',
    args: { ref: 'MAPEM', payload: '{"map":{}}', comment: 'Check the Barcelona MAP' },
    output: 'Valid as _mapem_v2 (42 bytes in UPER)\n\n{"map":{}}',
    error: null,
  });
  expect(tab?.format).toBe('JER');
  expect(tab?.content.replace(/\s/g, '')).toBe('{"map":{}}');
  expect(tab?.info?.resolvedRef).toBe('_mapem_v2');
  expect(tab?.originalInput).toBe('# Check the Barcelona MAP\n# validate ref=MAPEM from=JER');
});

test('generate with set: the lines are on the Input, so the message can be changed later', () => {
  const tab = tabFromToolResult({
    name: 'generate',
    args: { ref: 'CAM', set: ['header.stationId=1234', 'cam.camParameters.basicContainer.stationType=passengerCar'] },
    output: '{"header":{}}',
    error: null,
  });
  expect(tab?.originalInput).toBe(
    '# generate ref=CAM format=JER content=MINIMAL\n# set header.stationId=1234\n# set cam.camParameters.basicContainer.stationType=passengerCar'
  );
});
