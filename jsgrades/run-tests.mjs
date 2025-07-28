import { execSync } from 'child_process';

try {
    console.log('Running API tests...');
    const output = execSync(
        'node --experimental-vm-modules node_modules/jest/bin/jest.js tests/api/qualifications.test.ts --verbose',
        {
            encoding: 'utf8',
            stdio: 'pipe',
        }
    );
    console.log(output);
} catch (error) {
    console.error('Test execution failed:');
    console.error(error.stdout);
    console.error(error.stderr);
}
