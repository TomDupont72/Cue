import { Query } from "@/shared/db/query.js";
import { notFound } from "../errors/errors.helpers.js";

const ERROR_MESSAGE = {
  SERIES_NOT_FOUND: "Series not found"
};

type FindManyModel<TWhere, TSelect> = {
  findMany(args: { where: { AND: TWhere[] }; select: TSelect | undefined }): Promise<unknown[]>;
};

type Field<TSelect> = keyof TSelect & string;
type SelectArg<TSelect> = Field<TSelect> | Partial<Record<Field<TSelect>, string>>;

export class SelectQuery<
  TModel extends FindManyModel<TWhere, TSelect>,
  TSelect,
  TWhere,
  TRow,
  TResult = TRow
> extends Query<TModel, TWhere> {
  selection: TSelect | undefined;
  private aliases: Record<string, string> = {};

  constructor(model: TModel) {
    super(model);
  }

  select(): SelectQuery<TModel, TSelect, TWhere, TRow, TRow>;
  select(
    first: SelectArg<TSelect>,
    ...rest: SelectArg<TSelect>[]
  ): SelectQuery<TModel, TSelect, TWhere, TRow, Record<string, unknown>>;
  select(...fields: SelectArg<TSelect>[]): SelectQuery<TModel, TSelect, TWhere, TRow, unknown> {
    if (fields.length === 0) {
      this.selection = undefined;
      this.aliases = {};
      return this;
    }

    const selection = { ...this.selection } as Record<string, true>;

    for (const field of fields) {
      if (typeof field === "string") {
        selection[field] = true;
      } else {
        for (const [name, alias] of Object.entries(field)) {
          selection[name] = true;
          if (typeof alias === "string") this.aliases[name] = alias;
        }
      }
    }

    this.selection = selection as TSelect;
    return this;
  }

  selectAll(): SelectQuery<TModel, TSelect, TWhere, TRow, TRow> {
    this.selection = undefined;
    this.aliases = {};
    return this as unknown as SelectQuery<TModel, TSelect, TWhere, TRow, TRow>;
  }

  async all(): Promise<TResult[]> {
    const rows = await this.model.findMany({
      where: { AND: this.conditions },
      select: this.selection
    });

    return rows.map((row) =>
      Object.fromEntries(
        Object.entries(row as Record<string, unknown>).map(([key, value]) => [
          this.aliases[key] ?? key,
          value
        ])
      )
    ) as unknown as TResult[];
  }

  async oneOrThrow(error: keyof typeof ERROR_MESSAGE): Promise<TResult> {
    const rows = await this.all();

    if (rows.length === 0) {
      throw notFound(error, ERROR_MESSAGE[error]);
    }

    return rows[0]!;
  }
}
