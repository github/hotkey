export function hotkeyCompare(hotkeyA: string, hotkeyB: string): boolean {
  const a = normalizeHotkey(hotkeyA)
  const b = normalizeHotkey(hotkeyB)
  return a === b
}

export function normalizeHotkey(hotkey: string): string {
  const replaceShiftWithUpperChar = hotkey.replace(regexShiftAndChar, replaceMatchShiftAndChar)
  return replaceShiftWithUpperChar.replace(regexModifiers, 'Mod')
}

const regexModifiers = /Control|Meta/

const regexShiftAndChar = /(.*)Shift\+(\w)$/

function replaceMatchShiftAndChar(_match: string, rest: string, key: string): string {
  return `${rest}${key.toUpperCase()}`
}
