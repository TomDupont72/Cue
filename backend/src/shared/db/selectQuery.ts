import { Query } from "@/shared/db/query.js";
import { notFound } from "../errors/errors.helpers.js";
import { Add, Rename, Result } from "@/shared/db/types/selectQuery.types.js";
import { Field, PrismaModel, Row } from "@/shared/db/types/query.types.js";
import { ERROR_MESSAGE } from "@/shared/db/constants/errorMessage.js";

export class SelectQuery<TModel extends PrismaModel, TResult = never> extends Query<TModel> {
  private selection?: Record<string, true>;
  private aliases: Record<string, string> = {};
  private error?: keyof typeof ERROR_MESSAGE;

  constructor(model: TModel) {
    super(model);
  }

  private asResult<T>(): SelectQuery<TModel, T> {
    return this as unknown as SelectQuery<TModel, T>;
  }

  select<K extends Field<TModel>>(
    ...fields: K[]
  ): SelectQuery<TModel, Add<TResult, Pick<Row<TModel>, K>>> {
    const currentSelection = Object.fromEntries(fields.map((field) => [field, true] as const));

    this.selection = {
      ...this.selection,
      ...currentSelection
    };

    return this.asResult< Add<TResult, Pick<Row<TModel>, K>>>();
  }

  selectAs<const TMap extends Partial<Record<Field<TModel>, string>>>(
    aliases: TMap
  ): SelectQuery<TModel, Add<TResult, Rename<Row<TModel>, TMap>>> {
    const currentSelection: Record<string, true> = {};

    for (const [field, alias] of Object.entries(aliases)) {
      if (typeof alias !== "string") {
        continue;
      }

      currentSelection[field] = true;
      this.aliases[field] = alias;
    }

    this.selection = {
      ...this.selection,
      ...currentSelection
    };

    return this.asResult<Add<TResult, Rename<Row<TModel>, TMap>>>();
  }

  selectAll(): SelectQuery<TModel> {
    this.selection = undefined;
    this.aliases = {};

    return this.asResult<never>();
  }

  emptyThrow(error: keyof typeof ERROR_MESSAGE) {
    this.error = error;
    return this;
  }

  async all(): Promise<Result<TModel, TResult>[]> {
    const rows = await this.model.findMany({
      where: {
        AND: this.conditions
      },
      select: this.selection
    });

    if (this.error !== undefined && rows.length === 0) {
      throw notFound(this.error, ERROR_MESSAGE[this.error]);
    }

    return rows.map((row: Record<string, unknown>) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [this.aliases[key] ?? key, value])
      )
    ) as Result<TModel, TResult>[];
  }

  async first(): Promise<Result<TModel, TResult>> {
    const row = await this.model.findFirst({
      where: {
        AND: this.conditions
      },
      select: this.selection
    });

    if (this.error !== undefined && row === null) {
      throw notFound(this.error, ERROR_MESSAGE[this.error]);
    }

    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => [this.aliases[key] ?? key, value])
    ) as Result<TModel, TResult>;
  }
}
