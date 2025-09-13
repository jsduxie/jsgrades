/**
 * @jest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { act } from 'react-dom/test-utils';
import { createRoot, Root } from 'react-dom/client';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    setupMatchMediaMock,
    emitMatchMediaChange,
    teardownMatchMediaMock,
} from '@/__mocks__/matchMedia';

const QUERY = '(max-width: 767px)';

function TestProbe() {
    const isMobile = useIsMobile();
    return <span data-mobile={isMobile ? 'true' : 'false'} />;
}

describe('useIsMobile', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        setupMatchMediaMock();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    });

    afterEach(() => {
        act(() => {
            root.unmount();
        });
        container.remove();
        teardownMatchMediaMock();
    });

    it('returns true when width is below the mobile breakpoint and updates on change', () => {
        (window as any).innerWidth = 500;
        act(() => {
            root.render(<TestProbe />);
        });
        const span = container.querySelector('span')!;
        expect(span.getAttribute('data-mobile')).toBe('true');

        (window as any).innerWidth = 1024;
        act(() => {
            emitMatchMediaChange(QUERY);
        });
        expect(span.getAttribute('data-mobile')).toBe('false');

        (window as any).innerWidth = 600;
        act(() => {
            emitMatchMediaChange(QUERY);
        });
        expect(span.getAttribute('data-mobile')).toBe('true');
    });

    it('returns false when width is at or above the breakpoint', () => {
        (window as any).innerWidth = 1200;
        act(() => {
            root.render(<TestProbe />);
        });
        const span = container.querySelector('span')!;
        expect(span.getAttribute('data-mobile')).toBe('false');
    });
});
