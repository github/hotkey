export function hotkeyCompare(hotkeyA: string, hotkeyB: string): boolean {
  const a = normalizeHotkey(hotkeyA)
  const b = normalizeHotkey(hotkeyB)
  return a === b
}

export function normalizeHotkey(hotkey: string): string {
  const upper = hotkey.replace(/(.*)Shift\+(\w)$/, (m, rest, key) => `${rest}${key.toUpperCase()}`)
  return upper.replace(/Control|Meta/, 'Mod')
}
