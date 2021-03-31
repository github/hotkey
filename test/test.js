import {install, uninstall, eventToHotkeyString} from '../dist/index.js'

let elementsActivated = []
function clickHandler(event) {
  elementsActivated.push(event.target.id)
}

const setHTML = html => {
  document.body.innerHTML = html

  for (const element of document.querySelectorAll('[data-hotkey]')) {
    install(element)
  }
}

async function wait(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms)
  })
}

// Simulate entering a series of keys with `delay` milliseconds in between
// keystrokes.
async function keySequence(keys, delay = 10) {
  for (const nextKey of keys.split(' ')) {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: nextKey}))
    await wait(delay)
  }
}

describe('hotkey', function () {
  beforeEach(function () {
    document.addEventListener('click', clickHandler)
  })

  afterEach(function () {
    document.removeEventListener('click', clickHandler)
    for (const element of document.querySelectorAll('[data-hotkey]')) {
      uninstall(element)
    }
    uninstall(document.getElementById('button-without-a-attribute'))
    document.body.innerHTML = ''
    elementsActivated = []
  })

  describe('single key support', function () {
    it('triggers buttons that have a `data-hotkey` attribute', function () {
      setHTML('<button id="button1" data-hotkey="b">Button 1</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
      assert.include(elementsActivated, 'button1')
    })

    it('triggers buttons that get hotkey passed in as second argument', function () {
      setHTML('<button id="button-without-a-attribute">Button 3</button>')
      install(document.getElementById('button-without-a-attribute'), 'Control+c')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c', ctrlKey: true}))
      assert.include(elementsActivated, 'button-without-a-attribute')
    })

    it("doesn't trigger buttons that don't have a `data-hotkey` attribute", function () {
      setHTML('<button id="button2">Button 2</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
      assert.notInclude(elementsActivated, 'button2')
    })

    it("doesn't respond to the hotkey in a button's overridden `data-hotkey` attribute", function () {
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b', ctrlKey: true}))
      assert.notInclude(elementsActivated, 'button3')
    })

    it("doesn't trigger when user is focused on a input or textfield", function () {
      setHTML(`
      <button id="button1" data-hotkey="b">Button 1</button>
      <input id="textfield" />`)
      document.getElementById('textfield').dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
      assert.deepEqual(elementsActivated, [])
    })

    it('handles multiple keys in a hotkey combination', function () {
      setHTML('<button id="button3" data-hotkey="Control+c">Button 3</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c', ctrlKey: true}))
      assert.include(elementsActivated, 'button3')
    })

    it("doesn't trigger elements whose hotkey has been removed", function () {
      setHTML('<button id="button1" data-hotkey="b">Button 1</button>')
      uninstall(document.querySelector('#button1'))
      document.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyB', key: 'b'}))
      assert.deepEqual(elementsActivated, [])
    })

    it('triggers elements with capitalised key', function () {
      setHTML('<button id="button1" data-hotkey="B">Button 1</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {shiftKey: true, code: 'KeyB', key: 'B'}))
      assert.include(elementsActivated, 'button1')
    })
  })

  describe('eventToHotkeyString', function () {
    const tests = [
      ['Control+J', {ctrlKey: true, shiftKey: true, code: 'KeyJ', key: 'J'}],
      ['Control+Shift+j', {ctrlKey: true, shiftKey: true, code: 'KeyJ', key: 'j'}],
      ['Control+j', {ctrlKey: true, code: 'KeyJ', key: 'j'}],
      ['Meta+Shift+p', {key: 'p', metaKey: true, shiftKey: true, code: 'KeyP'}],
      ['J', {shiftKey: true, code: 'KeyJ', key: 'J'}],
      ['/', {key: '/', code: ''}],
      ['1', {key: '1', code: 'Digit1'}],
      ['Control+Shift+`', {ctrlKey: true, shiftKey: true, key: '`'}],
      ['c', {key: 'c', code: 'KeyC'}],
      ['S', {key: 'S', shiftKey: true, code: 'KeyS'}],
      ['!', {key: '!', shiftKey: true, code: 'KeyS'}]
    ]
    for (const [expected, keyEvent] of tests) {
      it(`${JSON.stringify(keyEvent)} => ${expected}`, function (done) {
        document.body.addEventListener('keydown', function handler(event) {
          document.body.removeEventListener('keydown', handler)
          assert.equal(eventToHotkeyString(event), expected)
          done()
        })
        document.body.dispatchEvent(new KeyboardEvent('keydown', keyEvent))
      })
    }
  })

  describe('hotkey sequence support', function () {
    it('supports sequences of 2 keys', async function () {
      setHTML('<a id="link2" href="#" data-hotkey="b c"></a>')
      await keySequence('b c')
      assert.deepEqual(elementsActivated, ['link2'])
    })

    it('finds the longest sequence of keys which maps to something', async function () {
      setHTML('<a id="link2" href="#" data-hotkey="b c"></a>')
      await keySequence('z b c')
      assert.deepEqual(elementsActivated, ['link2'])
    })

    it('supports sequences of 3 keys', async function () {
      setHTML('<a id="link3" href="#" data-hotkey="d e f"></a>')
      await keySequence('d e f')
      assert.deepEqual(elementsActivated, ['link3'])
    })

    it('only exact hotkey sequence matches', async function () {
      setHTML('<a id="exact" href="#" data-hotkey="j k"></a>')
      await keySequence('j z k')
      assert.deepEqual(elementsActivated, [])
    })
  })

  describe('misc', function () {
    it('sequences time out after 1500 ms', async function () {
      setHTML(`
      <a href="#" id="create1" data-hotkey="h i"></a>
      <a href="#" id="create2" data-hotkey="i"></a>
        `)

      keySequence('h')
      await wait(1550)
      keySequence('i')
      assert.deepEqual(elementsActivated, ['create2'])
    })

    it('multiple hotkeys for the same element', async function () {
      setHTML('<a href="#" id="multiple" data-hotkey="l,m n"></a>')

      await keySequence('l')
      assert.deepEqual(elementsActivated, ['multiple'])
      await keySequence('m n')
      assert.deepEqual(elementsActivated, ['multiple', 'multiple'])
    })

    it('with duplicate hotkeys, last element registered wins', async function () {
      setHTML(`
      <a href="#" id="duplicate1" data-hotkey="c"></a>
      <a href="#" id="duplicate2" data-hotkey="c"></a>
        `)

      await keySequence('c')
      assert.deepEqual(elementsActivated, ['duplicate2'])
    })

    it('works with macos meta+shift plane', async () => {
      setHTML(`<a href="#" id="metashiftplane" data-hotkey="Meta+Shift+p"></a>`)

      document.dispatchEvent(new KeyboardEvent('keydown', {metaKey: true, shiftKey: true, key: 'p'}))

      await wait(10)

      assert.deepEqual(elementsActivated, ['metashiftplane'])
    })
  })

  describe('elements', function () {
    it('can focus form elements that declare data-hotkey for focus', async () => {
      let didFocus = false
      setHTML('<input data-hotkey="a b">')
      document.querySelector('input').focus = function () {
        didFocus = true
      }

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}))
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))

      assert.isTrue(didFocus)
      assert.deepEqual(elementsActivated, [])
    })

    it('will activate checkbox input elements that have a hotkey attribute', async () => {
      setHTML('<input type="checkbox" id="checkbox" data-hotkey="a">')

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}))

      assert.deepEqual(elementsActivated, ['checkbox'])
    })

    it('will activate radio button input elements that have a hotkey attribute', async () => {
      setHTML('<input type="radio" id="radio" data-hotkey="a">')

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}))

      assert.deepEqual(elementsActivated, ['radio'])
    })

    it('can click a[href] elements that declare data-hotkey for activation', async () => {
      setHTML('<a id="link" href="#" data-hotkey="a b">')

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}))
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))

      assert.deepEqual(elementsActivated, ['link'])
    })

    it('can click button elements that declare data-hotkey for activation', async () => {
      setHTML('<button id="button" data-hotkey="a b">')

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}))
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))

      assert.deepEqual(elementsActivated, ['button'])
    })

    it('can click details summary elements that declare data-hotkey for activation', async () => {
      setHTML('<summary id="summary" data-hotkey="a b">')

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}))
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))

      assert.deepEqual(elementsActivated, ['summary'])
    })
  })
})

describe('keydown listener', function () {
  let registeredAddEventListeners = []
  let registeredRemoveEventListeners = []
  const originalAddEventListenerFunction = document.addEventListener
  const originalRemoveEventListenerFunction = document.removeEventListener

  beforeEach(function () {
    function addEventListenerWrapper(eventName, callback) {
      registeredAddEventListeners.push(eventName)
      originalAddEventListenerFunction(eventName, callback)
    }
    document.addEventListener = addEventListenerWrapper

    function removeEventListenerWrapper(eventName, callback) {
      registeredRemoveEventListeners.push(eventName)
      originalRemoveEventListenerFunction(eventName, callback)
    }
    document.removeEventListener = removeEventListenerWrapper
  })

  afterEach(function () {
    document.addEventListener = originalAddEventListenerFunction
    document.removeEventListener = originalRemoveEventListenerFunction
    for (const el of document.querySelectorAll('[data-hotkey]')) {
      uninstall(el)
    }
    registeredAddEventListeners = []
    registeredRemoveEventListeners = []
  })

  it('adds a keydown listener when the first install is called', function () {
    document.body.innerHTML = `
      <button id="button1" data-hotkey="a">Button 1</button>
      <button id="button2" data-hotkey="b">Button 2</button>
    `

    for (const el of document.querySelectorAll('[data-hotkey]')) {
      install(el)
    }

    assert.deepEqual(registeredAddEventListeners, ['keydown'])
    assert.deepEqual(registeredRemoveEventListeners, [])
  })

  it('only one keydown listener is installed', function () {
    document.body.innerHTML = `
      <button id="button1" data-hotkey="a">Button 1</button>
      <button id="button2" data-hotkey="b">Button 2</button>
    `

    for (const el of document.querySelectorAll('[data-hotkey]')) {
      install(el)
    }

    assert.deepEqual(registeredAddEventListeners, ['keydown'])
    assert.deepEqual(registeredRemoveEventListeners, [])
  })

  it('uninstalling the last hotkey removes the keydown handler', function () {
    document.body.innerHTML = `
      <button id="button1" data-hotkey="a">Button 1</button>
      <button id="button2" data-hotkey="b">Button 2</button>
    `

    const button1 = document.querySelector('#button1')
    const button2 = document.querySelector('#button2')

    install(button1)
    install(button2)

    assert.deepEqual(registeredAddEventListeners, ['keydown'])
    assert.deepEqual(registeredRemoveEventListeners, [])

    uninstall(button1)

    assert.deepEqual(registeredAddEventListeners, ['keydown'])
    assert.deepEqual(registeredRemoveEventListeners, [])

    uninstall(button2)

    assert.deepEqual(registeredAddEventListeners, ['keydown'])
    assert.deepEqual(registeredRemoveEventListeners, ['keydown'])
  })
})
