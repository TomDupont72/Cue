let sessionGeneration = 0;

export function getSessionGeneration(): number {
  return sessionGeneration;
}

export function isCurrentSessionGeneration(generation: number): boolean {
  return generation === sessionGeneration;
}

export function invalidateSessionGeneration(): void {
  sessionGeneration += 1;
}
