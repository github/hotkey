/* global hotkey */

function key(key, target) {
  if (target == null) {
    target = document.body
  }
  target.dispatchEvent(new KeyboardEvent('keydown', {key}))
}

async function wait(ms) {
  return new Promise(function(resolve) {
    return setTimeout(resolve, ms)
  })
}

describe('hotkey helper', function() {
  it('keydown with uppercase letter', function(done) {
    document.body.addEventListener('keydown', function handler(event) {
      assert.equal(hotkey.eventToHotkeyString(event), 'J')
      document.body.removeEventListener('keydown', handler)
      done()
    })
    key('J')
  })

  it('keydown with number', function(done) {
    document.body.addEventListener('keydown', function handler(event) {
      assert.equal(hotkey.eventToHotkeyString(event), '1')
      document.body.removeEventListener('keydown', handler)
      done()
    })
    key('1')
  })
})

// Simulate entering a series of keys with `delay` milliseconds in between
// keystrokes.
async function keySequence(keys, delay = 10) {
  for (const nextKey of keys.split(' ')) {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: nextKey}))
    await wait(delay)
  }
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

  describe('hotkey sequence support', function() {
    it('supports sequences of 2 keys', async function() {
      setHTML('<a id="link2" href="#" data-hotkey="b c"></a>')
      await keySequence('b c')
      assert.deepEqual(activated, ['link2'])
    })

    it('finds the longest sequence of keys which maps to something', async function() {
      setHTML('<a id="link2" href="#" data-hotkey="b c"></a>')
      await keySequence('z b c')
      assert.deepEqual(activated, ['link2'])
    })

    it('supports sequences of 3 keys', async function() {
      setHTML('<a id="link3" href="#" data-hotkey="d e f"></a>')
      await keySequence('d e f')
      assert.deepEqual(activated, ['link3'])
    })

    it('only exact hotkey sequence matches', async function() {
      setHTML('<a id="exact" href="#" data-hotkey="j k"></a>')
      await keySequence('j z k')
      assert.deepEqual(activated, [])
    })
  })

  describe('misc', function() {
    it('sequences time out after 1500 ms', async function() {
      setHTML(`
      <a href="#" id="create1" data-hotkey="h i"></a>
      <a href="#" id="create2" data-hotkey="i"></a>
        `)

      keySequence('h')
      await wait(1550)
      keySequence('i')
      assert.deepEqual(activated, ['create2'])
    })

    it('multiple hotkeys for the same element', async function() {
      setHTML('<a href="#" id="multiple" data-hotkey="l,m n"></a>')

      await keySequence('l')
      assert.deepEqual(activated, ['multiple'])
      await keySequence('m n')
      assert.deepEqual(activated, ['multiple', 'multiple'])
    })

    it('with duplicate hotkeys, last element registered wins', async function() {
      setHTML(`
      <a href="#" id="duplicate1" data-hotkey="c"></a>
      <a href="#" id="duplicate2" data-hotkey="c"></a>
        `)

      await keySequence('c')
      assert.deepEqual(activated, ['duplicate2'])
    })
  })
})
