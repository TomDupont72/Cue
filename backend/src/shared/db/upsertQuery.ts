import { Query } from "@/shared/db/query.js";
import { upsertManyAndFetch } from "@/shared/utils/prisma/prisma.js";
import type { UpsertManyAndFetchOptions } from "@/shared/utils/prisma/prisma.types.js";
import type { Row } from "@/shared/db/types/query.types.js";
import type {
  MutationModel,
  UpsertCreate,
  UpsertUpdate,
  UpsertWhere
} from "@/shared/db/types/mutationQuery.types.js";

export class UpsertQuery<
  TModel extends MutationModel,
  TInput extends object = UpsertCreate<TModel>,
  TUniqueBy extends keyof TInput | readonly (keyof TInput)[] = keyof TInput
> extends Query<TModel, UpsertWhere<TModel>> {
  private createData!: UpsertCreate<TModel>;
  private updateData!: UpsertUpdate<TModel>;
  private manyData: readonly TInput[] = [];

  constructor(
    model: TModel,
    private readonly manyOptions?: Omit<
      UpsertManyAndFetchOptions<TInput, TUniqueBy, Row<TModel>>,
      "data" | "delegate"
    >
  ) {
    super(model);
  }

  create(data: UpsertCreate<TModel>): this {
    this.createData = data;
    return this;
  }

  update(data: UpsertUpdate<TModel>): this {
    this.updateData = data;
    return this;
  }

  values(data: readonly TInput[]): this {
    this.manyData = data;
    return this;
  }

  first(): Promise<Row<TModel>> {
    return this.model.upsert({
      where: this.firstCondition(),
      create: this.createData,
      update: this.updateData
    }) as Promise<Row<TModel>>;
  }

  all(): Promise<Row<TModel>[]> {
    return upsertManyAndFetch({
      data: this.manyData,
      scalarFields: this.manyOptions!.scalarFields,
      uniqueBy: this.manyOptions!.uniqueBy,
      delegate: this.model
    });
  }
}
