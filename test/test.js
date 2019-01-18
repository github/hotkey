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
      hotkey.install(button)
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

  it('triggers buttons that have `data-hotkey` as a attribute', function() {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
    assert.include(buttonsClicked, 'button1')
  })

  it("doesn't trigger buttons that don't have `data-hotkey` as a attribute", function() {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
    assert.notInclude(buttonsClicked, 'button2')
  })

  it("doesn't trigger when user is focused on a form field", function() {
    document.getElementById('textfield').dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
    assert.deepEqual(buttonsClicked, [])
  })

  it('handles multiple keys in a hotkey combination', function() {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b', ctrlKey: true}))
    assert.include(buttonsClicked, 'button3')
  })
})
