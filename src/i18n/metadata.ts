import { MENU } from '../data/menu.ts';
import en from './locales/en.json' with { type: 'json' };
import fr from './locales/fr.json' with { type: 'json' };
import hi from './locales/hi.json' with { type: 'json' };

const translations = { en, fr, hi };
export type MetadataLanguage = keyof typeof translations;
export const SITE_URL = 'https://www.shreekrishnanastahouse.com/';
export const SOCIAL_IMAGE = { url: `${SITE_URL}Photos/sknh_logo_square.png`, width: 800, height: 800 };
export const localeCodes = { en: 'en_GB', fr: 'fr_FR', hi: 'hi_IN' } as const;

export function getPageMetadata(language: MetadataLanguage) {
  return translations[language].metadata;
}

function plainText(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&');
}

// Build-time metadata and client-side language changes use the same catalogue.
// Do not infer ratings, payment methods or a precise address from city-level data.
export function createStructuredData(language: MetadataLanguage) {
  const texts = translations[language];
  const prices = Object.values(MENU).flat().map((item) => item.price);
  return {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    '@id': `${SITE_URL}#business`,
    name: 'Shree Krishna Nasta House',
    description: texts.metadata.description,
    url: SITE_URL,
    telephone: '+33781658862',
    image: SOCIAL_IMAGE.url,
    servesCuisine: ['Gujarati', 'Indian', 'Vegetarian'],
    priceRange: `€${Math.min(...prices).toFixed(2)} – €${Math.max(...prices).toFixed(2)}`,
    currenciesAccepted: 'EUR',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Paris',
      addressRegion: 'Île-de-France',
      addressCountry: 'FR',
    },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '07:00',
      closes: '20:00',
    }],
    hasMenu: {
      '@type': 'Menu',
      name: texts.menu.title,
      url: `${SITE_URL}#menu`,
      inLanguage: language,
      hasMenuSection: Object.entries(MENU).map(([category, items]) => ({
        '@type': 'MenuSection',
        name: texts.menu.categories[category as keyof typeof MENU],
        hasMenuItem: items.map((item) => {
          const product = texts.products[String(item.id) as keyof typeof texts.products];
          return {
            '@type': 'MenuItem',
            name: product.name,
            description: `${plainText(product.description)} ${product.unit}`,
            image: item.photo ? `${SITE_URL}${item.photo}` : undefined,
            offers: {
              '@type': 'Offer',
              price: item.price.toFixed(2),
              priceCurrency: 'EUR',
              ...(item.minQty ? { eligibleQuantity: { '@type': 'QuantitativeValue', minValue: item.minQty } } : {}),
            },
          };
        }),
      })),
    },
    contactPoint: [
      { '@type': 'ContactPoint', telephone: '+33781658862', contactType: 'customer service' },
      { '@type': 'ContactPoint', telephone: '+33769070003', contactType: 'customer service' },
    ],
    areaServed: { '@type': 'AdministrativeArea', name: 'Île-de-France' },
    sameAs: [
      'https://wa.me/33781658862',
      'https://www.instagram.com/shreekrishnanastahouseparis',
    ],
  };
}
