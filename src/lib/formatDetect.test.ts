import { describe, it, expect } from 'vitest';
import { detectFormat, hexByteLength } from './formatDetect';

describe('detectFormat', () => {
  it('detects JER from JSON object/array', () => {
    expect(detectFormat('{"a":1}')).toBe('JER');
    expect(detectFormat('[1,2,3]')).toBe('JER');
  });

  it('does not treat invalid JSON as JER', () => {
    expect(detectFormat('{not json}')).toBeNull();
  });

  it('detects XER from angle brackets', () => {
    expect(detectFormat('<CAM><header/></CAM>')).toBe('XER');
  });

  it('detects UPER from ETSI ITS header prefix 02', () => {
    expect(detectFormat('02014ac3')).toBe('UPER');
  });

  it('detects UPER / WER from explicit prefixes', () => {
    expect(detectFormat('uper:ff00')).toBe('UPER');
    expect(detectFormat('wer:ff00')).toBe('WER');
  });

  it('returns null for unknown input', () => {
    expect(detectFormat('hello world')).toBeNull();
    expect(detectFormat('')).toBeNull();
  });
});

describe('hexByteLength', () => {
  it('counts bytes from hex, ignoring prefixes', () => {
    expect(hexByteLength('02014ac3')).toBe(4);
    expect(hexByteLength('uper:02014ac3')).toBe(4);
  });

  it('returns null for non-hex', () => {
    expect(hexByteLength('{"a":1}')).toBeNull();
    expect(hexByteLength('')).toBeNull();
  });
});
