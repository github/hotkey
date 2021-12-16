// # Returns a hotkey character string for keydown and keyup events.
//
// A full list of key names can be found here:
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
//
// ## Code Example
//
// ```
//   document.addEventListener('keydown', function(event) {
//     if (hotkey(event) === 'h') ...
//   })
// ```
// ## Hotkey examples
//
// "s"                  // Lowercase character for single letters
// "S"                  // Uppercase character for shift plus a letter
// "1"                  // Number character
// "?"                  // Shift plus "/" symbol
//
// "Enter"              // Enter key
// "ArrowUp"            // Up arrow
//
// "Control+s"          // Control modifier plus letter
// "Control+Alt+Delete" // Multiple modifiers
//
// Returns key character String or null.
export default function hotkey(event: KeyboardEvent): string {
  const {ctrlKey, altKey, metaKey, key} = event
  const hotkeyString: string[] = []
  const modifiers: boolean[] = [ctrlKey, altKey, metaKey, showShift(event)]

  for (const [i, mod] of modifiers.entries()) {
    if (mod) hotkeyString.push(modifierKeyNames[i])
  }

  if (!modifierKeyNames.includes(key)) {
    hotkeyString.push(key)
  }

  return hotkeyString.join('+')
}

const modifierKeyNames: string[] = [`Control`, 'Alt', 'Meta', 'Shift']

// We don't want to show `Shift` when `event.key` is capital
function showShift(event: KeyboardEvent): boolean {
  const {shiftKey, code, key} = event
  return shiftKey && !(code.startsWith('Key') && key.toUpperCase() === key)
}
