/* @flow strict */

export function isFormField(element: Node): boolean {
  if (!(element instanceof HTMLElement)) {
    return false
  }

  const name = element.nodeName.toLowerCase()
  const type = (element.getAttribute('type') || '').toLowerCase()
  return (
    name === 'select' ||
    name === 'textarea' ||
    (name === 'input' && type !== 'submit' && type !== 'reset') ||
    element.isContentEditable
  )
}

export function fireDeterminedAction(el: HTMLElement): void {
  if (isFormField(el)) {
    el.focus()
  } else if ((el instanceof HTMLAnchorElement && el.href) || el.tagName === 'BUTTON' || el.tagName === 'SUMMARY') {
    el.click()
  }
}

export function expandHotkeyToEdges(hotkey: string): string[][] {
  return hotkey.split(',').map(edge => edge.split(' '))
}
