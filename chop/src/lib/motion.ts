export async function waitForMotion(duration: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  await new Promise<void>((resolve) => window.setTimeout(resolve, duration));
}
