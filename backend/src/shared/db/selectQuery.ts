import { Query } from "@/shared/db/query.js";
import { notFound } from "../errors/errors.helpers.js";
import { Add, Rename, Result } from "@/shared/db/types/selectQuery.types.js";
import { Field, PrismaModel, Row } from "@/shared/db/types/query.types.js";
import { ERROR_MESSAGE } from "@/shared/db/constants/errorMessage.js";

export class SelectQuery<
  TModel extends PrismaModel,
  TResult = never,
  TThrow extends boolean = false
> extends Query<TModel> {
  private selection?: Record<string, true>;
  private aliases: Record<string, string> = {};
  private emptyThrowError: keyof typeof ERROR_MESSAGE;
  private emptyThrowEnable = false;

  constructor(model: TModel, emptyThrowError: keyof typeof ERROR_MESSAGE) {
    super(model);
    this.emptyThrowError = emptyThrowError;
  }

  private asResult<T>(): SelectQuery<TModel, T, TThrow> {
    return this as unknown as SelectQuery<TModel, T, TThrow>;
  }

  select<K extends Field<TModel>>(
    ...fields: K[]
  ): SelectQuery<TModel, Add<TResult, Pick<Row<TModel>, K>>, TThrow> {
    const currentSelection = Object.fromEntries(fields.map((field) => [field, true] as const));

    this.selection = {
      ...this.selection,
      ...currentSelection
    };

    return this.asResult<Add<TResult, Pick<Row<TModel>, K>>>();
  }

  selectAs<const TMap extends Partial<Record<Field<TModel>, string>>>(
    aliases: TMap
  ): SelectQuery<TModel, Add<TResult, Rename<Row<TModel>, TMap>>, TThrow> {
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

  selectAllAs<const TMap extends Partial<Record<Field<TModel>, string>>>(
    aliases: TMap
  ): SelectQuery<TModel, Omit<Row<TModel>, keyof TMap> & Rename<Row<TModel>, TMap>, TThrow> {
    this.selection = undefined;
    this.aliases = {};

    for (const [field, alias] of Object.entries(aliases)) {
      if (typeof alias === "string") {
        this.aliases[field] = alias;
      }
    }

    return this.asResult<Omit<Row<TModel>, keyof TMap> & Rename<Row<TModel>, TMap>>();
  }

  emptyThrow(): SelectQuery<TModel, TResult, true> {
    this.emptyThrowEnable = true;
    return this as SelectQuery<TModel, TResult, true>;
  }

  async all(): Promise<Result<TModel, TResult>[]> {
    const rows = await this.model.findMany({
      where: {
        AND: this.conditions
      },
      select: this.selection
    });

    if (this.emptyThrowEnable && rows.length === 0) {
      throw notFound(this.emptyThrowError, ERROR_MESSAGE[this.emptyThrowError]);
    }

    return rows.map((row: Record<string, unknown>) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [this.aliases[key] ?? key, value])
      )
    ) as Result<TModel, TResult>[];
  }

  async first(): Promise<
    TThrow extends true ? Result<TModel, TResult> : Result<TModel, TResult> | null
  > {
    const row = await this.model.findFirst({
      where: {
        AND: this.conditions
      },
      select: this.selection
    });

    if (row === null) {
      if (this.emptyThrowEnable) {
        throw notFound(this.emptyThrowError, ERROR_MESSAGE[this.emptyThrowError]);
      }

      return null as TThrow extends true ? Result<TModel, TResult> : Result<TModel, TResult> | null;
    }

    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => [this.aliases[key] ?? key, value])
    ) as TThrow extends true ? Result<TModel, TResult> : Result<TModel, TResult> | null;
  }
}
