import {normalizeHotkey} from '../dist/index.js'

describe('normalizeHotkey', () => {
  it('should exist', () => {
    assert.isDefined(normalizeHotkey)
  })

  const tests = [
    // Base case control tests
    ['a', 'a'],
    ['Control+a', 'Control+a'],
    ['Meta+a', 'Meta+a'],
    ['Control+Meta+a', 'Control+Meta+a'],
    // Mod should be localized based on platform
    ['Mod+a', 'Control+a', 'win'],
    ['Mod+a', 'Meta+a', 'mac'],
    ['Mod+A', 'Control+A', 'win'],
    ['Mod+A', 'Meta+A', 'mac'], // TODO: on a mac upper-case keys are lowercased when Meta is pressed
    ['Mod+9', 'Control+9', 'win'],
    ['Mod+9', 'Meta+9', 'mac'],
    ['Mod+)', 'Control+)', 'win'],
    ['Mod+)', 'Meta+)', 'mac'], // TODO: on a mac upper-case keys are lowercased when Meta is pressed
    ['Mod+Alt+a', 'Control+Alt+a', 'win'],
    ['Mod+Alt+a', 'Alt+Meta+a', 'mac'],
    // Modifier sorting
    ['Shift+Alt+Meta+Control+m', 'Control+Alt+Meta+Shift+m'],
    ['Shift+Alt+Mod+m', 'Control+Alt+Shift+m', 'win']
  ]

  for (const [input, expected, platform = 'any platform'] of tests) {
    it(`given "${input}", returns "${expected}" on ${platform}`, function (done) {
      assert.equal(normalizeHotkey(input, platform), expected)
      done()
    })
  }
})
