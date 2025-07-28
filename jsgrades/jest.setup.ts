import { TextEncoder, TextDecoder } from 'util';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

// Polyfill for Node.js globals in test environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Suppress console outputs during tests using jest.spyOn
beforeEach(() => {
    // Spy on console methods to suppress output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    // Restore console methods after each test
    jest.restoreAllMocks();
});

// Mock fetch for tests that might need it
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock Request, Response, Headers without importing node-fetch
global.Request = jest.fn() as any;
global.Response = jest.fn() as any;
global.Headers = jest.fn() as any;
