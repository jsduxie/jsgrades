'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);

        // Check if it's a chunk loading error
        if (
            error.message.includes('Loading chunk') ||
            error.message.includes('ChunkLoadError') ||
            error.name === 'ChunkLoadError'
        ) {
            console.log('Chunk loading error detected, attempting reload...');
            // For chunk loading errors, try to reload after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }

        this.setState({
            error,
            errorInfo,
        });
    }

    handleRetry = () => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const isChunkError =
                this.state.error?.message.includes('Loading chunk') ||
                this.state.error?.message.includes('ChunkLoadError') ||
                this.state.error?.name === 'ChunkLoadError';

            if (isChunkError) {
                return (
                    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background'>
                        <div className='text-center'>
                            <Loader2 className='mx-auto mb-4 h-12 w-12 animate-spin text-accent' />
                            <p className='mb-2 text-lg font-medium'>
                                Loading updated content...
                            </p>
                            <p className='text-sm text-muted-foreground'>
                                Please wait while we reload the application
                            </p>
                        </div>
                    </div>
                );
            }

            return (
                <div className='flex h-screen items-center justify-center bg-background'>
                    <div className='mx-auto max-w-md p-6 text-center'>
                        <h2 className='mb-4 text-2xl font-bold'>
                            Something went wrong
                        </h2>
                        <p className='mb-6 text-muted-foreground'>
                            An unexpected error occurred. Please try refreshing
                            the page.
                        </p>
                        <div className='space-x-4'>
                            <button
                                onClick={this.handleRetry}
                                className='inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90'
                            >
                                <RefreshCw className='mr-2 h-4 w-4' />
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReload}
                                className='inline-flex items-center rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/90'
                            >
                                Reload Page
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <details className='mt-6 text-left'>
                                <summary className='cursor-pointer text-sm font-medium'>
                                    Error Details
                                </summary>
                                <pre className='mt-2 overflow-auto rounded bg-muted p-4 text-xs'>
                                    {this.state.error?.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
