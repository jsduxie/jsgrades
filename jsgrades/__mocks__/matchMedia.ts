let originalMatchMedia: typeof window.matchMedia | undefined;
const listeners = new Map<string, Set<(e: MediaQueryListEvent) => void>>();

function parseMaxWidth(query: string): number | null {
    const m = /max-width\s*:\s*(\d+)px/.exec(query);
    return m ? Number(m[1]) : null;
}

function getMatches(query: string): boolean {
    const max = parseMaxWidth(query);
    if (max == null) return false;
    return typeof window !== 'undefined' && window.innerWidth <= max;
}

export function setupMatchMediaMock() {
    if (typeof window === 'undefined') return;
    originalMatchMedia = window.matchMedia;
    (window as any).matchMedia = (query: string): MediaQueryList => {
        if (!listeners.has(query)) listeners.set(query, new Set());
        const mql: MediaQueryList = {
            media: query,
            matches: getMatches(query),
            onchange: null,
            addEventListener: (
                type: string,
                cb: EventListenerOrEventListenerObject
            ) => {
                if (type !== 'change') return;
                const set = listeners.get(query)!;
                const fn = cb as EventListener as unknown as (
                    e: MediaQueryListEvent
                ) => void;
                set.add(fn);
            },
            removeEventListener: (
                type: string,
                cb: EventListenerOrEventListenerObject
            ) => {
                if (type !== 'change') return;
                const set = listeners.get(query)!;
                const fn = cb as EventListener as unknown as (
                    e: MediaQueryListEvent
                ) => void;
                set.delete(fn);
            },
            addListener: (fn: (e: MediaQueryListEvent) => void) => {
                const set = listeners.get(query)!;
                set.add(fn);
            },
            removeListener: (fn: (e: MediaQueryListEvent) => void) => {
                const set = listeners.get(query)!;
                set.delete(fn);
            },
            dispatchEvent: (_: Event) => true,
        } as unknown as MediaQueryList;
        return mql;
    };
}

export function emitMatchMediaChange(query: string) {
    const set = listeners.get(query);
    if (!set) return;
    const event = {
        matches: getMatches(query),
        media: query,
    } as MediaQueryListEvent;
    for (const fn of Array.from(set)) fn(event);
}

export function teardownMatchMediaMock() {
    listeners.clear();
    if (typeof window === 'undefined') return;
    (window as any).matchMedia = originalMatchMedia as any;
    originalMatchMedia = undefined;
}
