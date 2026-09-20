import type { Row } from "@/shared/db/types/query.types.js";
import type {
  MutationModel,
  UpsertCreate,
  UpsertUpdate,
  UpsertWhere
} from "@/shared/db/types/mutationQuery.types.js";

export class UpsertQuery<TModel extends MutationModel> {
  private condition!: UpsertWhere<TModel>;
  private createData!: UpsertCreate<TModel>;
  private updateData!: UpsertUpdate<TModel>;

  constructor(private readonly model: TModel) {}

  where(condition: UpsertWhere<TModel>): this {
    this.condition = condition;
    return this;
  }

  create(data: UpsertCreate<TModel>): this {
    this.createData = data;
    return this;
  }

  update(data: UpsertUpdate<TModel>): this {
    this.updateData = data;
    return this;
  }

  first(): Promise<Row<TModel>> {
    return this.model.upsert({
      where: this.condition,
      create: this.createData,
      update: this.updateData
    }) as Promise<Row<TModel>>;
  }
}
