import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Select from '../app/lib/component/Select.jsx';
import EasyObj from '../app/lib/dataset/EasyObj.jsx';

describe('Select component', () => {
  test('bound mode updates EasyObj on change', () => {
    const model = EasyObj({ color: 'g' });
    const data = [
      { value: '', text: '선택하세요', placeholder: true },
      { value: 'r', text: 'Red' },
      { value: 'g', text: 'Green' },
    ];

    render(
      <Select dataObj={model} dataKey="color" dataList={data} />
    );

    const combo = screen.getByRole('combobox');
    expect(combo.value).toBe('g');

    fireEvent.change(combo, { target: { value: 'r' } });
    expect(model.color).toBe('r');
    expect(combo.value).toBe('r');
  });

  test('controlled mode uses value and onValueChange', () => {
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

  test('status and aria contracts: error', () => {
    const data = [ { value: 'r', text: 'Red' } ];
    render(
      <Select
        id="sel1"
        dataList={data}
        status="error"
        invalid
        errorMessage="필수 항목입니다"
      />
    );
    const combo = screen.getByRole('combobox');
    expect(combo).toHaveAttribute('aria-invalid', 'true');
    const err = screen.getByText('필수 항목입니다');
    expect(err.id).toBe('sel1-error');
    const describedby = combo.getAttribute('aria-describedby') || '';
    expect(describedby.split(' ')).toContain('sel1-error');
  });
});

