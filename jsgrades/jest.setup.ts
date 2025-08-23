import { TextEncoder, TextDecoder } from 'util';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local') });

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

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

global.Request = jest.fn() as any;
global.Response = jest.fn() as any;
global.Headers = jest.fn() as any;
