import { createManyAndFetch } from "@/shared/utils/prisma/prisma.js";
import type { CreateManyAndFetchOptions } from "@/shared/utils/prisma/prisma.types.js";

export class CreateManyAndFetchQuery<
  TInput extends object,
  TSource extends TInput,
  TUniqueBy extends keyof TInput | readonly (keyof TInput)[],
  TResult
> {
  private data: readonly TSource[] = [];

  constructor(
    private readonly options: Omit<
      CreateManyAndFetchOptions<TInput, TSource, TUniqueBy, TResult>,
      "data"
    >
  ) {}

  values(data: readonly TSource[]): this {
    this.data = data;
    return this;
  }

  all(): Promise<TResult[]> {
    return createManyAndFetch({ ...this.options, data: this.data });
  }
}
