/**
 * 1. Replaces the `Mod` modifier with `Meta` on mac, `Control` on other platforms
 * 2. Normalizes upper-case keys to `Shift+<key.toLowerCase()>. Eg. "A" becomes "Shift+a"
 * @param hotkey a hotkey string
 * @param platform NOTE: this param is only intended to be used to mock navigator.platform in tests
 * @returns {string} normalized representation of the given hotkey
 */
export function normalizeHotkey(hotkey: string, platform: string = navigator.platform): string {
  const modKey = matchApplePlatform.test(platform) ? 'Meta' : 'Control'
  hotkey = hotkey.replace('Mod', modKey)
  return hotkey
}

const matchApplePlatform = /Mac|iPod|iPhone|iPad/i
