import {describe, it, expect, beforeEach, afterEach} from 'vitest'
import {install, uninstall, eventToHotkeyString} from '../src/index.ts'

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
      expect(elementsActivated).toContain('button1')
    })

    it('triggers buttons that get hotkey passed in as second argument', function () {
      setHTML('<button id="button-without-a-attribute">Button 3</button>')
      install(document.getElementById('button-without-a-attribute'), 'Control+c')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c', ctrlKey: true}))
      expect(elementsActivated).toContain('button-without-a-attribute')
    })

    it("doesn't trigger buttons that don't have a `data-hotkey` attribute", function () {
      setHTML('<button id="button2">Button 2</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))
      expect(elementsActivated).not.toContain('button2')
    })

    it("doesn't respond to the hotkey in a button's overridden `data-hotkey` attribute", function () {
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b', ctrlKey: true}))
      expect(elementsActivated).not.toContain('button3')
    })

    it("doesn't trigger when user is focused on a input or textfield", function () {
      setHTML(`
      <button id="button1" data-hotkey="b">Button 1</button>
      <input id="textfield" />`)
      document.getElementById('textfield').dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: 'b'}))
      expect(elementsActivated).toEqual([])
    })

    it('triggers when user is focused on a file input', function () {
      setHTML(`
      <button id="button1" data-hotkey="b">Button 1</button>
      <input id="filefield" type="file" />`)
      document.getElementById('filefield').dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: 'b'}))
      expect(elementsActivated).toEqual(['button1'])
    })

    it('handles multiple keys in a hotkey combination', function () {
      setHTML('<button id="button3" data-hotkey="Control+c">Button 3</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c', ctrlKey: true}))
      expect(elementsActivated).toContain('button3')
    })

    it("doesn't trigger elements whose hotkey has been removed", function () {
      setHTML('<button id="button1" data-hotkey="b">Button 1</button>')
      uninstall(document.querySelector('#button1'))
      document.dispatchEvent(new KeyboardEvent('keydown', {code: 'KeyB', key: 'b'}))
      expect(elementsActivated).toEqual([])
    })

    it('triggers elements with capitalised key', function () {
      setHTML('<button id="button1" data-hotkey="Shift+B">Button 1</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {shiftKey: true, code: 'KeyB', key: 'B'}))
      expect(elementsActivated).toContain('button1')
    })

    it('dispatches an event on the element once fired', function () {
      setHTML('<button id="button1" data-hotkey="Shift+B">Button 1</button>')
      let fired = false
      document.querySelector('#button1').addEventListener('hotkey-fire', event => {
        fired = true
        expect(event.detail.path).toEqual(['Shift+B'])
        expect(event.cancelable).toBe(true)
      })
      document.dispatchEvent(new KeyboardEvent('keydown', {shiftKey: true, code: 'KeyB', key: 'B'}))
      expect(fired).toBeTruthy()
    })

    it('wont trigger action if the hotkey-fire event is cancelled', function () {
      setHTML('<button id="button1" data-hotkey="Shift+B">Button 1</button>')
      document.querySelector('#button1').addEventListener('hotkey-fire', event => event.preventDefault())
      document.dispatchEvent(new KeyboardEvent('keydown', {shiftKey: true, code: 'KeyB', key: 'B'}))
      expect(elementsActivated).not.toContain('button1')
    })

    it('supports comma as a hotkey', function () {
      setHTML('<button id="button1" data-hotkey=",">Button 1</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: ','}))
      expect(elementsActivated).toContain('button1')
    })

    it('supports comma + modifier as a hotkey', function () {
      setHTML('<button id="button1" data-hotkey="Meta+,">Button 1</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {metaKey: true, key: ','}))
      expect(elementsActivated).toContain('button1')
    })

    it('multiple comma aliases', function () {
      setHTML('<button id="button1" data-hotkey="x,,,y">Button 1</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: ','}))
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'x'}))
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'y'}))
      expect(elementsActivated.length).toBe(3)
    })

    it('complex comma parsing', async function () {
      setHTML('<button id="button1" data-hotkey=", a b,c">Button 1</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c'}))
      await keySequence(', a b')
      expect(elementsActivated.length).toBe(2)
    })

    it('complex comma parsing II', async function () {
      setHTML('<button id="button1" data-hotkey="a , b,c,,">Button 1</button>')
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'c'}))
      document.dispatchEvent(new KeyboardEvent('keydown', {key: ','}))
      await keySequence('a , b')
      expect(elementsActivated.length).toBe(3)
    })

    it('complex comma parsing II', async function () {
      setHTML('<button id="button1" data-hotkey=", , , ,">Button 1</button>')
      await keySequence(', , , ,')
      expect(elementsActivated).toContain('button1')
    })

    it('complex comma parsing II', async function () {
      setHTML('<button id="button1" data-hotkey="Control+x, , ,">Button 1</button>')
      await keySequence(', ,')
      document.dispatchEvent(new KeyboardEvent('keydown', {ctrlKey: true, key: 'x'}))
      expect(elementsActivated.length).toBe(2)
    })
  })

  describe('data-hotkey-scope', function () {
    it('allows hotkey action from form field', function () {
      setHTML(`
      <button id="button1" data-hotkey-scope="textfield" data-hotkey="Meta+b">Button 1</button>
      <input id="textfield" />`)
      document
        .getElementById('textfield')
        .dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, metaKey: true, cancelable: true, key: 'b'}))
      expect(elementsActivated).toContain('button1')
    })

    it('does nothing if `data-hotkey-scope` is set to non-form field', function () {
      setHTML(`
      <button id="button1" data-hotkey-scope="button2" data-hotkey="Meta+b">Button 1</button>
      <button id="button2" />`)
      document
        .getElementById('button2')
        .dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, metaKey: true, cancelable: true, key: 'b'}))
      expect(elementsActivated).toEqual([])
    })

    it('does nothing if `data-hotkey-scope` does not exist', function () {
      setHTML(`
      <button id="button1" data-hotkey-scope="bad-id" data-hotkey="b">Button 1</button>
      <input id="textfield" />`)
      document
        .getElementById('textfield')
        .dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, cancelable: true, key: 'b'}))
      expect(elementsActivated).toEqual([])
    })

    it('identifies and fires correct element for duplicated hotkeys', function () {
      setHTML(`
      <button id="button1" data-hotkey-scope="textfield1" data-hotkey="Meta+b">Button 1</button>
      <input id="textfield1" />
      <button id="button2" data-hotkey-scope="textfield2" data-hotkey="Meta+b">Button 2</button>
      <input id="textfield2" />
      <button id="button3" data-hotkey="Meta+b">Button 2</button>
      `)
      const keyboardEventArgs = {bubbles: true, metaKey: true, cancelable: true, key: 'b'}

      // Scoped hotkeys
      document.getElementById('textfield1').dispatchEvent(new KeyboardEvent('keydown', keyboardEventArgs))
      expect(elementsActivated).toContain('button1')

      document.getElementById('textfield2').dispatchEvent(new KeyboardEvent('keydown', keyboardEventArgs))
      expect(elementsActivated).toContain('button2')

      // Non-scoped hotkey
      document.dispatchEvent(new KeyboardEvent('keydown', keyboardEventArgs))
      expect(elementsActivated).toContain('button3')
    })

    it('dispatches an event on the element once fired', function () {
      setHTML(`
      <button id="button1" data-hotkey-scope="textfield1" data-hotkey="Meta+b">Button 1</button>
      <input id="textfield1" />
      <button id="button2" data-hotkey-scope="textfield2" data-hotkey="Meta+b">Button 2</button>
      <input id="textfield2" />
      <button id="button3" data-hotkey="Meta+b">Button 2</button>
      `)
      let fired = false
      document.querySelector('#button1').addEventListener('hotkey-fire', event => {
        fired = true
        expect(event.detail.path).toEqual(['Meta+b'])
        expect(event.cancelable).toBe(true)
      })
      document
        .getElementById('textfield1')
        .dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, metaKey: true, cancelable: true, key: 'b'}))
      expect(fired).toBeTruthy()
    })

    it('wont trigger action if the hotkey-fire event is cancelled', function () {
      setHTML(`
      <button id="button1" data-hotkey-scope="textfield1" data-hotkey="Meta+b">Button 1</button>
      <input id="textfield1" />
      <button id="button2" data-hotkey-scope="textfield2" data-hotkey="Meta+b">Button 2</button>
      <input id="textfield2" />
      <button id="button3" data-hotkey="Meta+b">Button 2</button>
      `)
      document.querySelector('#button1').addEventListener('hotkey-fire', event => event.preventDefault())
      document
        .getElementById('textfield1')
        .dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, metaKey: true, cancelable: true, key: 'b'}))
      expect(elementsActivated).not.toContain('button1')
    })
  })

  describe('eventToHotkeyString', function () {
    const tests = [
      ['Control+Shift+J', {ctrlKey: true, shiftKey: true, code: 'KeyJ', key: 'J'}],
      ['Control+Shift+j', {ctrlKey: true, shiftKey: true, code: 'KeyJ', key: 'j'}],
      ['Control+j', {ctrlKey: true, code: 'KeyJ', key: 'j'}],
      ['Meta+Shift+p', {key: 'p', metaKey: true, shiftKey: true, code: 'KeyP'}],
      ['Meta+Shift+8', {key: '8', metaKey: true, shiftKey: true, code: 'Digit8'}],
      ['Control+Shift+7', {key: '7', ctrlKey: true, shiftKey: true, code: 'Digit7'}],
      ['Shift+J', {shiftKey: true, code: 'KeyJ', key: 'J'}],
      ['/', {key: '/', code: ''}],
      ['1', {key: '1', code: 'Digit1'}],
      ['Control+Shift+`', {ctrlKey: true, shiftKey: true, key: '`'}],
      ['c', {key: 'c', code: 'KeyC'}],
      ['Shift+S', {key: 'S', shiftKey: true, code: 'KeyS'}],
      ['Shift+!', {key: '!', shiftKey: true, code: 'Digit1'}],
      ['Control+Shift', {ctrlKey: true, shiftKey: true, key: 'Shift'}],
      ['Control+Shift', {ctrlKey: true, shiftKey: true, key: 'Control'}],
      ['Alt+s', {altKey: true, key: 's'}],
      ['Alt+s', {altKey: true, key: 'ß'}, 'mac'],
      ['Alt+Shift+S', {altKey: true, shiftKey: true, key: 'S'}],
      ['Alt+Shift+S', {altKey: true, shiftKey: true, key: 'Í'}, 'mac'],
      ['Alt+ArrowLeft', {altKey: true, key: 'ArrowLeft'}],
      ['Alt+ArrowLeft', {altKey: true, key: 'ArrowLeft'}, 'mac'],
      ['Alt+Shift+ArrowLeft', {altKey: true, shiftKey: true, key: 'ArrowLeft'}],
      ['Alt+Shift+ArrowLeft', {altKey: true, shiftKey: true, key: 'ArrowLeft'}, 'mac'],
      ['Control+Space', {ctrlKey: true, key: ' '}],
      ['Shift+Plus', {shiftKey: true, key: '+'}],
      ['Meta+Shift+X', {metaKey: true, shiftKey: true, key: 'x'}, 'mac'],
      ['Control+Shift+X', {ctrlKey: true, shiftKey: true, key: 'X'}],
      ['Meta+Shift+!', {metaKey: true, shiftKey: true, key: '1'}, 'mac'],
      ['Control+Shift+!', {ctrlKey: true, shiftKey: true, key: '!'}]
    ]
    for (const [expected, keyEvent, platform = 'win / linux'] of tests) {
      it(`${JSON.stringify(keyEvent)} => ${expected}`, () => {
        return new Promise(resolve => {
          document.body.addEventListener('keydown', function handler(event) {
            document.body.removeEventListener('keydown', handler)
            expect(eventToHotkeyString(event, platform)).toBe(expected)
            resolve()
          })
          document.body.dispatchEvent(new KeyboardEvent('keydown', keyEvent))
        })
      })
    }
  })

  describe('hotkey sequence support', function () {
    it('supports sequences of 2 keys', async function () {
      setHTML('<a id="link2" href="#" data-hotkey="b c"></a>')
      await keySequence('b c')
      expect(elementsActivated).toEqual(['link2'])
    })

    it('finds the longest sequence of keys which maps to something', async function () {
      setHTML('<a id="link2" href="#" data-hotkey="b c"></a>')
      await keySequence('z b c')
      expect(elementsActivated).toEqual(['link2'])
    })

    it('supports sequences of 3 keys', async function () {
      setHTML('<a id="link3" href="#" data-hotkey="d e f"></a>')
      await keySequence('d e f')
      expect(elementsActivated).toEqual(['link3'])
    })

    it('only exact hotkey sequence matches', async function () {
      setHTML('<a id="exact" href="#" data-hotkey="j k"></a>')
      await keySequence('j z k')
      expect(elementsActivated).toEqual([])
    })

    it('dispatches an event on the element once fired', async function () {
      setHTML('<a id="link3" href="#" data-hotkey="d e f"></a>')
      let fired = false
      document.querySelector('#link3').addEventListener('hotkey-fire', event => {
        fired = true
        expect(event.detail.path).toEqual(['d', 'e', 'f'])
        expect(event.cancelable).toBe(true)
      })
      await keySequence('d e f')
      expect(fired).toBeTruthy()
    })

    it('supports sequences containing commas', async function () {
      setHTML('<a id="link2" href="#" data-hotkey="b , c"></a>')
      await keySequence('b , c')
      expect(elementsActivated).toEqual(['link2'])
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
      expect(elementsActivated).toEqual(['create2'])
    })

    it('multiple hotkeys for the same element', async function () {
      setHTML('<a href="#" id="multiple" data-hotkey="l,m n"></a>')

      await keySequence('l')
      expect(elementsActivated).toEqual(['multiple'])
      await keySequence('m n')
      expect(elementsActivated).toEqual(['multiple', 'multiple'])
    })

    it('with duplicate hotkeys, last element registered wins', async function () {
      setHTML(`
      <a href="#" id="duplicate1" data-hotkey="c"></a>
      <a href="#" id="duplicate2" data-hotkey="c"></a>
        `)

      await keySequence('c')
      expect(elementsActivated).toEqual(['duplicate2'])
    })

    it('works with macos meta+shift plane', async () => {
      setHTML(`<a href="#" id="metashiftplane" data-hotkey="Meta+Shift+p"></a>`)

      document.dispatchEvent(new KeyboardEvent('keydown', {metaKey: true, shiftKey: true, key: 'p'}))

      await wait(10)

      expect(elementsActivated).toEqual(['metashiftplane'])
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

      expect(didFocus).toBe(true)
      expect(elementsActivated).toEqual([])
    })

    it('will activate checkbox input elements that have a hotkey attribute', async () => {
      setHTML('<input type="checkbox" id="checkbox" data-hotkey="a">')

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}))

      expect(elementsActivated).toEqual(['checkbox'])
    })

    it('will activate radio button input elements that have a hotkey attribute', async () => {
      setHTML('<input type="radio" id="radio" data-hotkey="a">')

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}))

      expect(elementsActivated).toEqual(['radio'])
    })

    it('can click a[href] elements that declare data-hotkey for activation', async () => {
      setHTML('<a id="link" href="#" data-hotkey="a b">')

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}))
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))

      expect(elementsActivated).toEqual(['link'])
    })

    it('can click button elements that declare data-hotkey for activation', async () => {
      setHTML('<button id="button" data-hotkey="a b">')

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}))
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))

      expect(elementsActivated).toEqual(['button'])
    })

    it('can click details summary elements that declare data-hotkey for activation', async () => {
      setHTML('<summary id="summary" data-hotkey="a b">')

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}))
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'b'}))

      expect(elementsActivated).toEqual(['summary'])
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

    expect(registeredAddEventListeners).toEqual(['keydown'])
    expect(registeredRemoveEventListeners).toEqual([])
  })

  it('only one keydown listener is installed', function () {
    document.body.innerHTML = `
      <button id="button1" data-hotkey="a">Button 1</button>
      <button id="button2" data-hotkey="b">Button 2</button>
    `

    for (const el of document.querySelectorAll('[data-hotkey]')) {
      install(el)
    }

    expect(registeredAddEventListeners).toEqual(['keydown'])
    expect(registeredRemoveEventListeners).toEqual([])
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

    expect(registeredAddEventListeners).toEqual(['keydown'])
    expect(registeredRemoveEventListeners).toEqual([])

    uninstall(button1)

    expect(registeredAddEventListeners).toEqual(['keydown'])
    expect(registeredRemoveEventListeners).toEqual([])

    uninstall(button2)

    expect(registeredAddEventListeners).toEqual(['keydown'])
    expect(registeredRemoveEventListeners).toEqual(['keydown'])
  })
})
