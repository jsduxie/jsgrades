'use client';

import { useEffect } from 'react';

export default function ChunkErrorHandler() {
    useEffect(() => {
        const hasReloadedKey = 'reloaded-on-chunk-error';

        // Handle chunk loading errors globally
        const handleChunkError = (event: ErrorEvent) => {
            const error = event.error as Error | undefined;

            // Check if it's a chunk loading error
            if (
                error?.name === 'ChunkLoadError' ||
                error?.message?.includes('Loading chunk') ||
                error?.message?.includes('timeout')
            ) {
                const hasReloaded = sessionStorage.getItem(hasReloadedKey);
                if (!hasReloaded) {
                    sessionStorage.setItem(hasReloadedKey, '1');
                    console.log(
                        'Chunk loading error detected, reloading once...',
                        error
                    );
                    window.location.reload();
                } else {
                    console.error(
                        'Chunk loading error persists after reload; suppressing further reloads.'
                    );
                }
                return;
            }
        };

        // Handle unhandled promise rejections that might be chunk errors
        const handleRejection = (event: PromiseRejectionEvent) => {
            const error = event.reason as Error | undefined;

            if (
                error?.name === 'ChunkLoadError' ||
                error?.message?.includes('Loading chunk') ||
                error?.message?.includes('timeout')
            ) {
                event.preventDefault(); // Prevent the error from being logged
                const hasReloaded = sessionStorage.getItem(hasReloadedKey);
                if (!hasReloaded) {
                    sessionStorage.setItem(hasReloadedKey, '1');
                    console.log(
                        'Promise rejection with chunk error, reloading once...',
                        error
                    );
                    window.location.reload();
                } else {
                    console.error(
                        'Chunk loading error persists after reload; suppressing further reloads.'
                    );
                }
                return;
            }
        };

        // Add event listeners
        window.addEventListener('error', handleChunkError);
        window.addEventListener('unhandledrejection', handleRejection);

        // Cleanup
        return () => {
            window.removeEventListener('error', handleChunkError);
            window.removeEventListener('unhandledrejection', handleRejection);
        };
    }, []);

    return null; // This component doesn't render anything
}
