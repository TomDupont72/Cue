export class Query<TModel, TWhere> {
    protected conditions: TWhere[] = [];

    constructor(protected readonly model: TModel) {}

    where(condition: TWhere): this {
        this.conditions.push(condition);
        return this;
    }
}