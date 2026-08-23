export class PatchScope {
  private restorers: Array<() => void> = [];

  replace(target: object, property: PropertyKey, replacement: unknown) {
    const original = Reflect.get(target, property);

    Reflect.set(target, property, replacement);

    this.restorers.push(() => {
      Reflect.set(target, property, original);
    });
  }

  restore() {
    for (const restore of this.restorers.reverse()) {
      restore();
    }

    this.restorers = [];
  }
}

export function createSpy<TArgs extends unknown[], TResult>(
  implementation: (...args: TArgs) => TResult
) {
  const calls: TArgs[] = [];

  const fn = (...args: TArgs) => {
    calls.push(args);
    return implementation(...args);
  };

  return Object.assign(fn, {
    calls,
    reset() {
      calls.length = 0;
    }
  });
}
