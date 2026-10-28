import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import i18n from '../src/i18n';

function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Missing element: ${selector}`);
  return found;
}

function openCart() {
  const trigger = element('#order-cart-trigger');
  trigger.focus();
  fireEvent.click(trigger);
  return trigger;
}

function openCheckout() {
  fireEvent.click(element('#ctrl-27 .add-btn'));
  const trigger = openCart();
  fireEvent.click(element('#chkBtn'));
  return trigger;
}

beforeEach(async () => {
  await i18n.changeLanguage('en');
});

describe('order dialog accessibility', () => {
  it('keeps closed overlays inert and exposes a main landmark', () => {
    render(<App />);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(element('#cDrawer')).toHaveAttribute('inert');
    expect(element('#mOverlay')).toHaveAttribute('inert');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(element('#order-cart-trigger')).toHaveAttribute('aria-expanded', 'false');
  });

  it('focuses the cart, contains Tab and programmatic focus, then restores the opener on Escape', () => {
    document.body.style.overflow = 'scroll';
    render(<App />);
    const trigger = openCart();
    const dialog = screen.getByRole('dialog', { name: 'Your Order 🛒' });
    const close = element('#cDrawer .x-btn');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).not.toHaveAttribute('inert');
    expect(close).toHaveFocus();
    expect(element('main').closest('[inert]')).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: 'Tab' });
    expect(close).toHaveFocus();
    element<HTMLSelectElement>('#language-selector').focus();
    expect(close).toHaveFocus();

    fireEvent.keyDown(close, { key: 'Escape' });
    expect(dialog).toHaveAttribute('inert');
    expect(trigger).toHaveFocus();
    expect(element('main').closest('[inert]')).toBeNull();
    expect(document.body.style.overflow).toBe('scroll');
    document.body.style.overflow = '';
  });

  it('keeps quantity controls focused across updates and recovers focus when the last item is removed', async () => {
    render(<App />);
    fireEvent.click(element('#ctrl-1 .add-btn'));
    openCart();
    const increase = element('.c-item-qty button:last-child');
    increase.focus();
    fireEvent.click(increase);
    expect(increase).toHaveFocus();
    expect(element('.c-item-qty span')).toHaveTextContent('2');
    fireEvent.click(element('.c-item-qty button:first-child'));
    const decrease = element('.c-item-qty button:first-child');
    decrease.focus();
    await act(async () => { fireEvent.click(decrease); });
    expect(element('#cDrawer .x-btn')).toHaveFocus();
  });

  it('transfers focus to checkout, wraps keyboard navigation and restores the original cart opener on Back', () => {
    render(<App />);
    const trigger = openCheckout();
    const dialog = screen.getByRole('dialog', { name: 'Almost there! 🎉' });
    expect(dialog).toHaveAttribute('aria-describedby', 'checkout-description');
    expect(element('#cDrawer')).toHaveAttribute('inert');
    expect(element('#fName')).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(element('#fName'), { key: 'Tab', shiftKey: true });
    expect(element('.btn-send')).toHaveFocus();
    fireEvent.keyDown(element('.btn-send'), { key: 'Tab' });
    expect(element('#fName')).toHaveFocus();
    element('#fPhone').focus();
    fireEvent.change(element('#fPhone'), { target: { value: '+33 123456' } });
    expect(element('#fPhone')).toHaveFocus();
    fireEvent.click(element('.btn-cancel'));
    expect(trigger).toHaveFocus();
    expect(element('#mOverlay')).toHaveAttribute('inert');
    expect(document.body.style.overflow).toBe('');
  });

  it('associates existing required-field errors without introducing format validation', () => {
    render(<App />);
    openCheckout();
    const name = element<HTMLInputElement>('#fName');
    const phone = element<HTMLInputElement>('#fPhone');
    expect(name).toHaveAttribute('autocomplete', 'name');
    expect(phone).toHaveAttribute('autocomplete', 'tel');
    expect(name).toHaveAttribute('aria-required', 'true');
    expect(phone).toHaveAttribute('aria-required', 'true');
    expect(name).not.toHaveAttribute('required');
    expect(element('form')).toHaveAttribute('novalidate');

    fireEvent.submit(element('form'));
    expect(name).toHaveFocus();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(phone).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Please enter your name & phone number!');
    fireEvent.change(name, { target: { value: 'Customer' } });
    fireEvent.submit(element('form'));
    expect(phone).toHaveFocus();
    expect(name).not.toHaveAttribute('aria-invalid');
    fireEvent.change(phone, { target: { value: '123' } });
    expect(phone).not.toHaveAttribute('aria-invalid');
  });

  it('resets retained dialog scroll when reopening, without resetting during focus redirects or field updates', () => {
    render(<App />);
    openCheckout();
    const checkout = element('#checkout-dialog');
    checkout.scrollTop = 240;
    fireEvent.click(element('.btn-cancel'));
    expect(checkout.scrollTop).toBe(240);

    const cart = element('#cDrawer');
    cart.scrollTop = 180;
    openCart();
    expect(cart.scrollTop).toBe(0);
    fireEvent.click(element('#chkBtn'));
    expect(checkout.scrollTop).toBe(0);
    expect(element('#fName')).toHaveFocus();

    checkout.scrollTop = 120;
    element('#language-selector').focus();
    expect(element('#fName')).toHaveFocus();
    expect(checkout.scrollTop).toBe(120);
    fireEvent.change(element('#fName'), { target: { value: 'Customer' } });
    expect(checkout.scrollTop).toBe(120);
  });

  it('closes checkout on Escape and releases the body scroll lock on unmount', () => {
    const view = render(<App />);
    const trigger = openCheckout();
    fireEvent.keyDown(element('#fName'), { key: 'Escape' });
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
    openCart();
    expect(document.body.style.overflow).toBe('hidden');
    view.unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
