import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MENU } from '../src/data/menu';
import manifest from '../src/data/responsive-images.json';
import { responsiveImage } from '../src/lib/responsiveImages';

function webpDimensions(bytes: Buffer) {
  expect(bytes.toString('ascii', 0, 4)).toBe('RIFF');
  expect(bytes.toString('ascii', 8, 12)).toBe('WEBP');
  for (let offset = 12; offset + 8 < bytes.length;) {
    const kind = bytes.toString('ascii', offset, offset + 4);
    const length = bytes.readUInt32LE(offset + 4);
    if (kind === 'VP8L') {
      expect(bytes[offset + 8]).toBe(0x2f);
      const dimensions = bytes.readUInt32LE(offset + 9);
      return { width: (dimensions & 0x3fff) + 1, height: ((dimensions >>> 14) & 0x3fff) + 1 };
    }
    offset += 8 + length + length % 2;
  }
  throw new Error('Missing lossless WebP dimensions');
}

describe('responsive catalogue assets', () => {
  it('ships smaller lossless derivatives at the declared dimensions for existing photos', () => {
    const photos = new Set(Object.values(MENU).flat().map((item) => item.photo));
    for (const [source, image] of Object.entries(manifest)) {
      expect(photos.has(source)).toBe(true);
      expect(statSync(resolve(import.meta.dirname, '../public', source)).size).toBe(image.bytes);
      expect(image.variants.length).toBeGreaterThan(0);
      for (const variant of image.variants) {
        expect(variant.src).toMatch(/^optimized\/[^/]+\.webp$/);
        const bytes = readFileSync(resolve(import.meta.dirname, '../public', variant.src));
        expect(bytes.length).toBe(variant.bytes);
        expect(bytes.length).toBeLessThan(image.bytes);
        expect(variant.width).toBeLessThan(image.width);
        expect(Math.abs(variant.height - image.height * variant.width / image.width)).toBeLessThanOrEqual(0.5);
        expect(webpDimensions(bytes)).toEqual({ width: variant.width, height: variant.height });
      }
    }
  });

  it('retains original photo candidates and leaves small/unmapped sources unchanged', () => {
    for (const [source, image] of Object.entries(manifest)) {
      const result = responsiveImage(source);
      expect(result?.srcSet).toContain(`${source} ${image.width}w`);
      for (const variant of image.variants) expect(result?.srcSet).toContain(`${variant.src} ${variant.width}w`);
      expect(result?.sizes).toContain('calc(100vw - 2.4rem)');
    }
    expect(responsiveImage('Photos/Khaman.webp')).toBeUndefined();
    expect(responsiveImage(undefined)).toBeUndefined();
  });
});
