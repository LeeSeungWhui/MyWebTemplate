import React from 'react';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import Select from '../app/lib/component/Select.jsx';
import EasyObj from '../app/lib/dataset/EasyObj.jsx';

describe('Select component', () => {
  test('updates bound EasyObj when user selects a new value', () => {
    const { result } = renderHook(() => EasyObj({ color: 'g' }));
    const data = [
      { value: '', text: 'Select a value', placeholder: true },
      { value: 'r', text: 'Red' },
      { value: 'g', text: 'Green' },
    ];

    render(<Select dataObj={result.current} dataKey="color" dataList={data} />);

    const combo = screen.getByRole('combobox');
    expect(combo.value).toBe('g');

    fireEvent.change(combo, { target: { value: 'r' } });
    expect(result.current.color).toBe('r');
    expect(combo.value).toBe('r');
  });

  test('reflects external EasyObj mutations and deletes immediately', () => {
    const { result } = renderHook(() => EasyObj({ color: 'r' }));
    const data = [
      { value: '', text: 'Select a value', placeholder: true },
      { value: 'r', text: 'Red' },
      { value: 'g', text: 'Green' },
    ];

    render(<Select dataObj={result.current} dataKey="color" dataList={data} />);

    const combo = screen.getByRole('combobox');
    expect(combo.value).toBe('r');

    act(() => {
      result.current.color = 'g';
    });
    expect(combo.value).toBe('g');

    act(() => {
      delete result.current.color;
    });
    expect(combo.value).toBe('');
  });

  test('uses controlled value and onValueChange handler', () => {
    const data = [
      { value: 'r', text: 'Red' },
      { value: 'g', text: 'Green' },
    ];

    function Wrapper() {
      const [val, setVal] = React.useState('g');
      return (
        <Select
          dataList={data}
          value={val}
          onValueChange={(next) => setVal(next)}
        />
      );
    }

    render(<Wrapper />);
    const combo = screen.getByRole('combobox');
    expect(combo.value).toBe('g');
    fireEvent.change(combo, { target: { value: 'r' } });
    expect(combo.value).toBe('r');
  });

  test('connects status metadata to aria attributes', () => {
    const data = [{ value: 'r', text: 'Red' }];
    render(
      <Select
        id="sel1"
        dataList={data}
        status="error"
        invalid
        errorMessage="Invalid value"
      />
    );
    const combo = screen.getByRole('combobox');
    expect(combo).toHaveAttribute('aria-invalid', 'true');
    const err = screen.getByText('Invalid value');
    expect(err.id).toBe('sel1-error');
    const describedby = combo.getAttribute('aria-describedby') || '';
    expect(describedby.split(' ')).toContain('sel1-error');
  });

  test('resolves empty message via resource helper', () => {
    const resolver = vi.fn(() => 'Localized empty');
    render(
      <Select
        dataList={[]}
        resolveResource={resolver}
        emptyMessageKey="component.select.empty"
      />
    );
    expect(resolver).toHaveBeenCalledWith('component.select.empty', 'No options available');
    expect(screen.getByText('Localized empty')).toBeInTheDocument();
  });

  test('warns exactly once when bound and controlled props are mixed', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => EasyObj({ color: 'r' }));
    const data = [
      { value: 'r', text: 'Red' },
      { value: 'g', text: 'Green' },
    ];

    try {
      render(
        <Select
          dataObj={result.current}
          dataKey="color"
          dataList={data}
          value="r"
          onValueChange={() => {}}
        />
      );
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('[Select]');
    } finally {
      warn.mockRestore();
    }
  });
});
