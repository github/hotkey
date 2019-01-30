function key(key, target) {
  if (target == null) {
    target = document.body
  }
  target.dispatchEvent(new KeyboardEvent('keydown', {key}))
}

describe('hotkey', function() {
  let activated
  const handler = event => {
    event.preventDefault()
    activated.push(event.target.getAttribute('id'))
  }

  const setHTML = html => {
    document.body.innerHTML = html
    for (const link of document.querySelectorAll('[data-hotkey]')) {
      hotkey.install(link)
    }
  }

  beforeEach(function() {
    activated = []
    for (const link of document.querySelectorAll('[data-hotkey]')) {
      hotkey.install(link)
    }
    document.addEventListener('click', handler)
  })

  afterEach(function() {
    document.removeEventListener('click', handler)
    for (const button of document.querySelectorAll('[data-hotkey]')) {
      hotkey.uninstall(button)
    }
    document.body.innerHTML = ''
  })
})
