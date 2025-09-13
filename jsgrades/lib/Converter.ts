export default class Converter {
    static camelToSnake(str: string): string {
        return str.replace(/([A-Z])/g, '_$1').toLowerCase();
    }

    static snakeToCamel(str: string): string {
        return str.replace(/_+([a-z])/g, (_, char) => char.toUpperCase());
    }

    static objectSnakeToCamel<T = Record<string, unknown>>(
        obj: Record<string, unknown>
    ): T {
        const converted: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            const camelKey = this.snakeToCamel(key);
            converted[camelKey] = value;
        }
        return converted as T;
    }

    static objectCamelToSnake(
        obj: Record<string, unknown>
    ): Record<string, unknown> {
        const converted: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            const snakeKey = this.camelToSnake(key);
            converted[snakeKey] = value;
        }
        return converted;
    }
}
