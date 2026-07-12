import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from '../app/lib/component/Alert.jsx';
import Confirm from '../app/lib/component/Confirm.jsx';

describe('Alert accessibility', () => {
  it('exposes alertdialog semantics with aria-modal and label/description ids', () => {
    render(<Alert title="알림 제목" text="알림 본문" onClick={() => {}} />);

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const labelledBy = dialog.getAttribute('aria-labelledby');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(labelledBy)).toHaveTextContent('알림 제목');
    expect(document.getElementById(describedBy)).toHaveTextContent('알림 본문');
  });

  it.each([
    ['info', 'border-zinc-200', 'bg-zinc-50'],
    ['success', 'border-green-200', 'bg-green-50'],
    ['warning', 'border-yellow-200', 'bg-yellow-50'],
    ['error', 'border-red-200', 'bg-red-50'],
  ])('renders the %s status styling', (type, borderClass, backgroundClass) => {
    render(<Alert type={type} text={`${type} message`} onClick={() => {}} />);

    expect(screen.getByRole('alertdialog')).toHaveClass(borderClass, backgroundClass);
  });

  it('falls back to the info presentation and expands escaped newlines', () => {
    render(<Alert type="unknown" text={'첫째 줄\\n둘째 줄'} onClick={() => {}} />);

    expect(screen.getByRole('alertdialog')).toHaveClass('border-zinc-200', 'bg-zinc-50');
    expect(screen.getByText(/첫째 줄/)).toHaveTextContent('첫째 줄 둘째 줄');
    expect(screen.getByRole('heading')).not.toBeEmptyDOMElement();
  });

  it('focuses and traps the explicit confirmation action without closing on Escape', () => {
    const onClick = vi.fn();
    const previousOverflow = document.body.style.overflow;
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const { unmount } = render(<Alert text="포커스 알림" onClick={onClick} />);
    const dialog = screen.getByRole('alertdialog');
    const confirmButton = screen.getByRole('button', { name: /확인/ });

    expect(document.body).toHaveStyle({ overflow: 'hidden' });
    expect(confirmButton).toHaveFocus();
    expect(fireEvent.keyDown(confirmButton, { key: 'Tab' })).toBe(false);
    expect(confirmButton).toHaveFocus();
    expect(fireEvent.keyDown(confirmButton, { key: 'Tab', shiftKey: true })).toBe(false);
    expect(confirmButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClick).not.toHaveBeenCalled();
    expect(dialog).toBeInTheDocument();

    fireEvent.click(confirmButton);
    expect(onClick).toHaveBeenCalledTimes(1);
    unmount();
    expect(document.body.style.overflow).toBe(previousOverflow);
    trigger.remove();
  });

  it('restores the element focused before the alert mounted', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = render(<Alert text="복원 알림" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: /확인/ })).toHaveFocus();

    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});

describe('Confirm accessibility', () => {
  it('exposes dialog semantics with aria-modal and label/description ids', () => {
    render(
      <Confirm
        title="확인 제목"
        text="확인 본문"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const labelledBy = dialog.getAttribute('aria-labelledby');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(labelledBy)).toHaveTextContent('확인 제목');
    expect(document.getElementById(describedBy)).toHaveTextContent('확인 본문');
  });
});
