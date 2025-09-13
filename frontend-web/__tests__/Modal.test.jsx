import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from '../app/lib/component/Modal.jsx';

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
  });
});

