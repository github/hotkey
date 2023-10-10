/**
 * Normalizes a hotkey string before comparing it to the serialized event
 * string produced by `eventToHotkeyString`.
 * - Replaces the `Mod` modifier with `Meta` on mac, `Control` on other
 *   platforms.
 * - Ensures modifiers are sorted in a consistent order
 * @param hotkey a hotkey string
 * @param platform NOTE: this param is only intended to be used to mock `navigator.platform` in tests
 * @returns {string} normalized representation of the given hotkey string
 */
export function normalizeHotkey(hotkey: string, platform?: string | undefined): string {
  let result: string
  result = localizeMod(hotkey, platform)
  result = sortModifiers(result)
  return result
}

const matchApplePlatform = /Mac|iPod|iPhone|iPad/i

function localizeMod(hotkey: string, platform: string = navigator.platform): string {
  const localModifier = matchApplePlatform.test(platform) ? 'Meta' : 'Control'
  return hotkey.replace('Mod', localModifier)
}

function sortModifiers(hotkey: string): string {
  const key = hotkey.split('+').pop()
  const modifiers = []
  for (const modifier of ['Control', 'Alt', 'Meta', 'Shift']) {
    if (hotkey.includes(modifier)) {
      modifiers.push(modifier)
    }
  }
  modifiers.push(key)
  return modifiers.join('+')
}
