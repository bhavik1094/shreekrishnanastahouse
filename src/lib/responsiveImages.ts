import imageManifest from '../data/responsive-images.json';

interface ResponsiveImage {
  width: number;
  height: number;
  bytes: number;
  variants: readonly { src: string; width: number; height: number; bytes: number }[];
}

const images: Record<string, ResponsiveImage> = imageManifest;

// Match the existing 255px-minimum grid, 1.4rem gaps and section padding.
const sizes = '(max-width: 480px) calc(100vw - 2.4rem), (max-width: 596px) calc(100vw - 4rem), (max-width: 873px) calc((100vw - 5.4rem) / 2), (max-width: 1151px) calc((100vw - 6.8rem) / 3), 259px';

export function responsiveImage(source: string | undefined) {
  const image = source ? images[source] : undefined;
  if (!image) return undefined;
  return {
    srcSet: [...image.variants.map((variant) => `${variant.src} ${variant.width}w`), `${source} ${image.width}w`].join(', '),
    sizes,
  };
}
