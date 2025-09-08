import { TextDecoder, TextEncoder } from 'util';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local') });

declare global {
    var TextEncoder: typeof TextEncoder;
    var TextDecoder: typeof TextDecoder;
    var Request: typeof Request;
    var Response: typeof Response;
    var Headers: typeof Headers;
}

(global as typeof globalThis).TextEncoder = TextEncoder;
(global as typeof globalThis).TextDecoder = TextDecoder;

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
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.Request = jest.fn() as jest.MockedFunction<typeof Request>;
global.Response = jest.fn() as jest.MockedFunction<typeof Response>;
global.Headers = jest.fn() as jest.MockedFunction<typeof Headers>;
