export default class Scheduler {
  private delayMs: number;
  private timeout: NodeJS.Timeout | null;

  constructor(delayMs: number) {
    this.delayMs = delayMs;
    this.timeout = null;
  }

  public schedule(callback: () => void) {
    this.timeout && clearTimeout(this.timeout);
    this.timeout = setTimeout(callback, this.delayMs);
  }
}
