import { Query } from "@/shared/db/query.js";
import type { Row } from "@/shared/db/types/query.types.js";
import type { MutationModel, UpdateData } from "@/shared/db/types/mutationQuery.types.js";

export class UpdateQuery<TModel extends MutationModel> extends Query<TModel> {
  private data!: UpdateData<TModel>;

  set(data: UpdateData<TModel>): this {
    this.data = data;
    return this;
  }

  async first(): Promise<Row<TModel>> {
    const [row] = (await this.model.updateManyAndReturn({
      where: this.prismaWhere(),
      data: this.data,
      limit: 1
    })) as Row<TModel>[];

    return row!;
  }

  all(): Promise<Row<TModel>[]> {
    return this.model.updateManyAndReturn({
      where: this.prismaWhere(),
      data: this.data
    }) as Promise<Row<TModel>[]>;
  }

  async execute(): Promise<number> {
    const result = await this.model.updateMany({
      where: this.prismaWhere(),
      data: this.data
    });

    return result.count;
  }
}
