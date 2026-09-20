import { Query } from "@/shared/db/query.js";
import type { Row } from "@/shared/db/types/query.types.js";
import type {
  MutationModel,
  UpsertCreate,
  UpsertUpdate,
  UpsertWhere
} from "@/shared/db/types/mutationQuery.types.js";

export class UpsertQuery<TModel extends MutationModel> extends Query<TModel, UpsertWhere<TModel>> {
  private createData!: UpsertCreate<TModel>;
  private updateData!: UpsertUpdate<TModel>;

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
      where: this.firstCondition(),
      create: this.createData,
      update: this.updateData
    }) as Promise<Row<TModel>>;
  }
}
