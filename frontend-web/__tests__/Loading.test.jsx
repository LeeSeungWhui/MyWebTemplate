import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loading from '@/app/lib/component/Loading';

describe('Loading accessibility contract', () => {
  it('announces the visible processing state and exposes the busy state', () => {
    render(<Loading />);

    const loadingStatus = screen.getByRole('status');
    expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
    expect(loadingStatus).toHaveAttribute('aria-busy', 'true');
    expect(loadingStatus).not.toBeEmptyDOMElement();
  });
});
