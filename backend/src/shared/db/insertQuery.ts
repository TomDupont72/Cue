import type { Row } from "@/shared/db/types/query.types.js";
import { createManyAndFetch } from "@/shared/utils/prisma/prisma.js";
import type { CreateManyAndFetchOptions } from "@/shared/utils/prisma/prisma.types.js";
import type {
  InsertData,
  InsertManyData,
  MutationModel
} from "@/shared/db/types/mutationQuery.types.js";

export class InsertQuery<
  TModel extends MutationModel,
  TSkipDuplicates extends boolean = false,
  TInput extends object = never,
  TSource extends TInput = TInput,
  TUniqueBy extends keyof TInput | readonly (keyof TInput)[] = keyof TInput
> {
  private data!: InsertData<TModel>;
  private manyData!: InsertManyData<TModel>;
  private skipDuplicatesEnabled = false;

  constructor(
    private readonly model: TModel,
    private readonly fetchOptions?: Omit<
      CreateManyAndFetchOptions<TInput, TSource, TUniqueBy, Row<TModel>>,
      "data" | "delegate"
    >
  ) {}

  value(data: InsertData<TModel>): this {
    this.data = data;
    return this;
  }

  values(data: InsertManyData<TModel>): this {
    this.manyData = data;
    return this;
  }

  skipDuplicates<TEnabled extends boolean = true>(
    enabled: TEnabled = true as TEnabled
  ): InsertQuery<TModel, TEnabled, TInput, TSource, TUniqueBy> {
    this.skipDuplicatesEnabled = enabled;
    return this as unknown as InsertQuery<TModel, TEnabled, TInput, TSource, TUniqueBy>;
  }

  async first(): Promise<true extends TSkipDuplicates ? Row<TModel> | undefined : Row<TModel>> {
    type Result = true extends TSkipDuplicates ? Row<TModel> | undefined : Row<TModel>;

    if (this.skipDuplicatesEnabled) {
      const [row] = (await this.model.createManyAndReturn({
        data: this.data,
        skipDuplicates: true
      })) as Row<TModel>[];

      return row as Result;
    }

    return (await this.model.create({ data: this.data })) as Result;
  }

  all(): Promise<Row<TModel>[]> {
    if (this.skipDuplicatesEnabled && this.fetchOptions) {
      return createManyAndFetch({
        data: this.manyData as unknown as readonly TSource[],
        scalarFields: this.fetchOptions.scalarFields,
        uniqueBy: this.fetchOptions.uniqueBy,
        delegate: this.model
      });
    }

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
