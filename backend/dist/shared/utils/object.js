export function dropKeys(object, keys) {
    const result = { ...object };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}
function toCamelCase(key) {
    return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
export function camelCaseKeys(value, rename = {}) {
    if (Array.isArray(value)) {
        return value.map((item) => camelCaseKeys(item, rename));
    }
    if (value !== null &&
        typeof value === "object" &&
        value.constructor === Object) {
        return Object.fromEntries(Object.entries(value).map(([key, val]) => {
            const newKey = rename[key] ?? toCamelCase(key);
            return [newKey, camelCaseKeys(val, rename)];
        }));
    }
    return value;
}
