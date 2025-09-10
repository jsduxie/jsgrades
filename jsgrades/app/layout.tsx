import type { Metadata } from 'next';
import { Geist_Mono, Roboto } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { QualificationProvider } from '@/context/QualificationContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import ChunkErrorHandler from '@/components/ChunkErrorHandler';
import React from 'react';

const roboto = Roboto({
    variable: '--font-roboto',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'JSGrades',
    description: 'Academic management platform',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body
                className={`${roboto.variable} ${geistMono.variable} antialiased`}
            >
                <ErrorBoundary>
                    <ChunkErrorHandler />
                    <AuthProvider>
                        <QualificationProvider>
                            {children}
                        </QualificationProvider>
                    </AuthProvider>
                </ErrorBoundary>
            </body>
        </html>
    );
}
