export function hotkeyCompare(hotkeyA: string, hotkeyB: string): boolean {
  const a = normalizeHotkey(hotkeyA)
  const b = normalizeHotkey(hotkeyB)
  return a === b
}

export function normalizeHotkey(hotkey: string): string {
  const hotkeyShiftReplaced = hotkey.replace(matchShiftAndChar, replaceMatchShiftAndChar)
  if (matchBothModifiers.test(hotkeyShiftReplaced)) return hotkeyShiftReplaced
  return hotkeyShiftReplaced.replace(matchEitherModifier, 'Mod')
}

const matchEitherModifier = /Control|Meta/

const matchBothModifiers = /Control.*Meta/

const matchShiftAndChar = /(.*)Shift\+(\w)$/

function replaceMatchShiftAndChar(_match: string, rest: string, key: string): string {
  return `${rest}${key.toUpperCase()}`
}
