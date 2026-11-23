import { expect, test } from 'vitest';
import { convertOp, splitComments, stripComments, withOrigin } from './comments';
import { detectFormat } from './formatDetect';

test('comment lines are not part of the payload', () => {
  const input = '# my CAM from the RSU\n0201000000\n';
  expect(splitComments(input)).toEqual({ comments: ['my CAM from the RSU'], body: '0201000000\n' });
  expect(detectFormat(input)).toBe('UPER');
  expect(stripComments('{"a": "#1"}')).toBe('{"a": "#1"}');
});

test('a tab input: comment, operation, payload', () => {
  const o = { op: convertOp('UPER', 'JER'), ref: '_cam_v2', from: 'UPER' as const, to: 'JER' as const };
  expect(withOrigin(o, '0201', 'Decode the RSU CAM')).toBe('# Decode the RSU CAM\n# decode ref=_cam_v2 from=UPER to=JER\n0201');
  expect(withOrigin({ op: 'generate', ref: '_cam_v2', to: 'JER', minimal: true, compat: 'asn1c' }, '')).toBe(
    '# generate ref=_cam_v2 format=JER minimal compat=asn1c'
  );
  expect(convertOp('JER', 'XER')).toBe('convert');
});
