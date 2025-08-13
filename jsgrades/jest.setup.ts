import { TextEncoder, TextDecoder } from 'util';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local') });

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

global.Request = jest.fn() as any;
global.Response = jest.fn() as any;
global.Headers = jest.fn() as any;
