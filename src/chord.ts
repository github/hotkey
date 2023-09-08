interface ChordTrackerOptions {
  onReset?: () => void
}

export default class ChordTracker {
  static readonly CHORD_TIMEOUT = 1500

  #path: readonly string[] = []
  #timer: number | null = null
  #onReset

  constructor({onReset}: ChordTrackerOptions) {
    this.#onReset = onReset
  }

  get path(): readonly string[] {
    return this.#path
  }

  registerKeypress(hotkey: string): void {
    this.#path = [...this.#path, hotkey]
    this.startTimer()
  }

  reset(): void {
    this.killTimer()
    this.#path = []
    this.#onReset?.()
  }

  private killTimer(): void {
    if (this.#timer != null) {
      window.clearTimeout(this.#timer)
    }
    this.#timer = null
  }

  private startTimer(): void {
    this.killTimer()
    this.#timer = window.setTimeout(() => this.reset(), ChordTracker.CHORD_TIMEOUT)
  }
}
