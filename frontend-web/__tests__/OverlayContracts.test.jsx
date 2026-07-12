import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Alert from '@/app/lib/component/Alert';
import Confirm from '@/app/lib/component/Confirm';
import Drawer from '@/app/lib/component/Drawer';
import Modal from '@/app/lib/component/Modal';
import Toast from '@/app/lib/component/Toast';

describe('Confirm source contracts', () => {
  it.each([
    ['info', 'border-zinc-200', '확인'],
    ['warning', 'border-yellow-200', '주의'],
    ['danger', 'border-red-200', '삭제'],
    ['unknown', 'border-zinc-200', '확인'],
  ])('renders %s type, copy, escaped newlines, and explicit callbacks', async (type, borderClass, confirmText) => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    render(
      <Confirm
        type={type}
        title={`${type} 제목`}
        text={'첫 줄\\n둘째 줄'}
        confirmText={confirmText}
        cancelText="돌아가기"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
    );
    const dialog = screen.getByRole('dialog', { name: `${type} 제목` });
    expect(dialog).toHaveClass(borderClass);
    expect(screen.getByText(/첫 줄/)).toHaveTextContent('첫 줄 둘째 줄');
    await waitFor(() => expect(screen.getByRole('button', { name: '돌아가기' })).toHaveFocus());
    fireEvent.click(dialog.parentElement);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleConfirm).not.toHaveBeenCalled();
    expect(handleCancel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '돌아가기' }));
    fireEvent.click(screen.getByRole('button', { name: confirmText }));
    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('traps Tab in both directions and restores focus and body scroll on unmount', async () => {
    document.body.style.overflow = 'auto';
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const { unmount } = render(<Confirm text="계속할까요?" />);
    const dialog = screen.getByRole('dialog');
    const cancelButton = screen.getByRole('button', { name: '취소' });
    const confirmButton = screen.getByRole('button', { name: '확인' });
    await waitFor(() => expect(cancelButton).toHaveFocus());
    expect(document.body.style.overflow).toBe('hidden');
    confirmButton.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(cancelButton).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(confirmButton).toHaveFocus();
    unmount();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('auto');
    trigger.remove();
    document.body.style.overflow = '';
  });
});

describe('Toast source contracts', () => {
  it.each([
    ['info', 'border-zinc-200'],
    ['success', 'border-green-200'],
    ['warning', 'border-yellow-200'],
    ['error', 'border-red-200'],
    ['unknown', 'border-zinc-200'],
  ])('renders the %s type with fallback styling', (type, borderClass) => {
    render(<Toast message={`${type} 메시지`} type={type} />);
    expect(screen.getByRole('alert')).toHaveClass(borderClass);
  });

  it.each([
    ['top-left', 'top-4', 'left-4'],
    ['top-center', 'top-4', 'left-1/2'],
    ['top-right', 'top-4', 'right-4'],
    ['bottom-left', 'bottom-4', 'left-4'],
    ['bottom-center', 'bottom-4', 'left-1/2'],
    ['bottom-right', 'bottom-4', 'right-4'],
    ['unknown', 'bottom-4', 'left-1/2'],
  ])('renders the %s position with fallback placement', (position, verticalClass, horizontalClass) => {
    render(<Toast message={position} position={position} />);
    expect(screen.getByRole('alert')).toHaveClass(verticalClass, horizontalClass);
  });

  it('forwards ref and rest props, supports custom classes, close, and exit animation direction', () => {
    const handleClose = vi.fn();
    const toastRef = React.createRef();
    const { rerender } = render(
      <Toast
        ref={toastRef}
        message="닫기 가능"
        position="top-center"
        className="custom-toast"
        data-testid="toast"
        onClose={handleClose}
      />,
    );
    const toast = screen.getByTestId('toast');
    expect(toastRef.current).toBe(toast);
    expect(toast).toHaveClass('custom-toast');
    expect(toast.className).toContain('slideDown');
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(handleClose).toHaveBeenCalledTimes(1);
    rerender(<Toast message="종료" position="top-center" isExiting data-testid="toast" />);
    expect(screen.getByTestId('toast').className).toContain('slideUpExit');
    rerender(<Toast message="아래 종료" position="bottom-center" isExiting data-testid="toast" />);
    expect(screen.getByTestId('toast').className).toContain('slideDownExit');
  });
});

describe('shared overlay body scroll lock', () => {
  it('keeps the original overflow locked until the last mixed overlay releases', () => {
    document.body.style.overflow = 'scroll';
    const renderOverlays = ({ alert, modal, drawer, confirm }) => (
      <>
        {alert ? <Alert title="중첩 알림" text="알림" /> : null}
        <Modal isOpen={modal} ariaLabel="중첩 모달">모달</Modal>
        <Drawer isOpen={drawer}>드로어</Drawer>
        {confirm ? <Confirm title="중첩 확인" text="확인" /> : null}
      </>
    );
    const { rerender } = render(renderOverlays({ alert: true, modal: true, drawer: true, confirm: true }));
    expect(document.body.style.overflow).toBe('hidden');
    rerender(renderOverlays({ alert: false, modal: true, drawer: true, confirm: true }));
    expect(document.body.style.overflow).toBe('hidden');
    rerender(renderOverlays({ alert: false, modal: false, drawer: true, confirm: true }));
    expect(document.body.style.overflow).toBe('hidden');
    rerender(renderOverlays({ alert: false, modal: false, drawer: false, confirm: true }));
    expect(document.body.style.overflow).toBe('hidden');
    rerender(renderOverlays({ alert: false, modal: false, drawer: false, confirm: false }));
    expect(document.body.style.overflow).toBe('scroll');
    document.body.style.overflow = '';
  });
});

describe('shared overlay focus and Escape ownership', () => {
  it('does not move focus when a lower overlay is removed under the top overlay', async () => {
    const outsideButton = document.createElement('button');
    document.body.appendChild(outsideButton);
    outsideButton.focus();
    const renderOverlays = (showAlert, showConfirm) => (
      <>
        {showAlert ? <Alert title="하단 알림" text="알림" /> : null}
        {showConfirm ? <Confirm title="상단 확인" text="확인" /> : null}
      </>
    );
    const { rerender } = render(renderOverlays(true, true));
    const topCancelButton = screen.getByRole('button', { name: '취소' });
    await waitFor(() => expect(topCancelButton).toHaveFocus());

    rerender(renderOverlays(false, true));
    expect(topCancelButton).toHaveFocus();
    rerender(renderOverlays(false, false));
    expect(outsideButton).toHaveFocus();
    outsideButton.remove();
  });

  it('hands focus to the newly exposed top overlay when the current top closes', async () => {
    const renderOverlays = (showConfirm) => (
      <>
        <Modal isOpen ariaLabel="하단 모달">
          <button type="button">하단 액션</button>
        </Modal>
        {showConfirm ? <Confirm title="상단 확인" text="확인" /> : null}
      </>
    );
    const { rerender } = render(renderOverlays(true));
    await waitFor(() => expect(screen.getByRole('button', { name: '취소' })).toHaveFocus());
    rerender(renderOverlays(false));
    expect(screen.getByRole('button', { name: '하단 액션' })).toHaveFocus();
  });

  it('lets one Escape close only the current top overlay, then the next layer', () => {
    const modalCloseSpy = vi.fn();
    const drawerCloseSpy = vi.fn();
    const LayeredOverlays = () => {
      const [modalOpen, setModalOpen] = React.useState(true);
      const [drawerOpen, setDrawerOpen] = React.useState(true);
      return (
        <>
          <Modal
            isOpen={modalOpen}
            ariaLabel="하단 모달"
            onClose={() => {
              modalCloseSpy();
              setModalOpen(false);
            }}
          >
            하단
          </Modal>
          <Drawer
            isOpen={drawerOpen}
            onClose={() => {
              drawerCloseSpy();
              setDrawerOpen(false);
            }}
          >
            상단
          </Drawer>
        </>
      );
    };
    render(<LayeredOverlays />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(drawerCloseSpy).toHaveBeenCalledTimes(1);
    expect(modalCloseSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: '하단 모달' })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(drawerCloseSpy).toHaveBeenCalledTimes(1);
    expect(modalCloseSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps lower Escape handlers blocked while an explicit-close overlay is on top', () => {
    const modalCloseSpy = vi.fn();
    render(
      <>
        <Modal isOpen ariaLabel="하단 모달" onClose={modalCloseSpy}>하단</Modal>
        <Confirm title="상단 확인" text="버튼으로만 닫기" />
      </>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(modalCloseSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: '상단 확인' })).toBeInTheDocument();
  });

  it('does not leak stack ownership across complete unmounts', async () => {
    const firstOutsideButton = document.createElement('button');
    document.body.appendChild(firstOutsideButton);
    firstOutsideButton.focus();
    const firstRender = render(<Confirm title="첫 확인" text="확인" />);
    await waitFor(() => expect(screen.getByRole('button', { name: '취소' })).toHaveFocus());
    firstRender.unmount();
    expect(firstOutsideButton).toHaveFocus();
    firstOutsideButton.remove();

    const secondOutsideButton = document.createElement('button');
    document.body.appendChild(secondOutsideButton);
    secondOutsideButton.focus();
    const secondRender = render(<Alert title="두 번째 알림" text="알림" />);
    expect(screen.getByRole('button', { name: '확인' })).toHaveFocus();
    secondRender.unmount();
    expect(secondOutsideButton).toHaveFocus();
    secondOutsideButton.remove();
  });
});
