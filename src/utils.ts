export function isFormField(element: Node): boolean {
  if (!(element instanceof HTMLElement)) {
    return false
  }

  const name = element.nodeName.toLowerCase()
  const type = (element.getAttribute('type') || '').toLowerCase()
  return (
    name === 'select' ||
    name === 'textarea' ||
    (name === 'input' && type !== 'submit' && type !== 'reset' && type !== 'checkbox' && type !== 'radio') ||
    element.isContentEditable
  )
}

export function fireDeterminedAction(el: HTMLElement, path: string[]): void {
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
  return hotkey.split(',').map(edge => edge.replace('Comma', ',').split(' '))
}
