import type { Plugin } from 'vite';
import { createStructuredData, getPageMetadata, localeCodes, SITE_URL, SOCIAL_IMAGE } from '../src/i18n/metadata.ts';

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

export function renderSeoHtml(html: string): string {
  const marker = '<!-- app:seo -->';
  if (!html.includes(marker)) throw new Error('Missing SEO metadata insertion point');
  const metadata = getPageMetadata('fr');
  const meta = (attribute: 'name' | 'property', key: string, value: string | number) =>
    `<meta ${attribute}="${key}" content="${escapeHtml(String(value))}">`;
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    meta('name', 'description', metadata.description),
    meta('name', 'author', 'Shree Krishna Nasta House, Paris'),
    meta('name', 'robots', 'index, follow'),
    meta('name', 'language', 'Français'),
    `<link rel="canonical" href="${SITE_URL}">`,
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', 'Shree Krishna Nasta House'),
    meta('property', 'og:title', metadata.socialTitle),
    meta('property', 'og:description', metadata.socialDescription),
    meta('property', 'og:url', SITE_URL),
    meta('property', 'og:image', SOCIAL_IMAGE.url),
    meta('property', 'og:image:type', 'image/png'),
    meta('property', 'og:image:alt', metadata.imageAlt),
    meta('property', 'og:image:width', SOCIAL_IMAGE.width),
    meta('property', 'og:image:height', SOCIAL_IMAGE.height),
    meta('property', 'og:locale', localeCodes.fr),
    meta('property', 'og:locale:alternate', localeCodes.en),
    meta('property', 'og:locale:alternate', localeCodes.hi),
    meta('name', 'twitter:card', 'summary'),
    meta('name', 'twitter:title', metadata.socialTitle),
    meta('name', 'twitter:description', metadata.socialDescription),
    meta('name', 'twitter:image', SOCIAL_IMAGE.url),
    meta('name', 'twitter:image:alt', metadata.imageAlt),
    `<script id="business-structured-data" type="application/ld+json">${JSON.stringify(createStructuredData('fr')).replaceAll('<', '\\u003c')}</script>`,
  ];
  return html.replace(marker, tags.join('\n  '));
}

export function localizedSeo(): Plugin {
  return { name: 'localized-seo', transformIndexHtml: { order: 'pre', handler: renderSeoHtml } };
}
