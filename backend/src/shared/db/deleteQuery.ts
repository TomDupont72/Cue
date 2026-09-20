import { Query } from "@/shared/db/query.js";
import type { MutationModel } from "@/shared/db/types/mutationQuery.types.js";

export class DeleteQuery<TModel extends MutationModel> extends Query<TModel> {
  async execute(): Promise<number> {
    const result = await this.model.deleteMany({
      where: this.prismaWhere()
    });

    return result.count;
  }
}
