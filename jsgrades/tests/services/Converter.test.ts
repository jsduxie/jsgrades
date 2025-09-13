import Converter from '@/lib/Converter';

describe('Converter service test', () => {
    describe('Converter.camelToSnake', () => {
        it('correctly converts camelCase strings to snake_case', () => {
            expect(Converter.camelToSnake('camelCaseString')).toBe(
                'camel_case_string'
            );
            expect(
                Converter.camelToSnake(
                    'longStatementToBeConvertedIntoSnakeCase'
                )
            ).toBe('long_statement_to_be_converted_into_snake_case');
        });

        it('does not alter strings without uppercase letters', () => {
            expect(Converter.camelToSnake('nouppercase')).toBe('nouppercase');
            expect(Converter.camelToSnake('already_snake_case')).toBe(
                'already_snake_case'
            );
        });

        it('handles empty strings', () => {
            expect(Converter.camelToSnake('')).toBe('');
        });

        it('handles single character strings', () => {
            expect(Converter.camelToSnake('a')).toBe('a');
            expect(Converter.camelToSnake('A')).toBe('_a');
        });

        it('handles strings with consecutive uppercase letters', () => {
            expect(Converter.camelToSnake('JSONResponse')).toBe(
                '_j_s_o_n_response'
            );
            expect(Converter.camelToSnake('XMLHttpRequest')).toBe(
                '_x_m_l_http_request'
            );
        });
    });

    describe('Converter.snakeToCamel', () => {
        it('correctly converts snake_case strings to camelCase', () => {
            expect(Converter.snakeToCamel('snake_case_string')).toBe(
                'snakeCaseString'
            );
            expect(
                Converter.snakeToCamel(
                    'long_statement_to_be_converted_into_camel_case'
                )
            ).toBe('longStatementToBeConvertedIntoCamelCase');
        });

        it('does not alter strings without underscores', () => {
            expect(Converter.snakeToCamel('nouppercase')).toBe('nouppercase');
            expect(Converter.snakeToCamel('alreadyCamelCase')).toBe(
                'alreadyCamelCase'
            );
        });

        it('handles empty strings', () => {
            expect(Converter.snakeToCamel('')).toBe('');
        });

        it('handles single character strings', () => {
            expect(Converter.snakeToCamel('a')).toBe('a');
            expect(Converter.snakeToCamel('A')).toBe('A');
        });

        it('handles strings with consecutive underscores', () => {
            expect(Converter.snakeToCamel('json_response')).toBe(
                'jsonResponse'
            );
            expect(Converter.snakeToCamel('xml_http_request')).toBe(
                'xmlHttpRequest'
            );
            expect(Converter.snakeToCamel('multiple__underscores')).toBe(
                'multipleUnderscores'
            );
        });
    });

    describe('Converter.objectSnakeToCamel', () => {
        it('correctly converts object keys from snake_case to camelCase', () => {
            const input = {
                first_key: 'value1',
                second_key: 42,
                nested_object: {
                    inner_key: 'innerValue',
                },
            };
            const expected = {
                firstKey: 'value1',
                secondKey: 42,
                nestedObject: {
                    inner_key: 'innerValue',
                },
            };
            expect(Converter.objectSnakeToCamel(input)).toEqual(expected);
        });

        it('handles empty objects', () => {
            expect(Converter.objectSnakeToCamel({})).toEqual({});
        });

        it('handles objects with no snake_case keys', () => {
            const input = {
                firstKey: 'value1',
                secondKey: 42,
            };
            expect(Converter.objectSnakeToCamel(input)).toEqual(input);
        });
    });

    describe('Converter.objectCamelToSnake', () => {
        it('correctly converts object keys from camelCase to snake_case', () => {
            const input = {
                firstKey: 'value1',
                secondKey: 42,
                nestedObject: {
                    innerKey: 'innerValue',
                },
            };
            const expected = {
                first_key: 'value1',
                second_key: 42,
                nested_object: {
                    innerKey: 'innerValue',
                },
            };
            expect(Converter.objectCamelToSnake(input)).toEqual(expected);
        });

        it('handles empty objects', () => {
            expect(Converter.objectCamelToSnake({})).toEqual({});
        });

        it('handles objects with no camelCase keys', () => {
            const input = {
                first_key: 'value1',
                second_key: 42,
            };
            expect(Converter.objectCamelToSnake(input)).toEqual(input);
        });
    });
});
