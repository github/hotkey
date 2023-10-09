import {normalizeHotkey} from './hotkey'

export function isFormField(element: Node): boolean {
  if (!(element instanceof HTMLElement)) {
    return false
  }

  const name = element.nodeName.toLowerCase()
  const type = (element.getAttribute('type') || '').toLowerCase()
  return (
    name === 'select' ||
    name === 'textarea' ||
    (name === 'input' &&
      type !== 'submit' &&
      type !== 'reset' &&
      type !== 'checkbox' &&
      type !== 'radio' &&
      type !== 'file') ||
    element.isContentEditable
  )
}

export function fireDeterminedAction(el: HTMLElement, path: readonly string[]): void {
  const delegateEvent = new CustomEvent('hotkey-fire', {cancelable: true, detail: {path}})
  const cancelled = !el.dispatchEvent(delegateEvent)
  if (cancelled) return
  if (isFormField(el)) {
    el.focus()
  } else {
    el.click()
  }
}

export function expandHotkeyToEdges(hotkey: string): string[][] {
  // NOTE: we can't just split by comma, since comma is a valid hotkey character!
  const output = []
  let acc = ['']
  let commaIsSeparator = false
  for (let i = 0; i < hotkey.length; i++) {
    if (commaIsSeparator && hotkey[i] === ',') {
      output.push(acc)
      acc = ['']
      commaIsSeparator = false
      continue
    }

    if (hotkey[i] === ' ') {
      // Spaces are used to separate key sequences, so a following comma is
      // part of the sequence, not a separator.
      acc.push('')
      commaIsSeparator = false
      continue
    } else if (hotkey[i] === '+') {
      // If the current character is a +, a following comma is part of the
      // shortcut and not a separator.
      commaIsSeparator = false
    } else {
      commaIsSeparator = true
    }

    acc[acc.length - 1] += hotkey[i]
  }

  output.push(acc)

  // Remove any empty hotkeys/sequences
  return output.map(h => h.map(k => normalizeHotkey(k)).filter(k => k !== '')).filter(h => h.length > 0)
}
