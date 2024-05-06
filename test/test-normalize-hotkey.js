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
    ['Mod+a', 'Control+a', 'win / linux'],
    ['Mod+a', 'Meta+a', 'mac'],
    ['Mod+a', 'Meta+a', 'iPod'],
    ['Mod+a', 'Meta+a', 'iPhone'],
    ['Mod+a', 'Meta+a', 'iPad'],
    ['Mod+A', 'Control+A', 'win / linux'],
    ['Mod+A', 'Meta+A', 'mac'], // TODO: on a mac upper-case keys are lowercased when Meta is pressed
    ['Mod+9', 'Control+9', 'win / linux'],
    ['Mod+9', 'Meta+9', 'mac'],
    ['Mod+)', 'Control+)', 'win / linux'],
    ['Mod+)', 'Meta+)', 'mac'], // TODO: on a mac upper-case keys are lowercased when Meta is pressed
    ['Mod+Alt+a', 'Control+Alt+a', 'win / linux'],
    ['Mod+Alt+a', 'Alt+Meta+a', 'mac'],
    // undefined platform doesn't localize and falls back to windows (SSR)
    ["Mod+a", "Control+a", undefined],
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
