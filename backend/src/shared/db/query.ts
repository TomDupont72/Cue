import { PrismaModel, Where } from "@/shared/db/types/query.types.js";

export class Query<TModel extends PrismaModel> {
  protected conditions: Where<TModel>[] = [];

  constructor(protected readonly model: TModel) {}

  where(condition: Where<TModel>): this {
    this.conditions.push(condition);
    return this;
  }
}
