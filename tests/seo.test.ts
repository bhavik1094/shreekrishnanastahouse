import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderSeoHtml } from '../scripts/seo';
import { MENU } from '../src/data/menu';
import i18n, { supportedLanguages } from '../src/i18n';
import { createStructuredData, getPageMetadata, localeCodes, SITE_URL, SOCIAL_IMAGE } from '../src/i18n/metadata';
import fr from '../src/i18n/locales/fr.json';

const template = readFileSync(resolve(import.meta.dirname, '../index.html'), 'utf8');

function renderedDocument() {
  return new DOMParser().parseFromString(renderSeoHtml(template), 'text/html');
}

function meta(document: Document, selector: string): string | null {
  return document.querySelector<HTMLMetaElement>(selector)?.content ?? null;
}

describe('production page metadata', () => {
  it('renders French metadata in the initial HTML without requiring JavaScript', () => {
    const document = renderedDocument();
    expect(document.documentElement.lang).toBe('fr');
    expect(document.title).toBe(fr.metadata.title);
    expect(meta(document, 'meta[name="language"]')).toBe(fr.language.name);
    expect(meta(document, 'meta[name="description"]')).toBe(fr.metadata.description);
    expect(meta(document, 'meta[property="og:title"]')).toBe(fr.metadata.socialTitle);
    expect(meta(document, 'meta[name="twitter:description"]')).toBe(fr.metadata.socialDescription);
    expect(meta(document, 'meta[property="og:locale"]')).toBe('fr_FR');
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(SITE_URL);
    // The selector changes one URL's content; it does not create indexable language URLs.
    expect(document.querySelector('link[hreflang]')).toBeNull();
    expect(renderSeoHtml(template)).not.toContain('<!-- app:seo -->');
  });

  it('describes the actual square logo and advertises its measured dimensions', () => {
    const document = renderedDocument();
    const logo = readFileSync(resolve(import.meta.dirname, '../public/Photos/sknh_logo_square.png'));
    expect(logo.subarray(1, 4).toString()).toBe('PNG');
    expect(SOCIAL_IMAGE.width).toBe(logo.readUInt32BE(16));
    expect(SOCIAL_IMAGE.height).toBe(logo.readUInt32BE(20));
    expect(meta(document, 'meta[property="og:image"]')).toBe(SOCIAL_IMAGE.url);
    expect(meta(document, 'meta[property="og:image:width"]')).toBe(String(SOCIAL_IMAGE.width));
    expect(meta(document, 'meta[property="og:image:height"]')).toBe(String(SOCIAL_IMAGE.height));
    expect(meta(document, 'meta[property="og:image:alt"]')).toBe(fr.metadata.imageAlt);
    expect(meta(document, 'meta[name="twitter:card"]')).toBe('summary');
    expect(fr.metadata.imageAlt).toContain('Logo');
  });

  it('derives all structured menu offers from the real catalogue and omits unsupported claims', () => {
    const products = Object.values(MENU).flat();
    for (const language of supportedLanguages) {
      const data = createStructuredData(language);
      const offers = data.hasMenu.hasMenuSection.flatMap((section) => section.hasMenuItem);
      expect(offers).toHaveLength(products.length);
      products.forEach((item, index) => {
        expect(offers[index]?.offers.price, `product ${item.id}`).toBe(item.price.toFixed(2));
        expect(offers[index]?.offers.priceCurrency).toBe('EUR');
        expect(offers[index]?.image).toBe(item.photo ? SITE_URL + item.photo : undefined);
        expect(offers[index]?.description).not.toMatch(/<[^>]*>|&amp;/);
        expect(offers[index]?.offers.eligibleQuantity?.minValue).toBe(item.minQty);
      });
      expect(data.priceRange).toBe('€1.99 – €23.99');
      expect(data).not.toHaveProperty('aggregateRating');
      expect(data).not.toHaveProperty('geo');
      expect(data).not.toHaveProperty('paymentAccepted');
      expect(data.areaServed).toEqual({ '@type': 'AdministrativeArea', name: 'Île-de-France' });
      expect(data.openingHoursSpecification[0]?.opens).toBe('07:00');
      expect(data.openingHoursSpecification[0]?.closes).toBe('20:00');
      expect(data.hasMenu.inLanguage).toBe(language);
    }
    const frenchData = createStructuredData('fr');
    expect(frenchData.hasMenu.hasMenuSection.flatMap((section) => section.hasMenuItem)
      .find((item) => item.name === fr.products['7'].name)?.offers.price).toBe('6.99');
    const document = renderedDocument();
    const json = document.querySelector('script[type="application/ld+json"]')?.textContent;
    expect(JSON.parse(json || '')).toEqual(JSON.parse(JSON.stringify(frenchData)));
  });

  it('keeps social metadata and structured menu text synchronized with language changes', async () => {
    const originalHead = document.head.innerHTML;
    document.head.innerHTML = renderedDocument().head.innerHTML;
    try {
      for (const language of supportedLanguages) {
        await i18n.changeLanguage(language);
        const metadata = getPageMetadata(language);
        expect(document.title).toBe(metadata.title);
        expect(meta(document, 'meta[name="description"]')).toBe(metadata.description);
        expect(meta(document, 'meta[property="og:image:alt"]')).toBe(metadata.imageAlt);
        expect(meta(document, 'meta[name="twitter:title"]')).toBe(metadata.socialTitle);
        expect(meta(document, 'meta[property="og:locale"]')).toBe(localeCodes[language]);
        const alternates = [...document.querySelectorAll<HTMLMetaElement>('meta[property="og:locale:alternate"]')]
          .map((element) => element.content).sort();
        expect(alternates).toEqual(supportedLanguages.filter((code) => code !== language).map((code) => localeCodes[code]).sort());
        const json = document.getElementById('business-structured-data')?.textContent;
        expect(JSON.parse(json || '').hasMenu.inLanguage).toBe(language);
      }
    } finally {
      document.head.innerHTML = originalHead;
    }
  });

  it('publishes crawl discovery files with the existing canonical URL only', () => {
    const robots = readFileSync(resolve(import.meta.dirname, '../public/robots.txt'), 'utf8');
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain(`Sitemap: ${SITE_URL}sitemap.xml`);
    const sitemap = readFileSync(resolve(import.meta.dirname, '../public/sitemap.xml'), 'utf8');
    const document = new DOMParser().parseFromString(sitemap, 'text/xml');
    expect(document.querySelector('parsererror')).toBeNull();
    expect([...document.querySelectorAll('loc')].map((node) => node.textContent)).toEqual([SITE_URL]);
    expect(document.querySelector('lastmod')).toBeNull();
  });
});
