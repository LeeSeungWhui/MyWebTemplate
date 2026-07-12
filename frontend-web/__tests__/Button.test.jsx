import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../app/lib/component/Button.jsx';

const buttonVariantCaseList = [
  ['primary', 'bg-indigo-600'],
  ['secondary', 'bg-slate-100'],
  ['outline', 'bg-white'],
  ['ghost', 'bg-transparent'],
  ['danger', 'bg-rose-600'],
  ['success', 'bg-emerald-600'],
  ['warning', 'bg-amber-500'],
  ['link', 'underline-offset-4'],
  ['dark', 'bg-slate-950'],
];

const buttonSizeCaseList = [
  ['sm', 'h-9'],
  ['md', 'h-10'],
  ['lg', 'h-11'],
];

describe('Button documented contract', () => {
  it.each(buttonVariantCaseList)(
    'renders the %s variant as an operable named button',
    (variant, identifyingClassName) => {
      const onClick = vi.fn();
      render(
        <Button variant={variant} onClick={onClick}>
          {variant}
        </Button>,
      );

      const button = screen.getByRole('button', { name: variant });
      expect(button).toHaveClass(identifyingClassName);
      expect(button).toBeEnabled();
      fireEvent.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    },
  );

  it.each(buttonSizeCaseList)(
    'renders the documented %s size',
    (size, identifyingClassName) => {
      render(<Button size={size}>{size}</Button>);

      expect(screen.getByRole('button', { name: size })).toHaveClass(identifyingClassName);
    },
  );

  it('places a supplied icon on either documented side of the label', () => {
    const { rerender } = render(
      <Button icon="md:MdAdd" iconPosition="left">
        <span>Label</span>
      </Button>,
    );
    let button = screen.getByRole('button', { name: 'Label' });
    let label = screen.getByText('Label');
    let icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(button.firstElementChild).toBe(icon);
    expect(button.lastElementChild).toBe(label);

    rerender(
      <Button icon="md:MdOpenInNew" iconPosition="right">
        <span>Label</span>
      </Button>,
    );
    button = screen.getByRole('button', { name: 'Label' });
    label = screen.getByText('Label');
    icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(button.firstElementChild).toBe(label);
    expect(button.lastElementChild).toBe(icon);
  });

  it('sets aria-busy when loading', () => {
    render(
      <Button loading icon="md:MdAdd" aria-describedby="request-hint">
        Loading
      </Button>,
    );
    const btn = screen.getByRole('button', { name: /^Loading/ });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('처리중...');
    expect(btn.getAttribute('aria-describedby')).toContain('request-hint');
    expect(btn.getAttribute('aria-describedby')).toContain(status.id);
    expect(btn.querySelectorAll('svg')).toHaveLength(1);
  });

  it('sets aria-busy when status=loading', () => {
    render(<Button status="loading">Busy</Button>);
    const btn = screen.getByRole('button', { name: /Busy$/ });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('처리중...');
  });

  it('blocks click behavior when explicitly disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('merges custom classes and forwards generic DOM attributes', () => {
    render(
      <Button
        className="custom-button-class"
        data-tracking-id="save-action"
        title="Save the record"
        aria-label="Save"
      >
        Hidden label
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('inline-flex', 'custom-button-class');
    expect(button).toHaveAttribute('data-tracking-id', 'save-action');
    expect(button).toHaveAttribute('title', 'Save the record');
    expect(button).toHaveAttribute('aria-label', 'Save');
  });

  it.each(['button', 'submit', 'reset'])('forwards the %s type', (type) => {
    render(<Button type={type}>{type}</Button>);
    expect(screen.getByRole('button', { name: type })).toHaveAttribute('type', type);
  });

  it('defaults to a non-submitting button and preserves submit/reset behavior', () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    const onReset = vi.fn();
    render(
      <form onSubmit={onSubmit} onReset={onReset}>
        <input aria-label="field" defaultValue="initial" />
        <Button>Default</Button>
        <Button type="submit">Submit</Button>
        <Button type="reset">Reset</Button>
      </form>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Default' }));
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    const field = screen.getByRole('textbox', { name: 'field' });
    fireEvent.change(field, { target: { value: 'changed' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(field).toHaveValue('initial');
  });
});
