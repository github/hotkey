export function hotkeyCompare(hotkeyA: string, hotkeyB: string): boolean {
  const a = normalizeHotkey(hotkeyA)
  const b = normalizeHotkey(hotkeyB)
  return a === b
}

export function normalizeHotkey(hotkey: string): string {
  const hotkeyShiftReplaced = hotkey.replace(regexShiftAndChar, replaceMatchShiftAndChar)
  if (regexBothModifiers.test(hotkeyShiftReplaced)) return hotkeyShiftReplaced
  return hotkeyShiftReplaced.replace(regexEitherModifier, 'Mod')
}

const regexEitherModifier = /Control|Meta/

const regexBothModifiers = /Control.*Meta/

const regexShiftAndChar = /(.*)Shift\+(\w)$/

function replaceMatchShiftAndChar(_match: string, rest: string, key: string): string {
  return `${rest}${key.toUpperCase()}`
}
