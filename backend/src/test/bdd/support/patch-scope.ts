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
