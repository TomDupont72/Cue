import { z } from "zod";
export function dropKeys(object, keys) {
    const result = { ...object };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}
export function joinBy(source, target) {
    const getKey = (item, key) => typeof key === "function" ? key(item) : item[key];
    const targetsByKey = new Map(target.data.map((item) => [getKey(item, target.key), item]));
    const result = [];
    for (const item of source.data) {
        const match = targetsByKey.get(getKey(item, source.key));
        if (match === undefined)
            continue;
        if (source.value !== undefined) {
            if (source.as === undefined || target.value === undefined || target.as === undefined) {
                throw new TypeError("Both join sides need a value and an alias");
            }
            const sourceValue = item[source.value];
            const targetValue = match[target.value];
            const sourceValues = Array.isArray(sourceValue) ? sourceValue : [sourceValue];
            const targetValues = Array.isArray(targetValue) ? targetValue : [targetValue];
            for (const sourceValue of sourceValues) {
                for (const targetValue of targetValues) {
                    result.push({
                        [source.as]: sourceValue,
                        [target.as]: targetValue
                    });
                }
            }
            continue;
        }
        let selected;
        if (target.select !== undefined) {
            selected = target.select(match, item);
        }
        else if (target.value !== undefined) {
            selected = match[target.value];
        }
        else {
            selected = match;
        }
        const values = Array.isArray(selected) ? selected : [selected];
        result.push(...values);
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
    if (value !== null && typeof value === "object" && value.constructor === Object) {
        return Object.fromEntries(Object.entries(value).map(([key, val]) => {
            const newKey = rename[key] ?? toCamelCase(key);
            return [newKey, camelCaseKeys(val, rename)];
        }));
    }
    return value;
}
export function excludeMissingFields(schema, fields) {
    return z.preprocess((value) => {
        if (!Array.isArray(value)) {
            return value;
        }
        return value.filter((item) => {
            if (typeof item !== "object" || item === null) {
                return false;
            }
            const record = item;
            return fields.every((field) => record[field] !== null && record[field] !== undefined);
        });
    }, z.array(schema));
}
export function getMany(...selections) {
    const result = [];
    for (const selection of selections) {
        const items = Array.isArray(selection.data) ? selection.data : [selection.data];
        for (const item of items) {
            for (const field of selection.fields) {
                const selectedValue = item[field];
                const values = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
                result.push(...values);
            }
        }
    }
    return result;
}
