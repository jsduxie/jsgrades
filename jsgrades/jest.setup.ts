import { config } from 'dotenv';
import path from 'path';
import '@testing-library/jest-dom';

config({ path: path.resolve(process.cwd(), '.env.local') });

// Set longer timeout for integration tests that involve database operations
jest.setTimeout(15000);

beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

// Mock Web API globals that NextRequest depends on
global.fetch = jest.fn() as unknown as typeof fetch;
global.Request = jest.fn() as unknown as typeof Request;
global.Response = jest.fn() as unknown as typeof Response;
global.Headers = jest.fn() as unknown as typeof Headers;
