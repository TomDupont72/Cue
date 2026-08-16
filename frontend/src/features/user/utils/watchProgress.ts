export function getWatchProgress(watched: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (watched / total) * 100));
}
