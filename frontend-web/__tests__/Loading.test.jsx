import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loading from '@/app/lib/component/Loading';

describe('Loading accessibility contract', () => {
  it('announces the visible processing state and exposes the busy state', () => {
    render(<Loading />);

    const loadingStatus = screen.getByRole('status');
    expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
    expect(loadingStatus).toHaveAttribute('aria-busy', 'true');
    expect(loadingStatus).toHaveClass('fixed', 'inset-0', 'backdrop-blur-sm');
    expect(loadingStatus).not.toBeEmptyDOMElement();
    expect(loadingStatus.querySelector('span')).not.toBeEmptyDOMElement();

    const spinner = loadingStatus.querySelector('svg');
    expect(spinner).toHaveClass('animate-spin', 'text-zinc-600');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });
});
