import {NormalizedHotkeyString, eventToHotkey, normalizeHotkey} from './hotkey'

interface SequenceTrackerOptions {
  onReset?: () => void
}

export const SEQUENCE_DELIMITER = ' '

const sequenceBrand = Symbol('sequence')

/**
 * Sequence of hotkeys, separated by spaces. For example, `Mod+m g`. Obtain one through the `SequenceTracker` class or
 * by normalizing a string with `normalizeSequence`.
 */
export type NormalizedSequenceString = string & {[sequenceBrand]: true}

export default class SequenceTracker {
  static readonly CHORD_TIMEOUT = 1500

  private _path: readonly NormalizedHotkeyString[] = []
  private timer: number | null = null
  private onReset

  constructor({onReset}: SequenceTrackerOptions = {}) {
    this.onReset = onReset
  }

  get path(): readonly NormalizedHotkeyString[] {
    return this._path
  }

  get sequence(): NormalizedSequenceString {
    return this._path.join(SEQUENCE_DELIMITER) as NormalizedSequenceString
  }

  registerKeypress(event: KeyboardEvent): void {
    this._path = [...this._path, eventToHotkey(event)]
    this.startTimer()
  }

  reset(): void {
    this.killTimer()
    this._path = []
    this.onReset?.()
  }

  private killTimer(): void {
    if (this.timer != null) {
      window.clearTimeout(this.timer)
    }
    this.timer = null
  }

  private startTimer(): void {
    this.killTimer()
    this.timer = window.setTimeout(() => this.reset(), SequenceTracker.CHORD_TIMEOUT)
  }
}

export function normalizeSequence(sequence: string): NormalizedSequenceString {
  return sequence
    .split(SEQUENCE_DELIMITER)
    .map(h => normalizeHotkey(h))
    .join(SEQUENCE_DELIMITER) as NormalizedSequenceString
}
