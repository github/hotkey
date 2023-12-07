import {NormalizedSequenceString} from './sequence.js'
import {macosSymbolLayerKeys} from './macos-symbol-layer.js'
import {macosUppercaseLayerKeys} from './macos-uppercase-layer.js'

const normalizedHotkeyBrand = Symbol('normalizedHotkey')

/**
 * A hotkey string with modifier keys in standard order. Build one with `eventToHotkeyString` or normalize a string via
 * `normalizeHotkey`.
 *
 * A full list of key names can be found here:
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
 *
 * Examples:
 * "s"                  // Lowercase character for single letters
 * "S"                  // Uppercase character for shift plus a letter
 * "1"                  // Number character
 * "?"                  // Shift plus "/" symbol
 * "Enter"              // Enter key
 * "ArrowUp"            // Up arrow
 * "Control+s"          // Control modifier plus letter
 * "Control+Alt+Delete" // Multiple modifiers
 */
export type NormalizedHotkeyString = NormalizedSequenceString & {[normalizedHotkeyBrand]: true}

const syntheticKeyNames: Record<string, string> = {
  ' ': 'Space',
  '+': 'Plus'
}

/**
 * Returns a hotkey character string for keydown and keyup events.
 * @example
 * document.addEventListener('keydown', function(event) {
 *   if (eventToHotkeyString(event) === 'h') ...
 * })
 */
export function eventToHotkeyString(
  event: KeyboardEvent,
  platform: string = navigator.platform
): NormalizedHotkeyString {
  const {ctrlKey, altKey, metaKey, shiftKey, key} = event
  const hotkeyString: string[] = []
  const modifiers: boolean[] = [ctrlKey, altKey, metaKey, shiftKey]

  for (const [i, mod] of modifiers.entries()) {
    if (mod) hotkeyString.push(modifierKeyNames[i])
  }

  if (!modifierKeyNames.includes(key)) {
    // MacOS outputs symbols when `Alt` is held, so we map them back to the key symbol if we can
    const altNormalizedKey =
      hotkeyString.includes('Alt') && matchApplePlatform.test(platform) ? macosSymbolLayerKeys[key] ?? key : key

    // MacOS outputs lowercase characters when `Command+Shift` is held, so we map them back to uppercase if we can
    const shiftNormalizedKey =
      hotkeyString.includes('Shift') && matchApplePlatform.test(platform)
        ? macosUppercaseLayerKeys[altNormalizedKey] ?? altNormalizedKey
        : altNormalizedKey

    // Some symbols can't be used because of hotkey string format, so we replace them with 'synthetic' named keys
    const syntheticKey = syntheticKeyNames[shiftNormalizedKey] ?? shiftNormalizedKey

    hotkeyString.push(syntheticKey)
  }

  return hotkeyString.join('+') as NormalizedHotkeyString
}

const modifierKeyNames: string[] = ['Control', 'Alt', 'Meta', 'Shift']

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
export function normalizeHotkey(hotkey: string, platform?: string | undefined): NormalizedHotkeyString {
  let result: string
  result = localizeMod(hotkey, platform)
  result = sortModifiers(result)
  return result as NormalizedHotkeyString
}

const matchApplePlatform = /Mac|iPod|iPhone|iPad/i

function localizeMod(hotkey: string, platform: string = navigator.platform): string {
  const localModifier = matchApplePlatform.test(platform) ? 'Meta' : 'Control'
  return hotkey.replace('Mod', localModifier)
}

function sortModifiers(hotkey: string): string {
  const key = hotkey.split('+').pop()
  const modifiers: string[] = []
  for (const modifier of ['Control', 'Alt', 'Meta', 'Shift']) {
    if (hotkey.includes(modifier)) {
      modifiers.push(modifier)
    }
  }
  if (key) modifiers.push(key)
  return modifiers.join('+')
}
