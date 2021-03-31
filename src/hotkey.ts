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
  const elideShift = event.code.startsWith('Key') && event.shiftKey && event.key.toUpperCase() === event.key
  return `${event.ctrlKey ? 'Control+' : ''}${event.altKey ? 'Alt+' : ''}${event.metaKey ? 'Meta+' : ''}${
    event.shiftKey && !elideShift ? 'Shift+' : ''
  }${event.key}`
}
