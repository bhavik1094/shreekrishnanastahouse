import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { canvasContext } from './setup';

export const projectRoot = resolve(import.meta.dirname, '../..');
export const appRoot = resolve(import.meta.dirname, '..');
export const originalHTML = readFileSync(resolve(projectRoot, 'website/index.html'), 'utf8');

export interface OriginalFixture {
  document: Document;
  opened: Array<[string, string | undefined]>;
  click(selector: string): void;
  fill(selector: string, value: string): void;
  evaluate<T>(expression: string): T;
  close(): void;
}

/** Run the unchanged original inline scripts, including inline event handlers.
 * External resources are deliberately not enabled in jsdom. */
export async function originalFixture(): Promise<OriginalFixture> {
  const opened: Array<[string, string | undefined]> = [];
  const dom = new JSDOM(originalHTML, {
    url: 'http://localhost:5173/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(win) {
      win.Date = Date;
      win.HTMLCanvasElement.prototype.getContext = (() => canvasContext()) as
        typeof win.HTMLCanvasElement.prototype.getContext;
      win.requestAnimationFrame = () => 1;
      win.cancelAnimationFrame = () => undefined;
      win.setTimeout = () => 1;
      win.clearTimeout = () => undefined;
      win.open = (url, target) => {
        opened.push([String(url), target]);
        return null;
      };
      win.HTMLElement.prototype.scrollTo = () => undefined;
    },
  });
  if (dom.window.document.readyState === 'loading') {
    await new Promise<void>((done) => {
      dom.window.document.addEventListener('DOMContentLoaded', () => done(), { once: true });
    });
  }
  return {
    document: dom.window.document,
    opened,
    click(selector) {
      const element = dom.window.document.querySelector<HTMLElement>(selector);
      if (!element) throw new Error(`Original element missing: ${selector}`);
      element.click();
    },
    fill(selector, value) {
      const element = dom.window.document.querySelector<HTMLInputElement>(selector);
      if (!element) throw new Error(`Original input missing: ${selector}`);
      element.value = value;
      element.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    },
    evaluate<T>(expression: string): T {
      return dom.window.eval(expression) as T;
    },
    close() { dom.window.close(); },
  };
}

export function requiredElement(root: ParentNode, selector: string): HTMLElement {
  const element = root.querySelector<HTMLElement>(selector);
  if (!element) throw new Error(`Element missing: ${selector}`);
  return element;
}

export function normalizedText(value: string | null): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

interface ElementSnapshot {
  tag: string;
  attributes: Record<string, string>;
  styles: Record<string, string>;
  text: string;
  children: ElementSnapshot[];
}

// Framework event binding and original indicator bookkeeping are not visible
// DOM contracts. Everything else, including original SVG paths and styles, is.
export function structure(element: Element): ElementSnapshot {
  const attributes = Object.fromEntries([...element.attributes]
    .filter(({ name }) => !/^on/i.test(name)
      && !['style', 'data-built', 'data-ready'].includes(name))
    .map(({ name, value }) => [name, value]));
  const style = (element as HTMLElement).style;
  const styles = style ? Object.fromEntries([...style]
    .map((name) => [name, style.getPropertyValue(name)])) : {};
  const directText = [...element.childNodes]
    .filter((node) => node.nodeType === 3)
    .map((node) => node.textContent ?? '')
    .join('');
  return {
    tag: element.tagName.toLowerCase(),
    attributes,
    styles,
    text: normalizedText(directText),
    children: [...element.children]
      .filter((child) => child.tagName !== 'SCRIPT')
      .map(structure),
  };
}
