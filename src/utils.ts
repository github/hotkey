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

export function fireDeterminedAction(el: HTMLElement): void {
  if (isFormField(el)) {
    el.focus()
  } else {
    el.click()
  }
}

export function expandHotkeyToEdges(hotkey: string): string[][] {
  return hotkey.split(',').map(edge => edge.split(' '))
}

export function includesModifier(event: KeyboardEvent): boolean {
  return event.altKey || event.ctrlKey || event.metaKey
}
