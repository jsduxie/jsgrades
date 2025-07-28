describe('Client Testing Setup', () => {
    it('should have required globals for testing', () => {
        expect(global.TextEncoder).toBeDefined();
        expect(global.TextDecoder).toBeDefined();

        const testObj = { test: 'value' };
        expect(testObj.test).toBe('value');
    });
});
