import {hotkeyCompare, normalizeHotkey} from '../dist/index.js'

describe('normalizeHotkey', () => {
  it('should exist', () => {
    assert.isDefined(normalizeHotkey)
  })

  const tests = [
    ['Control+a', 'Mod+a'],
    ['Meta+a', 'Mod+a'],
    ['Control+A', 'Mod+A'],
    ['Control+Shift+A', 'Mod+A'],
    ['Meta+Shift+a', 'Mod+A'],
    ['Mod+Shift+a', 'Mod+A'],
    ['Mod+A', 'Mod+A'],
    ['Meta+Shift+9', 'Mod+9'],
    ['Meta+Shift+Space', 'Mod+Shift+Space']
  ]

  for (const [hotkey, expected] of tests) {
    it(`given ${hotkey}, returns ${expected}`, function (done) {
      assert.equal(normalizeHotkey(hotkey), expected)
      done()
    })
  }
})

describe('hotkeyCompare', () => {
  it('should exist', () => {
    assert.isDefined(hotkeyCompare)
  })

  const tests = [
    [true, 'a', 'a'],
    [false, 'a', 'b'],
    [true, 'Control+a', 'Mod+a'],
    [true, 'Meta+a', 'Mod+a'],
    [true, 'Control+A', 'Mod+A'],
    [true, 'Control+A', 'Mod+Shift+a'],
    [true, 'Meta+Shift+a', 'Mod+A'],
    [true, 'Meta+Shift+a', 'Mod+Shift+a']
  ]

  for (const [expected, hotkeyA, hotkeyB] of tests) {
    it(`returns ${expected} when comparing ${hotkeyA} and ${hotkeyB}`, function (done) {
      assert.equal(hotkeyCompare(hotkeyA, hotkeyB), expected)
      done()
    })
  }
})
