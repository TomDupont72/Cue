import { dropKeys } from "../../../shared/utils/object/object.js";
function dropUnknownFields(source, scalarFields) {
    const allowedFields = new Set(Object.values(scalarFields));
    const unknownFields = Object.keys(source).filter((field) => !allowedFields.has(field));
    return dropKeys(source, unknownFields);
}
export async function createManyAndFetch({ data, scalarFields, uniqueBy, delegate }) {
    if (data.length === 0) {
        return [];
    }
    const sanitizedData = data.map((item) => dropUnknownFields(item, scalarFields));
    const uniqueFields = (Array.isArray(uniqueBy) ? uniqueBy : [uniqueBy]);
    const uniqueData = [
        ...new Map(sanitizedData.map((item) => [JSON.stringify(uniqueFields.map((field) => item[field])), item])).values()
    ];
    const uniqueField = uniqueBy;
    const where = (Array.isArray(uniqueBy)
        ? {
            OR: uniqueData.map((item) => Object.fromEntries(uniqueFields.map((field) => [field, item[field]])))
        }
        : { [uniqueField]: { in: uniqueData.map((item) => item[uniqueField]) } });
    await delegate.createMany({ data: uniqueData, skipDuplicates: true });
    return delegate.findMany({ where });
}
export async function deleteManyAndFetch({ where, delegate }) {
    const records = await delegate.findMany({ where });
    if (records.length === 0) {
        return [];
    }
    await delegate.deleteMany({ where });
    return records;
}
export async function findManyPaginated({ where, limit, cursor, cursorField, order = "desc", delegate }) {
    const cursorCondition = cursor !== undefined
        ? {
            [cursorField]: {
                [order === "desc" ? "lt" : "gt"]: cursor
            }
        }
        : {};
    const records = await delegate.findMany({
        where: {
            AND: [
                where,
                cursorCondition
            ]
        },
        orderBy: {
            [cursorField]: order
        },
        take: limit + 1
    });
    const hasNextPage = records.length > limit;
    const items = records.slice(0, limit);
    const lastItem = items.at(-1);
    return {
        items,
        hasNextPage,
        nextCursor: hasNextPage && lastItem
            ? lastItem[cursorField]
            : null
    };
}
