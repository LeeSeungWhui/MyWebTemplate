import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import Modal from '../app/lib/component/Modal.jsx';
import { sizeExampleList } from '../app/component/docs/examples/ModalExamples.jsx';

describe('Modal a11y', () => {
  it('renders role dialog with aria-modal', () => {
    render(
      <Modal isOpen ariaLabel="테스트 모달" onClose={() => {}}>
        <Modal.Header>헤더</Modal.Header>
        <Modal.Body>바디</Modal.Body>
      </Modal>
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('data-state', 'open');
    expect(dialog).toHaveAttribute('data-size', 'md');
  });

  it('provides a default accessible name when aria labels are omitted', () => {
    render(
      <Modal isOpen onClose={() => {}}>
        <Modal.Header>헤더</Modal.Header>
        <Modal.Body>바디</Modal.Body>
      </Modal>
    );

    expect(screen.getByRole('dialog', { name: '모달' })).toBeInTheDocument();
  });

  it('applies every width preset and gives full size the safe viewport height', () => {
    const { rerender } = render(
      <Modal isOpen ariaLabel="크기 모달" size="sm">
        <Modal.Body>크기 본문</Modal.Body>
      </Modal>
    );

    const presetClassMap = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-[calc(100vw-32px)]',
    };

    Object.entries(presetClassMap).forEach(([size, sizeClassName]) => {
      rerender(
        <Modal isOpen ariaLabel="크기 모달" size={size}>
          <Modal.Body>크기 본문</Modal.Body>
        </Modal>
      );
      const dialog = screen.getByRole('dialog', { name: '크기 모달' });
      expect(dialog).toHaveAttribute('data-size', size);
      expect(dialog).toHaveClass(sizeClassName);
    });

    expect(screen.getByRole('dialog', { name: '크기 모달' })).toHaveClass('h-[calc(100vh-32px)]');
    expect(screen.getByText('크기 본문')).toHaveClass('flex-1');
  });

  it('lets the size example resize an open dialog without closing it first', () => {
    render(sizeExampleList[0].component);

    fireEvent.click(screen.getByRole('button', { name: 'SM 크기' }));
    const smDialog = screen.getByRole('dialog', { name: 'SM 크기 모달' });
    expect(smDialog).toHaveClass('max-w-md');

    const sizeControlGroup = within(smDialog).getByRole('group', { name: '모달 크기 변경' });
    fireEvent.click(within(sizeControlGroup).getByRole('button', { name: 'FULL' }));

    const fullDialog = screen.getByRole('dialog', { name: 'FULL 크기 모달' });
    expect(fullDialog).toHaveAttribute('data-size', 'full');
    expect(fullDialog).toHaveClass('max-w-[calc(100vw-32px)]', 'h-[calc(100vh-32px)]');
  });

  it('keeps dragged modal inside viewport when dialog is wider than the screen', async () => {
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 320 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 240 });

    try {
      render(
        <Modal isOpen draggable ariaLabel="드래그 모달" onClose={() => {}}>
          <Modal.Header>드래그 헤더</Modal.Header>
          <Modal.Body>바디</Modal.Body>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      dialog.getBoundingClientRect = vi.fn(() => ({
        left: 16,
        top: 20,
        width: 640,
        height: 480,
        right: 656,
        bottom: 500,
        x: 16,
        y: 20,
        toJSON: () => ({}),
      }));

      fireEvent.mouseDown(screen.getByText('드래그 헤더'), { clientX: 32, clientY: 40 });
      fireEvent.mouseMove(document, { clientX: 500, clientY: 500 });

      await waitFor(() => {
        expect(dialog.style.getPropertyValue('--modal-left')).toBe('0px');
        expect(dialog.style.getPropertyValue('--modal-top')).toBe('0px');
      });
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalInnerHeight });
    }
  });

  it('wraps Tab focus from last focusable to first and Shift+Tab from first to last', () => {
    render(
      <Modal isOpen ariaLabel="포커스 트랩">
        <Modal.Header>헤더</Modal.Header>
        <Modal.Body>
          <button type="button">첫번째</button>
          <button type="button">마지막</button>
        </Modal.Body>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    const firstButton = screen.getByRole('button', { name: '첫번째' });
    const lastButton = screen.getByRole('button', { name: '마지막' });

    lastButton.focus();
    expect(lastButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Tab', code: 'Tab' });
    expect(firstButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Tab', code: 'Tab', shiftKey: true });
    expect(lastButton).toHaveFocus();
  });

  it('restores the pre-existing body overflow value after close', () => {
    document.body.style.overflow = 'auto';
    const { rerender } = render(
      <Modal isOpen ariaLabel="스크롤 잠금" onClose={() => {}}>
        <Modal.Body>바디</Modal.Body>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
    rerender(
      <Modal isOpen={false} ariaLabel="스크롤 잠금" onClose={() => {}}>
        <Modal.Body>바디</Modal.Body>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('auto');
    document.body.style.overflow = '';
  });

  it('restores body userSelect when closed during an active drag', () => {
    document.body.style.userSelect = 'text';
    const { rerender } = render(
      <Modal isOpen draggable ariaLabel="드래그 중 닫기" onClose={() => {}}>
        <Modal.Header>드래그 헤더</Modal.Header>
        <Modal.Body>바디</Modal.Body>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    dialog.getBoundingClientRect = vi.fn(() => ({
      left: 16,
      top: 20,
      width: 240,
      height: 160,
      right: 256,
      bottom: 180,
      x: 16,
      y: 20,
      toJSON: () => ({}),
    }));

    fireEvent.mouseDown(screen.getByText('드래그 헤더'), { clientX: 32, clientY: 40 });
    expect(document.body.style.userSelect).toBe('none');

    rerender(
      <Modal isOpen={false} draggable ariaLabel="드래그 중 닫기" onClose={() => {}}>
        <Modal.Header>드래그 헤더</Modal.Header>
        <Modal.Body>바디</Modal.Body>
      </Modal>
    );

    expect(document.body.style.userSelect).toBe('text');
    document.body.style.userSelect = '';
  });

  it('focuses the dialog when it has no focusable child and keeps Tab inside', async () => {
    render(
      <Modal isOpen ariaLabel="빈 모달">
        <Modal.Body>텍스트만 있음</Modal.Body>
      </Modal>
    );
    const dialog = screen.getByRole('dialog', { name: '빈 모달' });
    await waitFor(() => expect(dialog).toHaveFocus());
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(dialog).toHaveFocus();
  });

  it('chains a consumer keydown handler without allowing props to replace the focus trap', () => {
    const handleKeyDown = vi.fn();
    render(
      <Modal isOpen ariaLabel="키 이벤트" onKeyDown={handleKeyDown}>
        <button type="button">처음</button>
        <button type="button">끝</button>
      </Modal>
    );
    const dialog = screen.getByRole('dialog', { name: '키 이벤트' });
    const firstButton = screen.getByRole('button', { name: '처음' });
    const lastButton = screen.getByRole('button', { name: '끝' });
    lastButton.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
    expect(firstButton).toHaveFocus();
  });

  it('respects close options and forwards size, position, class, and ref contracts', () => {
    const handleClose = vi.fn();
    const modalRef = React.createRef();
    render(
      <Modal
        ref={modalRef}
        isOpen
        ariaLabel="옵션 모달"
        size="xl"
        top="20px"
        left="30px"
        className="custom-modal"
        closeOnBackdrop={false}
        closeOnEsc={false}
        onClose={handleClose}
      >
        <Modal.Body>바디</Modal.Body>
      </Modal>
    );
    const dialog = screen.getByRole('dialog', { name: '옵션 모달' });
    expect(modalRef.current).toBe(dialog);
    expect(dialog).toHaveAttribute('data-size', 'xl');
    expect(dialog).toHaveClass('max-w-4xl', 'custom-modal');
    expect(dialog.style.getPropertyValue('--modal-top')).toBe('20px');
    expect(dialog.style.getPropertyValue('--modal-left')).toBe('30px');
    fireEvent.click(dialog.parentElement);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).not.toHaveBeenCalled();
  });
});
