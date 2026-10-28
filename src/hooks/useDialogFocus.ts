import { useLayoutEffect, useRef } from 'react';

const focusableSelector = 'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]';

function focusableElements(dialog: HTMLElement): HTMLElement[] {
  return Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
    if (element.tabIndex < 0 || element.matches(':disabled') || element.closest('[inert], [hidden], [aria-hidden="true"]')) return false;
    for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
      const style = window.getComputedStyle(ancestor);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (ancestor === dialog) break;
    }
    return true;
  });
}

/** Own one focus session across transitions between related modal dialogs. */
export function useDialogFocus(dialogId: string | null, onClose: () => void, fallbackFocusId: string) {
  const closeRef = useRef(onClose);
  const sessionRef = useRef<{ returnFocus: HTMLElement | null; overflow: string } | null>(null);

  useLayoutEffect(() => { closeRef.current = onClose; }, [onClose]);

  useLayoutEffect(() => {
    if (!dialogId) {
      const session = sessionRef.current;
      if (session) {
        document.body.style.overflow = session.overflow;
        sessionRef.current = null;
        const target = session.returnFocus?.isConnected ? session.returnFocus : document.getElementById(fallbackFocusId);
        target?.focus({ preventScroll: true });
      }
      return;
    }

    const dialog = document.getElementById(dialogId);
    if (!dialog) return;
    if (!sessionRef.current) {
      const active = document.activeElement;
      sessionRef.current = {
        returnFocus: active instanceof HTMLElement && active !== document.body ? active : document.getElementById(fallbackFocusId),
        overflow: document.body.style.overflow,
      };
      document.body.style.overflow = 'hidden';
    }

    const focusFirst = () => {
      const initial = dialog.querySelector<HTMLElement>('[data-dialog-initial-focus]');
      (initial || focusableElements(dialog)[0] || dialog).focus({ preventScroll: true });
    };
    // Hidden dialogs keep their DOM (and scroll position) between openings.
    // Reset once so initial focus is visible without interrupting later scrolling.
    dialog.scrollTop = 0;
    focusFirst();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = focusableElements(dialog);
      const first = elements[0];
      const last = elements[elements.length - 1];
      const active = document.activeElement;
      if (!first || !last) {
        event.preventDefault();
        dialog.focus({ preventScroll: true });
      } else if (event.shiftKey && (active === first || !elements.includes(active as HTMLElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !elements.includes(active as HTMLElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.contains(event.target)) focusFirst();
    };
    // Removing the final cart item can remove the focused quantity control.
    const observer = new MutationObserver(() => {
      if (!dialog.contains(document.activeElement)) focusFirst();
    });
    observer.observe(dialog, { childList: true, subtree: true });
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('focusin', onFocusIn, true);
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocusIn, true);
    };
  }, [dialogId, fallbackFocusId]);

  useLayoutEffect(() => () => {
    const session = sessionRef.current;
    if (session) {
      document.body.style.overflow = session.overflow;
      sessionRef.current = null;
      if (session.returnFocus?.isConnected) session.returnFocus.focus({ preventScroll: true });
    }
  }, []);
}
