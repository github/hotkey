# Hotkey Behavior

```html
<button data-hotkey="Shift+?">Show help dialog</button>
```

Trigger an action on a target element when a key or sequence of keys is pressed
on the keyboard. This triggers a focus event on form fields, or a click event on
others.

By default, hotkeys are extracted from a target element's `data-hotkey`
attribute, but this can be overridden by passing the hotkey to the registering
function (`install`) as a parameter.

Multiple hotkeys are separated by a `,`; key combinations are separated
by a `+`; and key sequences are separated by a space.

Two-keypress sequences such as `g c` and `g i` are stored
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

## Development

```
npm install
npm test
```

## License

Distributed under the MIT license. See LICENSE for details.
