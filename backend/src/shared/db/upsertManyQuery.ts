import { upsertManyAndFetch } from "@/shared/utils/prisma/prisma.js";
import type { UpsertManyAndFetchOptions } from "@/shared/utils/prisma/prisma.types.js";

export class UpsertManyQuery<
  TInput extends object,
  TUniqueBy extends keyof TInput | readonly (keyof TInput)[],
  TResult
> {
  private data: readonly TInput[] = [];

  constructor(
    private readonly options: Omit<UpsertManyAndFetchOptions<TInput, TUniqueBy, TResult>, "data">
  ) {}

  values(data: readonly TInput[]): this {
    this.data = data;
    return this;
  }

  all(): Promise<TResult[]> {
    return upsertManyAndFetch({ ...this.options, data: this.data });
  }
}
