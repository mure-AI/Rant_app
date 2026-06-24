export function trackMetric(name: string, value: number, tags: Record<string, string> = {}) {
  console.info("[metric]", name, value, tags);
}
