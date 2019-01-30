/* global hotkey */

let elementsActivated = []
function clickHandler(event) {
  elementsActivated.push(event.target.id)
}

const setHTML = html => {
  document.body.innerHTML = html

  for (const element of document.querySelectorAll('[data-hotkey]')) {
    hotkey.install(element)
  }
}

describe('hotkey', function() {
  beforeEach(function() {
    document.addEventListener('click', clickHandler)
  })

  afterEach(function() {
    document.removeEventListener('click', clickHandler)
    for (const element of document.querySelectorAll('[data-hotkey]')) {
      hotkey.uninstall(element)
    }
    document.body.innerHTML = ''
    elementsActivated = []
  })

  describe('single key support', function() {
    it('triggers buttons that have a `data-hotkey` attribute', function() {
      setHTML('<button id="button1" data-hotkey="b">Button 1</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
      assert.include(elementsActivated, 'button1')
    })

    it('triggers buttons that have a `data-hotkey` attribute which is overriden by a hotkey parameter', function() {
      setHTML('<button id="button3" data-hotkey="Control+b">Button 3</button>')
      hotkey.install(document.getElementById('button3'), 'Control+c')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c', ctrlKey: true}))
      assert.include(elementsActivated, 'button3')
    })

    it("doesn't trigger buttons that don't have a `data-hotkey` attribute", function() {
      setHTML('<button id="button2">Button 2</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
      assert.notInclude(elementsActivated, 'button2')
    })

    it("doesn't respond to the hotkey in a button's overriden `data-hotkey` attribute", function() {
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b', ctrlKey: true}))
      assert.notInclude(elementsActivated, 'button3')
    })

    it("doesn't trigger when user is focused on a form field", function() {
      setHTML(`
      <button id="button1" data-hotkey="b">Button 1</button>
      <input id="textfield" />`)
      document.getElementById('textfield').dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
      assert.deepEqual(elementsActivated, [])
    })

    it('handles multiple keys in a hotkey combination', function() {
      setHTML('<button id="button3" data-hotkey="Control+c">Button 3</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c', ctrlKey: true}))
      assert.include(elementsActivated, 'button3')
    })

    it("doesn't trigger elements whose hotkey has been removed", function() {
      setHTML('<button id="button1" data-hotkey="b">Button 1</button>')
      hotkey.uninstall(document.querySelector('#button1'))
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
      assert.deepEqual(elementsActivated, [])
    })
  })
})
