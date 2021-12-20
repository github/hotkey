export function hotkeyCompare(hotkeyA: string, hotkeyB: string): boolean {
  const a = normalizeHotkey(hotkeyA)
  const b = normalizeHotkey(hotkeyB)
  return a === b
}

/**
 * 1. Replaces the `Mod` modifier with `Meta` on mac, `Control` on other platforms
 * 2. Normalizes upper-case keys to `Shift+<key.toLowerCase()>. Eg. "A" becomes "Shift+a"
 * @param hotkey a hotkey string
 * @param platform NOTE: this param is only intended to be used to mock navigator.platform in tests
 * @returns {string} normalized representation of the given hotkey
 */
export function normalizeHotkey(hotkey: string, platform: string = navigator.platform): string {
  hotkey = hotkey.replace(/([A-Z])$/, (_m, key: string) => `Shift+${key.toLocaleLowerCase()}`)
  hotkey = hotkey.replace(/(Shift\+)+/, 'Shift+')
  const modKey = matchApplePlatform.test(platform) ? 'Meta' : 'Control'
  return hotkey.replace('Mod', modKey)
}

const matchApplePlatform = /Mac|iPod|iPhone|iPad/i
