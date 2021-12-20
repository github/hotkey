import {normalizeHotkey} from '../dist/index.js'

describe('normalizeHotkey', () => {
  it('should exist', () => {
    assert.isDefined(normalizeHotkey)
  })

  const tests = [
    ['A', 'Shift+a'],
    ['Shift+A', 'Shift+a'],
    ['Shift+a', 'Shift+a'],
    ['Shift+[Space]', 'Shift+[Space]'],
    ['Mod+a', 'Control+a', 'win'],
    ['Mod+a', 'Meta+a', 'mac'],
    ['Mod+A', 'Control+Shift+a', 'win'],
    ['Mod+A', 'Meta+Shift+a', 'mac'],
    ['Mod+9', 'Control+9', 'win'],
    ['Mod+9', 'Meta+9', 'mac'],
    ['Mod+Shift+[Space]', 'Control+Shift+[Space]', 'win'],
    ['Mod+Shift+[Space]', 'Meta+Shift+[Space]', 'mac']
  ]

  for (const [input, expected, platform = 'mac'] of tests) {
    it(`given ${input}, returns ${expected} on ${platform}`, function (done) {
      assert.equal(normalizeHotkey(input, platform), expected)
      done()
    })
  }
})
