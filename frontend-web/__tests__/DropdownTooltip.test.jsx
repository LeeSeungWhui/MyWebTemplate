import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '@/app/lib/component/Button';
import Dropdown from '@/app/lib/component/Dropdown';
import Tooltip from '@/app/lib/component/Tooltip';

describe('Dropdown keyboard and focus contracts', () => {
  const optionList = [
    { label: '비활성 앞', value: 'disabled-first', disabled: true },
    { label: '활성 하나', value: 'enabled-one' },
    { label: '비활성 중간', value: 'disabled-middle', disabled: true },
    { label: '활성 둘', value: 'enabled-two' },
  ];

  it('skips disabled options, wraps, and closes after one keyboard selection', () => {
    const handleSelect = vi.fn();
    render(<Dropdown dataList={optionList.map((item) => ({ ...item }))} onSelect={handleSelect} />);

    const triggerButton = screen.getByRole('button', { name: /선택/ });
    fireEvent.click(triggerButton);

    const enabledOneButton = screen.getByRole('menuitemcheckbox', { name: '활성 하나' });
    const enabledTwoButton = screen.getByRole('menuitemcheckbox', { name: '활성 둘' });
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(enabledOneButton).toHaveFocus();
    expect(enabledOneButton).toHaveClass('bg-gray-100');
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(enabledTwoButton).toHaveFocus();
    expect(enabledTwoButton).toHaveClass('bg-gray-100');
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(enabledOneButton).toHaveFocus();
    expect(enabledOneButton).toHaveClass('bg-gray-100');
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(enabledTwoButton).toHaveFocus();
    expect(enabledTwoButton).toHaveClass('bg-gray-100');

    fireEvent.keyDown(enabledTwoButton, { key: 'Enter' });
    fireEvent.click(enabledTwoButton);
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({ value: 'enabled-two' }));
    expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(triggerButton).toHaveFocus();
  });

  it('never activates a disabled-only list from the keyboard', () => {
    const handleSelect = vi.fn();
    render(
      <Dropdown
        dataList={[{ label: '선택 불가', value: 'disabled', disabled: true }]}
        onSelect={handleSelect}
      />,
    );
    const triggerButton = screen.getByRole('button', { name: /선택/ });
    fireEvent.click(triggerButton);
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(handleSelect).not.toHaveBeenCalled();
    expect(triggerButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on Tab or focus leaving and ignores navigation outside the root', () => {
    const handleSelect = vi.fn();
    render(
      <>
        <Dropdown dataList={[{ label: '활성', value: 'enabled' }]} onSelect={handleSelect} />
        <button type="button">외부 버튼</button>
      </>,
    );
    const triggerButton = screen.getByRole('button', { name: /선택/ });
    fireEvent.click(triggerButton);
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    const activeButton = screen.getByRole('menuitemcheckbox', { name: '활성' });
    expect(activeButton).toHaveFocus();
    fireEvent.keyDown(activeButton, { key: 'Tab' });
    const outsideButton = screen.getByRole('button', { name: '외부 버튼' });
    expect(screen.getByRole('menu')).toBeInTheDocument();
    act(() => outsideButton.focus());
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(outsideButton).toHaveFocus();

    fireEvent.click(triggerButton);
    fireEvent.blur(triggerButton, { relatedTarget: outsideButton });
    fireEvent.focus(outsideButton);
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(handleSelect).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('keeps controlled and multi-select close behavior intact', () => {
    const handleOpenChange = vi.fn();
    const handleSelect = vi.fn();
    const multiOption = { label: '다중 항목', value: 'multi', selected: false };
    render(
      <Dropdown
        dataList={[multiOption]}
        open
        multiSelect
        onOpenChange={handleOpenChange}
        onSelect={handleSelect}
      />,
    );
    const multiOptionButton = screen.getByRole('menuitemcheckbox', { name: '다중 항목' });
    fireEvent.focus(multiOptionButton);
    fireEvent.keyDown(multiOptionButton, { key: 'Enter' });
    fireEvent.click(multiOptionButton);
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(expect.objectContaining({ selected: true }));
    expect(multiOption.selected).toBe(true);
    expect(multiOptionButton).toHaveAttribute('aria-checked', 'true');
    expect(handleOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('repaints plain-array multi selection after updating documented selected flags', () => {
    const sourceOptionList = [
      { label: '개발', value: 'dev', selected: false },
      { label: '디자인', value: 'design', selected: false },
    ];
    render(
      <Dropdown
        dataList={sourceOptionList}
        multiSelect
        placeholder="역할 선택"
      />,
    );

    const triggerButton = screen.getByRole('button', { name: /역할 선택/ });
    fireEvent.click(triggerButton);
    const developerOptionButton = screen.getByRole('menuitemcheckbox', { name: '개발' });
    const designOptionButton = screen.getByRole('menuitemcheckbox', { name: '디자인' });

    fireEvent.click(developerOptionButton);
    expect(sourceOptionList[0].selected).toBe(true);
    expect(developerOptionButton).toHaveAttribute('aria-checked', 'true');
    expect(triggerButton).toHaveTextContent('개발');

    fireEvent.click(designOptionButton);
    expect(sourceOptionList[1].selected).toBe(true);
    expect(designOptionButton).toHaveAttribute('aria-checked', 'true');
    expect(triggerButton).toHaveTextContent('2개 선택');
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('restores trigger focus on Escape without changing Tab behavior', () => {
    render(<Dropdown dataList={[{ label: '활성', value: 'enabled' }]} />);
    const triggerButton = screen.getByRole('button', { name: /선택/ });
    fireEvent.click(triggerButton);
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    const optionButton = screen.getByRole('menuitemcheckbox', { name: '활성' });
    expect(optionButton).toHaveFocus();
    fireEvent.keyDown(optionButton, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(triggerButton).toHaveFocus();
  });

  it('resets a controlled menu active item after an external close and reopen', () => {
    const controlledOptions = optionList.map((item) => ({ ...item }));
    const { rerender } = render(<Dropdown dataList={controlledOptions} open />);
    const triggerButton = screen.getByRole('button', { name: /선택/ });
    triggerButton.focus();
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitemcheckbox', { name: '활성 하나' })).toHaveFocus();

    rerender(<Dropdown dataList={controlledOptions} open={false} />);
    rerender(<Dropdown dataList={controlledOptions} open />);
    triggerButton.focus();
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitemcheckbox', { name: '활성 하나' })).toHaveFocus();
  });

  it('only exposes aria-checked when checkbox menu semantics are enabled', () => {
    const plainOptionList = [{ label: '일반 항목', value: 'plain', selected: true }];
    const { rerender } = render(<Dropdown dataList={plainOptionList} open showCheck />);

    expect(screen.getByRole('menuitemcheckbox', { name: '일반 항목' }))
      .toHaveAttribute('aria-checked', 'true');

    rerender(<Dropdown dataList={plainOptionList} open showCheck={false} />);

    expect(screen.queryByRole('menuitemcheckbox', { name: '일반 항목' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: '일반 항목' })).not.toHaveAttribute('aria-checked');
  });

  it('never exposes or operates a default-open or controlled-open menu while disabled', () => {
    const handleOpenChange = vi.fn();
    const { rerender } = render(
      <Dropdown
        dataList={[{ label: '숨김 항목', value: 'hidden' }]}
        defaultOpen
        disabled
        onOpenChange={handleOpenChange}
      />,
    );
    const triggerButton = screen.getByRole('button', { name: /선택/ });
    expect(triggerButton).toBeDisabled();
    expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(handleOpenChange).not.toHaveBeenCalled();

    rerender(
      <Dropdown
        dataList={[{ label: '숨김 항목', value: 'hidden' }]}
        open
        disabled
        onOpenChange={handleOpenChange}
      />,
    );
    expect(triggerButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(handleOpenChange).not.toHaveBeenCalled();
  });
});

describe('Tooltip dismissal and accessibility contracts', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('makes a non-interactive trigger reachable and closes click mode with Escape', () => {
    render(
      <Tooltip content="도움말" trigger="click">
        <span>도움말 열기</span>
      </Tooltip>,
    );
    const child = screen.getByText('도움말 열기');
    const triggerWrapper = child.parentElement;
    expect(triggerWrapper).toHaveAttribute('tabindex', '0');
    expect(triggerWrapper).toHaveAttribute('role', 'button');
    fireEvent.keyDown(triggerWrapper, { key: 'Enter' });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.keyDown(child, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('closes click mode on outside mousedown without adding a nested tab stop to buttons', () => {
    render(
      <>
        <Tooltip content="버튼 도움말" trigger="click">
          <button type="button">버튼 트리거</button>
        </Tooltip>
        <button type="button">외부</button>
      </>,
    );
    const triggerButton = screen.getByRole('button', { name: '버튼 트리거' });
    expect(triggerButton.parentElement).not.toHaveAttribute('tabindex');
    fireEvent.click(triggerButton);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('button', { name: '외부' }));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('connects native and prop-forwarding custom focused buttons to the live tooltip id', () => {
    const nativeRender = render(
      <>
        <span id="native-help">기존 네이티브 설명</span>
        <Tooltip content="네이티브 도움말" trigger="click">
          <button type="button" aria-describedby="native-help">네이티브 트리거</button>
        </Tooltip>
      </>,
    );
    const nativeButton = screen.getByRole('button', { name: '네이티브 트리거' });
    nativeButton.focus();
    fireEvent.click(nativeButton);
    const nativeTooltip = screen.getByRole('tooltip');
    expect(nativeButton).toHaveFocus();
    expect(nativeButton).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('native-help'),
    );
    expect(nativeButton.getAttribute('aria-describedby').split(/\s+/)).toContain(nativeTooltip.id);
    expect(nativeButton.parentElement).not.toHaveAttribute('aria-describedby');

    nativeRender.unmount();
    render(
      <>
        <span id="custom-help">기존 커스텀 설명</span>
        <Tooltip content="커스텀 도움말" trigger="click">
          <Button aria-describedby="custom-help">커스텀 트리거</Button>
        </Tooltip>
      </>,
    );
    const customButton = screen.getByRole('button', { name: '커스텀 트리거' });
    customButton.focus();
    fireEvent.click(customButton);
    const customTooltip = screen.getByRole('tooltip');
    expect(customButton).toHaveFocus();
    expect(customButton).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('custom-help'),
    );
    expect(customButton.getAttribute('aria-describedby').split(/\s+/)).toContain(customTooltip.id);
    expect(customButton.parentElement).not.toHaveAttribute('tabindex');
  });

  it('clears pending timers and closes an open tooltip when disabled', () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <Tooltip content="지연 도움말" delay={50}>
        <span>지연 트리거</span>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByText('지연 트리거'));
    rerender(
      <Tooltip content="지연 도움말" delay={50} disabled>
        <span>지연 트리거</span>
      </Tooltip>,
    );
    act(() => vi.advanceTimersByTime(100));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    rerender(
      <Tooltip content="즉시 도움말" delay={0}>
        <span>즉시 트리거</span>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByText('즉시 트리거'));
    act(() => vi.runOnlyPendingTimers());
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    rerender(
      <Tooltip content="즉시 도움말" delay={0} disabled>
        <span>즉시 트리거</span>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it.each([
    ['top', 'bottom-full'],
    ['bottom', 'top-full'],
    ['left', 'right-full'],
    ['right', 'left-full'],
  ])('renders the documented %s placement after the configured delay', (placement, placementClass) => {
    vi.useFakeTimers();
    render(
      <Tooltip content={`${placement} 도움말`} placement={placement} delay={25}>
        <span>{placement} 트리거</span>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByText(`${placement} 트리거`));
    act(() => vi.advanceTimersByTime(24));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('tooltip')).toHaveClass(placementClass);
  });

  it('supports vertical text, custom root classes, focus trigger cleanup, and timer cleanup on unmount', () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = render(
      <Tooltip content="세로 도움말" trigger="focus" textDirection="tb" className="custom-root" delay={20}>
        <span>포커스 트리거</span>
      </Tooltip>,
    );
    const trigger = screen.getByText('포커스 트리거');
    expect(trigger.closest('.custom-root')).toBeInTheDocument();
    fireEvent.focus(trigger);
    act(() => vi.advanceTimersByTime(20));
    expect(screen.getByRole('tooltip')).toHaveClass('[writing-mode:vertical-rl]');
    fireEvent.blur(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    fireEvent.focus(trigger);
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
