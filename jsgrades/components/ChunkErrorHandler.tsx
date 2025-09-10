'use client';

import { useEffect } from 'react';

export default function ChunkErrorHandler() {
    useEffect(() => {
        // Handle chunk loading errors globally
        const handleChunkError = (event: ErrorEvent) => {
            const error = event.error;

            // Check if it's a chunk loading error
            if (
                error?.name === 'ChunkLoadError' ||
                error?.message?.includes('Loading chunk') ||
                error?.message?.includes('timeout')
            ) {
                console.log(
                    'Chunk loading error detected, reloading...',
                    error
                );
                // Reload the page to get fresh chunks
                window.location.reload();
                return;
            }
        };

        // Handle unhandled promise rejections that might be chunk errors
        const handleRejection = (event: PromiseRejectionEvent) => {
            const error = event.reason;

            if (
                error?.name === 'ChunkLoadError' ||
                error?.message?.includes('Loading chunk') ||
                error?.message?.includes('timeout')
            ) {
                console.log(
                    'Promise rejection with chunk error, reloading...',
                    error
                );
                event.preventDefault(); // Prevent the error from being logged
                window.location.reload();
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
