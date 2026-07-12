/**
 * 파일명: ComponentCatalogLinks.test.jsx
 * 설명: 컴포넌트 카탈로그 목차의 알려진 앵커 회귀를 검증
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

import TableOfContents from '../app/component/docs/shared/TableOfContents.jsx';

describe('component catalog table of contents', () => {
  it('links Badge and Card children to rendered example section ids', () => {
    const { container } = render(<TableOfContents />);

    expect(container.querySelector('a[href="#badge-outline-pill"]')).toBeInTheDocument();
    expect(container.querySelector('a[href="#badge-variants"]')).toBeInTheDocument();
    expect(container.querySelector('a[href="#card-basic"]')).toBeInTheDocument();
    expect(container.querySelector('a[href="#card-actions"]')).toBeInTheDocument();
    expect(container.querySelector('a[href="#tab-underline"]')).toBeInTheDocument();
    expect(container.querySelector('a[href="#badge-basic"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href="#badge-outline"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href="#card-layouts"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href="#tab-variants"]')).not.toBeInTheDocument();
  });
});
