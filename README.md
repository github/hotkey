# Hotkey Behavior

```html
<button data-hotkey="Shift+?">Show help dialog</button>
```

Trigger an action on a target element when a key, or sequence of keys, is pressed
on the keyboard. This triggers a focus event on form fields, or a click event on
other elements.

By default, hotkeys are extracted from a target element's `data-hotkey`
attribute, but this can be overridden by passing the hotkey to the registering
function (`install`) as a parameter.
## Installation

```
$ npm install @github/hotkey
```

## Usage
### HTML

``` html
<a href="/page/2" data-hotkey="j">Next</a>
<a href="/help" data-hotkey="Control+h">Help</a>
<a href="/rails/rails" data-hotkey="g c">Code</a>
<a href="/search" data-hotkey="s,/">Search</a>
```

See [the list of `KeyboardEvent` key values](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values) for a list of supported key values.

### JS

```js
import {install} from '@github/hotkey'

// Install all the hotkeys on the page
for (const el of document.querySelectorAll('[data-hotkey]')) {
  install(el)
}
```

Alternatively, the hotkey(s) can be passed to the `install` function as a parameter e.g.:

```js
for (const el of document.querySelectorAll('[data-shortcut]')) {
  install(el, el.dataset.shortcut)
}
```

To unregister a hotkey from an element, use `uninstall`:

```js
import {uninstall} from '@github/hotkey'

for (const el of document.querySelectorAll('[data-hotkey]')) {
  uninstall(el)
}
```

## Hotkey string format

1. Hotkey matches against the `event.key`, and uses standard W3C key names for keys and modifiers as documented in [UI Events KeyboardEvent key Values](https://www.w3.org/TR/uievents-key/).
2. At minimum a hotkey string must specify one bare key.
3. Multiple hotkeys (aliases) are separated by a `,`. For example the hotkey `a,b` would activate if the user typed `a` or `b`.
4. Multiple keys separated by a blank space represent a key sequence. For example the hotkey `g n` would activate when a user types the `g` key followed by the `n` key.
5. Modifier key combos are separated with a `+` and are prepended to a key in a consistent order as follows: `Control+Alt+Meta+Shift+KEY`.

### Example

The following hotkey would match if the user typed the key sequence `a` and then `b`, OR if the user held down the `Control`, `Alt` and `/` keys at the same time.

```js
"a b,Control+Alt+/"
```

🔬 **Hotkey Mapper** is a tool to help you determine the correct hotkey string for your key combination: https://github.github.io/hotkey/examples/hotkey_mapper.html

#### Key-sequence considerations

Two-key-sequences such as `g c` and `g i` are stored
under the 'g' key in a nested object with 'c' and 'i' keys.

```
mappings =
  'c'     : <a href="/rails/rails/issues/new" data-hotkey="c">New Issue</a>
  'g'     :
    'c'   : <a href="/rails/rails" data-hotkey="g c">Code</a>
    'i'   : <a href="/rails/rails/issues" data-hotkey="g i">Issues</a>
```

In this example, both `g c` and `c` could be available as hotkeys on the
same page, but `g c` and `g` can't coexist. If the user presses
`g`, the `c` hotkey will be unavailable for 1500 ms while we
wait for either `g c` or `g i`.

## Accessibility considerations

### Character Key Shortcuts

Please note that adding this functionality to your site can be a drawback for
certain users. Providing a way in your system to disable hotkeys or remap
them makes sure that those users can still use your site (given that it's
accessible to those users).

See ["Understanding Success Criterion 2.1.4: Character Key Shortcuts"](https://www.w3.org/WAI/WCAG21/Understanding/character-key-shortcuts.html)
for further reading on this topic.

### Interactive Elements

Wherever possible, hotkeys should be add to [interactive and focusable elements](https://html.spec.whatwg.org/#interactive-content). If a static element must be used, please follow the guideline in ["Adding keyboard-accessible actions to static HTML elements"](https://www.w3.org/WAI/WCAG21/Techniques/client-side-script/SCR29.html).

## Development

```
npm install
npm test
```

## License

Distributed under the MIT license. See LICENSE for details.
