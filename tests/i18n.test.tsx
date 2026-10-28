import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import i18n, { getInitialLanguage, LANGUAGE_STORAGE_KEY, supportedLanguages } from '../src/i18n';
import en from '../src/i18n/locales/en.json';
import fr from '../src/i18n/locales/fr.json';
import hi from '../src/i18n/locales/hi.json';
import { MENU } from '../src/data/menu';
import { createOrderMessage } from '../src/lib/order';

const resources = { en, fr, hi };

function strings(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value };
  if (!value || typeof value !== 'object') throw new Error(`Non-string translation at ${prefix}`);
  return Object.fromEntries(Object.entries(value).flatMap(([key, child]) =>
    Object.entries(strings(child, prefix ? `${prefix}.${key}` : key)),
  ));
}

function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const result = document.querySelector<T>(selector);
  if (!result) throw new Error(`Missing element: ${selector}`);
  return result;
}

async function selectLanguage(language: typeof supportedLanguages[number]) {
  await act(async () => {
    fireEvent.change(element('select#language-selector'), { target: { value: language } });
  });
}

beforeEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage('fr');
});

describe('translation resources', () => {
  it('provides matching, nonempty keys, interpolation variables and markup in every language', () => {
    const english = strings(en);
    const placeholders = (value: string) => [...value.matchAll(/{{\s*([^}]+?)\s*}}/g)]
      .map((match) => match[1]).sort();
    const markup = (value: string) => [...value.matchAll(/<\/?([a-zA-Z][\w-]*)\b[^>]*>/g)]
      .map((match) => match[0]?.replace(/\s*\/>$/, '>')).sort();
    for (const language of supportedLanguages) {
      const translations = strings(resources[language]);
      expect(Object.keys(translations).sort(), language).toEqual(Object.keys(english).sort());
      for (const [key, value] of Object.entries(translations)) {
        expect(value.trim(), `${language}:${key}`).not.toBe('');
        expect(placeholders(value), `${language}:${key} interpolation`).toEqual(placeholders(english[key] || ''));
        expect(markup(value), `${language}:${key} markup`).toEqual(markup(english[key] || ''));
        expect(i18n.exists(key, { lng: language, fallbackLng: false }), `${language}:${key} missing`).toBe(true);
      }
    }
  });

  it('has translated names, units and descriptions for all catalogue products', () => {
    const ids = Object.values(MENU).flat().map((item) => String(item.id)).sort();
    expect(ids).toHaveLength(28);
    for (const language of supportedLanguages) {
      const translations = strings(resources[language]);
      expect(Object.keys(resources[language].products).sort()).toEqual(ids);
      for (const id of ids) {
        for (const field of ['name', 'unit', 'description']) {
          expect(translations[`products.${id}.${field}`], `${language}: product ${id} ${field}`).toBeTruthy();
        }
      }
    }
  });
});

describe('language preference and document language', () => {
  it('defaults to French and restores only supported stored preferences', () => {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
    expect(getInitialLanguage()).toBe('fr');
    for (const language of supportedLanguages) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      expect(getInitialLanguage()).toBe(language);
    }
    for (const unsupported of ['de', 'undefined', '', 'EN', '<script>']) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, unsupported);
      expect(getInitialLanguage()).toBe('fr');
    }
  });

  it('updates the HTML language and title and persists the active language', async () => {
    for (const language of supportedLanguages) {
      await i18n.changeLanguage(language);
      expect(document.documentElement).toHaveAttribute('lang', language);
      expect(document.title).toBe(resources[language].metadata.title);
      expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(language);
      expect(getInitialLanguage()).toBe(language);
    }
  });

  it('still initializes and switches languages if browser storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Storage blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Storage blocked'); });
    expect(getInitialLanguage()).toBe('fr');
    await expect(i18n.changeLanguage('hi')).resolves.toBeDefined();
    expect(document.documentElement).toHaveAttribute('lang', 'hi');
    expect(document.title).toBe(hi.metadata.title);
  });
});

describe('live language switching', () => {
  it('uses a labeled native select and updates page content and image alternatives without remounting', async () => {
    render(<App />);
    const selector = screen.getByRole('combobox', { name: i18n.t('language.label') });
    expect(selector).toBeInstanceOf(HTMLSelectElement);
    expect(selector).toHaveValue('fr');
    expect(selector).not.toBeDisabled();
    expect(selector.tabIndex).toBe(0);
    expect(within(selector).getAllByRole('option').map((option) => option.textContent))
      .toEqual(['English', 'Français', 'हिन्दी']);
    expect(within(selector).getByRole('option', { name: 'हिन्दी' })).toHaveAttribute('lang', 'hi');
    selector.focus();
    expect(selector).toHaveFocus();
    const productImage = element<HTMLImageElement>('#grid-steamed .food-card img');
    const originalPrice = element('#grid-steamed .food-price').textContent;
    const frenchHero = element('#hero .hero-title').textContent;
    const frenchMenuTitle = element('#menu .sec-title').textContent;
    for (const language of ['hi', 'en', 'fr'] as const) {
      await selectLanguage(language);
      expect(element('select#language-selector')).toBe(selector);
      expect(selector).toHaveValue(language);
      expect(selector).toHaveAccessibleName(resources[language].language.label);
      expect(document.documentElement).toHaveAttribute('lang', language);
      expect(productImage).toHaveAttribute('alt', resources[language].products['1'].name);
      expect(element('#grid-steamed .food-price').textContent).toBe(originalPrice);
      expect(document.body.textContent).not.toMatch(/\b(?:navigation|hero|menu|products|choices|story|packaging|cta|footer|cart|checkout|toast|language)\.[A-Za-z0-9_.]+/);
      expect(element('#story .story-body strong')).not.toHaveTextContent('<strong>');
      if (language !== 'fr') {
        expect(element('#hero .hero-title').textContent).not.toBe(frenchHero);
        expect(element('#menu .sec-title').textContent).not.toBe(frenchMenuTitle);
      }
    }
  });

  it('retains cart quantities, meal choices and checkout fields while translating an open validation notice', async () => {
    render(<App />);
    fireEvent.click(element('#bread-27 button:last-child'));
    fireEvent.click(element('#snack-27 button:last-child'));
    fireEvent.click(element('#ctrl-27 .add-btn'));
    expect(element('#ctrl-27 .qty-n')).toHaveTextContent('5');
    fireEvent.click(element('nav .cart-btn'));
    expect(element('#cDrawer')).toHaveClass('open');
    expect(element('#cTotal')).toHaveTextContent('€119.95');
    const frenchCartName = element('.c-item-name').textContent;
    fireEvent.click(element('#chkBtn'));
    expect(element('#mOverlay')).toHaveClass('open');
    fireEvent.change(element('#fName'), { target: { value: 'Customer test' } });
    fireEvent.change(element('#fAddr'), { target: { value: 'Pickup: Gallieni' } });
    fireEvent.change(element('#fNote'), { target: { value: 'No onion, please' } });
    fireEvent.click(element('.btn-send'));
    const frenchValidation = element('#toast').textContent;
    expect(frenchValidation).toBeTruthy();
    expect(window.open).not.toHaveBeenCalled();

    await selectLanguage('hi');
    expect(element('#toast')).toHaveClass('show');
    expect(element('#toast').textContent).not.toBe(frenchValidation);
    expect(element('.c-item-name').textContent).not.toBe(frenchCartName);
    expect(element('.c-item-name')).toHaveTextContent(hi.products['27'].name);
    expect(element('#ctrl-27 .qty-n')).toHaveTextContent('5');
    expect(element('#cTotal')).toHaveTextContent('€119.95');
    expect(element('#bread-27 button:last-child')).toHaveClass('on');
    expect(element('#snack-27 button:last-child')).toHaveClass('on');
    expect(element('#fName')).toHaveValue('Customer test');
    expect(element('#fAddr')).toHaveValue('Pickup: Gallieni');
    expect(element('#fNote')).toHaveValue('No onion, please');

    await selectLanguage('en');
    expect(element('#toast')).toHaveTextContent('Please enter your name & phone number!');
    fireEvent.change(element('#fPhone'), { target: { value: '+33 123456' } });
    fireEvent.click(element('.btn-send'));
    expect(window.open).toHaveBeenCalledOnce();
    const call = vi.mocked(window.open).mock.calls[0];
    const url = new URL(String(call?.[0]));
    expect(url.origin + url.pathname).toBe('https://wa.me/33781658862');
    expect(url.searchParams.get('text')).toBe(createOrderMessage(
      { 27: 5 }, { 27: 'Paratha' }, { 27: 'Dhokla' },
      { name: 'Customer test', phone: '+33 123456', addr: 'Pickup: Gallieni', note: 'No onion, please' },
    ).message);
  });

  it('keeps the WhatsApp order format identical in every interface language', async () => {
    const details = { name: 'नाम / Customer', phone: '+33 123456', addr: '10 Rue Test, Paris', note: 'Sans oignon' };
    const now = new Date('2026-10-28T12:34:00Z');
    const expected = createOrderMessage({ 1: 6, 27: 5 }, { 27: 'Paratha' }, { 27: 'Dhokla' }, details, now);
    for (const language of supportedLanguages) {
      await i18n.changeLanguage(language);
      expect(createOrderMessage({ 1: 6, 27: 5 }, { 27: 'Paratha' }, { 27: 'Dhokla' }, details, now)).toEqual(expected);
    }
    expect(expected.message).toContain('Qty: 5  x  €23.99  =  €119.95');
    expect(expected.message).toContain('Name: नाम / Customer');
    expect(expected.message).toContain('Note: Sans oignon');
  });
});
