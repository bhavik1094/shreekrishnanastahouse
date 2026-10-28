import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from '../src/i18n';
import { OrderProvider, useOrder } from '../src/hooks/useOrder';
import { createOrderMessage } from '../src/lib/order';

beforeEach(async () => { await i18n.changeLanguage('en'); });

function checkout() {
  const hook = renderHook(() => useOrder(), { wrapper: OrderProvider });
  act(() => hook.result.current.add(27));
  act(() => {
    hook.result.current.selectBread(27, 'Paratha');
    hook.result.current.selectSnack(27, 'Dhokla');
    hook.result.current.setField('name', ' Test Customer ');
    hook.result.current.setField('phone', ' +33 123456 ');
    hook.result.current.setField('addr', 'Pickup: Gallieni');
    hook.result.current.setField('note', 'No onion');
    hook.result.current.openModal();
  });
  return hook;
}

describe('WhatsApp checkout reliability', () => {
  it('retains the complete order and customer fields if the new window is blocked', () => {
    const { result } = checkout();
    act(() => result.current.sendOrder());
    expect(window.open).toHaveBeenCalledOnce();
    expect(result.current.modalOpen).toBe(true);
    expect(result.current.cart).toEqual({ 27: 5 });
    expect(result.current.details.name).toBe(' Test Customer ');
    expect(result.current.details.note).toBe('No onion');
    expect(result.current.breadSelections).toEqual({ 27: 'Paratha' });
    expect(result.current.snackSelections).toEqual({ 27: 'Dhokla' });
    expect(result.current.toast.message).toBe(i18n.t('notices.whatsappBlocked'));
  });

  it('allows a retry after a thrown or blocked window, sends the exact message, and resets only after opening', () => {
    const openedWindow = { opener: window };
    vi.mocked(window.open)
      .mockImplementationOnce(() => { throw new Error('New windows disabled'); })
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(openedWindow as unknown as Window);
    const { result } = checkout();
    const expected = createOrderMessage(result.current.cart, result.current.breadSelections, result.current.snackSelections, result.current.details).message;
    act(() => result.current.sendOrder());
    expect(result.current.cart).toEqual({ 27: 5 });
    act(() => result.current.sendOrder());
    expect(result.current.modalOpen).toBe(true);
    act(() => result.current.sendOrder());
    expect(window.open).toHaveBeenCalledTimes(3);
    const [url, target] = vi.mocked(window.open).mock.calls[2]!;
    expect(target).toBe('_blank');
    expect(new URL(String(url)).searchParams.get('text')).toBe(expected);
    expect(openedWindow.opener).toBeNull();
    expect(result.current.cart).toEqual({});
    expect(result.current.details).toEqual({ name: '', phone: '', addr: '', note: '' });
    expect(result.current.modalOpen).toBe(false);
    expect(result.current.toast.message).toBe(i18n.t('notices.sent'));
    expect(result.current.breadSelections).toEqual({ 27: 'Paratha' });
  });

  it('does not open duplicate WhatsApp windows from repeated submission before React commits', () => {
    vi.mocked(window.open).mockReturnValue({ opener: null } as unknown as Window);
    const { result } = checkout();
    act(() => { result.current.sendOrder(); result.current.sendOrder(); });
    expect(window.open).toHaveBeenCalledOnce();
  });

  it('prevents silently dropping quantities above the existing 99-item submission limit', () => {
    const { result } = renderHook(() => useOrder(), { wrapper: OrderProvider });
    act(() => result.current.add(18));
    for (let quantity = 5; quantity < 100; quantity++) act(() => result.current.add(18));
    expect(result.current.cart[18]).toBe(100);
    act(() => result.current.openModal());
    expect(result.current.modalOpen).toBe(false);
    expect(result.current.cart[18]).toBe(100);
    expect(result.current.toast.message).toBe(i18n.t('notices.invalidQuantity', { maximum: 99 }));
    expect(window.open).not.toHaveBeenCalled();
    act(() => result.current.remove(18));
    act(() => result.current.openModal());
    expect(result.current.modalOpen).toBe(true);
    expect(result.current.cart[18]).toBe(99);
  });
});

describe('live Paris ordering hours', () => {
  it('updates the cart at closing time and on return the next morning without changing quantities', () => {
    vi.setSystemTime(new Date('2026-10-28T18:59:50Z'));
    const { result } = renderHook(() => useOrder(), { wrapper: OrderProvider });
    act(() => { result.current.add(18); result.current.openCart(); });
    expect(result.current.summary.closed).toBe(false);
    act(() => { vi.advanceTimersByTime(10_025); });
    expect(result.current.summary.closed).toBe(true);
    vi.setSystemTime(new Date('2026-10-29T06:00:00Z'));
    act(() => { window.dispatchEvent(new Event('focus')); });
    expect(result.current.summary.closed).toBe(false);
    expect(result.current.cart).toEqual({ 18: 5 });
  });

  it('refreshes the displayed hours whenever the cart reopens', () => {
    const { result } = renderHook(() => useOrder(), { wrapper: OrderProvider });
    act(() => result.current.add(18));
    vi.setSystemTime(new Date('2026-10-28T19:30:00Z'));
    act(() => result.current.openCart());
    expect(result.current.summary.closed).toBe(true);
    act(() => result.current.closeCart());
    vi.setSystemTime(new Date('2026-10-29T06:00:00Z'));
    act(() => result.current.openCart());
    expect(result.current.summary.closed).toBe(false);
  });
});
