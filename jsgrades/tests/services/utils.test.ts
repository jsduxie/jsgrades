import { describe, it, expect } from '@jest/globals';
import { cn } from '@/lib/utils';

describe('utils.cn', () => {
    it('combines simple class strings', () => {
        expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
        expect(cn('p-2', 'm-4')).toBe('p-2 m-4');
    });

    it('ignores falsy values (undefined, null, false, empty string)', () => {
        expect(cn('p-2', undefined, null, false, '')).toBe('p-2');
    });

    it('handles arrays, nested arrays, and object syntax like clsx', () => {
        const out = cn(
            ['p-2', null, ['m-2']],
            { 'p-4': true, hidden: false },
            'block'
        );
        expect(out).toBe('m-2 p-4 block');
    });

    it('de-duplicates identical classes', () => {
        expect(cn('text-sm', 'text-sm')).toBe('text-sm');
        expect(cn('font-bold', 'font-bold', 'font-bold')).toBe('font-bold');
    });

    it('resolves Tailwind conflicts by keeping the last one', () => {
        expect(cn('p-2', 'p-4')).toBe('p-4');
        expect(cn('px-2', 'px-4')).toBe('px-4');
        expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    it('resolves variant conflicts correctly (e.g., hover:)', () => {
        expect(cn('hover:p-2', 'hover:p-4')).toBe('hover:p-4');
        expect(cn('focus:text-red-500', 'focus:text-blue-500')).toBe(
            'focus:text-blue-500'
        );
    });

    it('works with conditional classes via object form', () => {
        const primary = true;
        const disabled = false;
        const out = cn('btn', {
            'btn-primary': primary,
            'btn-disabled': disabled,
        });
        expect(out).toBe('btn btn-primary');
    });
});
