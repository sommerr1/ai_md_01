export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ScrollOptions {
  maxIterations?: number;
  settleMs?: number;
  iterationDelayMs?: number;
  timeoutMs?: number;
}

export interface ScrollResult {
  partial: boolean;
  timedOut: boolean;
  iterations: number;
}

export async function scrollToTopUntilStable(
  scrollRoot: Element,
  options: ScrollOptions = {},
): Promise<ScrollResult> {
  const {
    maxIterations = 50,
    settleMs = 600,
    iterationDelayMs = 400,
    timeoutMs = 30_000,
  } = options;

  const started = performance.now();
  let iterations = 0;
  let lastHeight = scrollRoot.scrollHeight;
  let stablePasses = 0;

  while (iterations < maxIterations && performance.now() - started < timeoutMs) {
    scrollRoot.scrollTop = 0;
    scrollRoot.dispatchEvent(new Event('scroll', { bubbles: true }));

    await sleep(iterationDelayMs);
    iterations += 1;

    const height = scrollRoot.scrollHeight;
    if (height > lastHeight) {
      lastHeight = height;
      stablePasses = 0;
      continue;
    }

    stablePasses += 1;
    if (stablePasses >= 2) {
      await sleep(settleMs);
      if (scrollRoot.scrollHeight <= lastHeight) break;
      lastHeight = scrollRoot.scrollHeight;
      stablePasses = 0;
    }
  }

  const timedOut = performance.now() - started >= timeoutMs;
  return { partial: timedOut, timedOut, iterations };
}
