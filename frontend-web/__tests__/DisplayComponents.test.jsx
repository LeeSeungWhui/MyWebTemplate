import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Empty from '../app/lib/component/Empty.jsx';
import Icon from '../app/lib/component/Icon.jsx';
import Skeleton from '../app/lib/component/Skeleton.jsx';
import Stat from '../app/lib/component/Stat.jsx';

describe('Stat', () => {
  it.each([
    ['up', '▲ +12%', 'text-green-600'],
    ['down', '▼ -8%', 'text-red-600'],
    ['neutral', '동일', 'text-gray-500'],
    ['unknown', '미정', 'text-gray-500'],
  ])('renders the %s delta path', (deltaType, expectedText, expectedClass) => {
    render(<Stat label="처리량" value="100" delta={expectedText.replace(/^[▲▼] /, '')} deltaType={deltaType} />);

    expect(screen.getByText(expectedText)).toHaveClass(expectedClass);
    expect(screen.getByText('100')).toHaveAttribute('aria-label');
  });

  it('renders optional icon/help content and root classes while omitting absent delta', () => {
    render(
      <Stat
        label="서비스 상태"
        value="정상"
        icon={<span data-testid="stat-icon">icon</span>}
        helpText="최근 30일"
        className="ring-1"
      />
    );

    const root = screen.getByText('서비스 상태').closest('.border');
    expect(root).toHaveClass('ring-1');
    expect(screen.getByTestId('stat-icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('최근 30일')).toHaveClass('text-xs');
    expect(screen.getByText('정상').parentElement?.children).toHaveLength(1);
  });
});

describe('Skeleton', () => {
  it('renders the default rect with custom classes and forwarded attributes', () => {
    const { container } = render(<Skeleton className="h-8 w-full" data-testid="rect" aria-label="로딩 자리" />);

    const rect = screen.getByTestId('rect');
    expect(rect).toBe(container.firstChild);
    expect(rect).toHaveClass('animate-pulse', 'rounded', 'h-8', 'w-full');
    expect(rect).toHaveAttribute('aria-label', '로딩 자리');
  });

  it('renders the requested text lines and clamps non-positive counts to one', () => {
    const { rerender } = render(<Skeleton variant="text" lines={3} className="max-w-md" data-testid="text" />);

    expect(screen.getByTestId('text')).toHaveClass('space-y-2', 'max-w-md');
    expect(screen.getByTestId('text').children).toHaveLength(3);

    rerender(<Skeleton variant="text" lines={0} data-testid="text" />);
    expect(screen.getByTestId('text').children).toHaveLength(1);
  });

  it.each([
    [Number.POSITIVE_INFINITY, 1],
    [Number.NaN, 1],
    [-7, 1],
    [2.9, 2],
    [Number.MAX_SAFE_INTEGER, 100],
  ])('normalizes the text line boundary %s to %s rendered lines', (lines, expectedLineCount) => {
    render(<Skeleton variant="text" lines={lines} data-testid="text-boundary" />);

    expect(screen.getByTestId('text-boundary').children).toHaveLength(expectedLineCount);
  });

  it.each([
    [16, 'w-4', 'h-4'],
    [20, 'w-5', 'h-5'],
    [24, 'w-6', 'h-6'],
    [32, 'w-8', 'h-8'],
    [40, 'w-10', 'h-10'],
    [48, 'w-12', 'h-12'],
    [56, 'w-14', 'h-14'],
    [64, 'w-16', 'h-16'],
  ])('maps circleSize %s to stable utility classes', (circleSize, widthClass, heightClass) => {
    render(<Skeleton variant="circle" circleSize={circleSize} data-testid="circle" />);

    expect(screen.getByTestId('circle')).toHaveClass('rounded-full', widthClass, heightClass);
  });

  it('preserves circle custom classes and falls back to size 40 for unsupported values', () => {
    render(<Skeleton variant="circle" circleSize={999} className="shrink-0 custom-circle" data-testid="circle" />);

    expect(screen.getByTestId('circle')).toHaveClass('w-10', 'h-10', 'shrink-0', 'custom-circle');
  });
});

describe('Empty', () => {
  it('renders the default title and decorative default icon', () => {
    const { container } = render(<Empty />);

    expect(screen.getByRole('heading')).not.toBeEmptyDOMElement();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders every optional content path and forwards root attributes', () => {
    render(
      <Empty
        icon="md:MdSearchOff"
        title="결과 없음"
        description="조건을 바꿔 주세요"
        action={<button type="button">초기화</button>}
        className="shadow-sm"
        data-testid="empty"
      >
        <span>검색어: design</span>
      </Empty>
    );

    expect(screen.getByTestId('empty')).toHaveClass('shadow-sm');
    expect(screen.getByRole('heading', { name: '결과 없음' })).toBeInTheDocument();
    expect(screen.getByText('조건을 바꿔 주세요')).toBeInTheDocument();
    expect(screen.getByText('검색어: design')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '초기화' }).parentElement).toHaveClass('mt-4');
  });
});

describe('Icon', () => {
  it.each([
    'ai:AiFillHome',
    'bi:BiHome',
    'bs:BsHouse',
    'fi:FiHome',
    'hi:HiHome',
    'io:IoHome',
    'md:MdHome',
    'ri:RiHomeLine',
  ])('renders the documented icon set for %s', (icon) => {
    const { container } = render(<Icon icon={icon} />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports the unprefixed family-name form and rejects unknown icons safely', () => {
    const { container, rerender } = render(<Icon icon="MdHome" />);
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(<Icon icon="xx:Missing" />);
    expect(container).toBeEmptyDOMElement();

    rerender(<Icon icon="md:DefinitelyMissing" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('keeps decorative icons hidden and gives semantic icons a preferred or fallback name', () => {
    const { rerender } = render(<Icon icon="fi:FiGithub" ariaLabel="GitHub 저장소" />);
    expect(screen.getByRole('img', { name: 'GitHub 저장소' })).toBeInTheDocument();

    rerender(<Icon icon="md:MdHome" decorative={false} />);
    expect(screen.getByRole('img', { name: 'md:MdHome' })).toBeInTheDocument();

    rerender(<Icon icon="md:MdHome" decorative={false} ariaLabel="홈" />);
    expect(screen.getByRole('img', { name: '홈' })).toBeInTheDocument();

    rerender(<Icon icon="md:MdHome" decorative={false} aria-label="" />);
    expect(screen.getByRole('img', { name: 'md:MdHome' })).toBeInTheDocument();
  });

  it('forwards refs, visual props, and generic SVG attributes', () => {
    const ref = createRef();
    render(
      <Icon
        ref={ref}
        icon="md:MdHome"
        size="24px"
        color="rgb(255, 0, 0)"
        className="custom-icon"
        data-testid="icon"
      />
    );

    expect(ref.current).toBe(screen.getByTestId('icon'));
    expect(screen.getByTestId('icon')).toHaveClass('custom-icon');
    expect(screen.getByTestId('icon')).toHaveAttribute('height', '24px');
    expect(screen.getByTestId('icon')).toHaveAttribute('width', '24px');
    expect(screen.getByTestId('icon')).toHaveAttribute('color', 'rgb(255, 0, 0)');
  });
});
