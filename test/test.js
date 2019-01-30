/* global hotkey */

let buttonsClicked = []
function buttonClickHandler(event) {
  buttonsClicked.push(event.target.id)
}

describe('hotkey', function() {
  beforeEach(function() {
    document.body.innerHTML = `
      <button id="button1" data-hotkey="b">Button 1</button>
      <button id="button2">Button 2</button>
      <button id="button3" data-hotkey="Control+b">Button 3</button>
      <input id="textfield" />
    `
    for (const button of document.querySelectorAll('button')) {
      button.addEventListener('click', buttonClickHandler)
    }
    for (const button of document.querySelectorAll('[data-hotkey]')) {
      if (button.id === 'button3') {
        hotkey.install(button, 'Control+c')
      } else {
        hotkey.install(button)
      }
    }
  })

  afterEach(function() {
    for (const button of document.querySelectorAll('button')) {
      button.removeEventListener('click', buttonClickHandler)
    }
    for (const button of document.querySelectorAll('[data-hotkey]')) {
      hotkey.uninstall(button)
    }
    document.body.innerHTML = ''
    buttonsClicked = []
  })

  describe('single key support', function() {
    it('triggers buttons that have a `data-hotkey` attribute', function() {
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
      assert.include(buttonsClicked, 'button1')
    })

    it('triggers buttons that have a `data-hotkey` attribute which is overriden by a hotkey parameter', function() {
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c', ctrlKey: true}))
      assert.include(buttonsClicked, 'button3')
    })

    it("doesn't trigger buttons that don't have a `data-hotkey` attribute", function() {
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
      assert.notInclude(buttonsClicked, 'button2')
    })

    it("doesn't respond to the hotkey in a button's overriden `data-hotkey` attribute", function() {
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b', ctrlKey: true}))
      assert.notInclude(buttonsClicked, 'button3')
    })

    it("doesn't trigger when user is focused on a form field", function() {
      document.getElementById('textfield').dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
      assert.deepEqual(buttonsClicked, [])
    })

    it('handles multiple keys in a hotkey combination', function() {
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c', ctrlKey: true}))
      assert.include(buttonsClicked, 'button3')
    })

    it("doesn't trigger elements whose hotkey has been removed", function() {
      hotkey.uninstall(document.querySelector('#button1'))
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
      assert.deepEqual(buttonsClicked, [])
    })
  })
})
