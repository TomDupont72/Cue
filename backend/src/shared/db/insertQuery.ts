import type { Row } from "@/shared/db/types/query.types.js";
import type {
  InsertData,
  InsertManyData,
  MutationModel
} from "@/shared/db/types/mutationQuery.types.js";

export class InsertQuery<TModel extends MutationModel> {
  private data!: InsertData<TModel>;
  private manyData!: InsertManyData<TModel>;
  private skipDuplicatesEnabled = false;

  constructor(private readonly model: TModel) {}

  value(data: InsertData<TModel>): this {
    this.data = data;
    return this;
  }

  values(data: InsertManyData<TModel>): this {
    this.manyData = data;
    return this;
  }

  skipDuplicates(enabled = true): this {
    this.skipDuplicatesEnabled = enabled;
    return this;
  }

  first(): Promise<Row<TModel>> {
    return this.model.create({ data: this.data }) as Promise<Row<TModel>>;
  }

  all(): Promise<Row<TModel>[]> {
    return this.model.createManyAndReturn({
      data: this.manyData,
      skipDuplicates: this.skipDuplicatesEnabled
    }) as Promise<Row<TModel>[]>;
  }

  async execute(): Promise<number> {
    const result = await this.model.createMany({
      data: this.manyData,
      skipDuplicates: this.skipDuplicatesEnabled
    });

    return result.count;
  }
}
