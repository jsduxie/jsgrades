export default class Converter {
    static camelToSnake(str: string): string {
        return str.replace(/([A-Z])/g, '_$1').toLowerCase();
    }

    static snakeToCamel(str: string): string {
        return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
    }
}
