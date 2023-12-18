# Hotkey Behavior

```html
<button data-hotkey="Shift+?">Show help dialog</button>
```

Trigger an action on a target element when the hotkey (key or sequence of keys) is pressed
on the keyboard. This triggers a focus event on form fields, or a click event on
other elements.

The hotkey can be scoped to a form field:

```html
<button data-hotkey-scope="text-area" data-hotkey="Meta+d" onclick="alert('clicked')">
  press meta+d in text area to click this button
</button>

<textarea id="text-area">text area</textarea>
```

By default, hotkeys are extracted from a target element's `data-hotkey`
attribute, but this can be overridden by passing the hotkey to the registering
function (`install`) as a parameter.

## How is this used on GitHub?

All shortcuts (for example `g i`, `.`, `Meta+k`) within GitHub use hotkey to declare shortcuts in server side templates. This is used on almost every page on GitHub.

## Installation

```
$ npm install @github/hotkey
```

## Usage

### HTML

```html
<!-- Single character hotkey: triggers when "j" is pressed-->
<a href="/page/2" data-hotkey="j">Next</a>
<!-- Multiple hotkey aliases: triggers on both "s" and "/" -->
<a href="/search" data-hotkey="s,/">Search</a>
<!-- Key-sequence hotkey: triggers when "g" is pressed followed by "c"-->
<a href="/rails/rails" data-hotkey="g c">Code</a>
<!-- Hotkey with modifiers: triggers when "Control", "Alt", and "h" are pressed at the same time -->
<a href="/help" data-hotkey="Control+Alt+h">Help</a>
<!-- Special "Mod" modifier localizes to "Meta" on mac, "Control" on Windows or Linux-->
<a href="/settings" data-hotkey="Mod+s">Search</a>
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

By default form elements (such as `input`,`textarea`,`select`) or elements with `contenteditable` will call `focus()` when the hotkey is triggered. All other elements trigger a `click()`. All elements, regardless of type, will emit a cancellable `hotkey-fire` event, so you can customize the behaviour, if you so choose:

```js
for (const el of document.querySelectorAll('[data-shortcut]')) {
  install(el, el.dataset.shortcut)

  if (el.matches('.frobber')) {
    el.addEventListener('hotkey-fire', event => {
      // ensure the default `focus()`/`click()` is prevented:
      event.preventDefault()

      // Use a custom behaviour instead
      frobulateFrobber(event.target)
    })
  }
}
```

## Hotkey string format

1. Hotkey matches against the `event.key`, and uses standard W3C key names for keys and modifiers as documented in [UI Events KeyboardEvent key Values](https://www.w3.org/TR/uievents-key/).
2. At minimum a hotkey string must specify one bare key.
3. Multiple hotkeys (aliases) are separated by a `,`. For example the hotkey `a,b` would activate if the user typed `a` or `b`.
4. Multiple keys separated by a blank space represent a key sequence. For example the hotkey `g n` would activate when a user types the `g` key followed by the `n` key.
5. Modifier key combos are separated with a `+` and are prepended to a key in a consistent order as follows: `"Control+Alt+Meta+Shift+KEY"`.
6. `"Mod"` is a special modifier that localizes to `Meta` on MacOS/iOS, and `Control` on Windows/Linux.
   1. `"Mod+"` can appear in any order in a hotkey string. For example: `"Mod+Alt+Shift+KEY"`
   2. Neither the `Control` or `Meta` modifiers should appear in a hotkey string with `Mod`.
7. `"Plus"` and `"Space"` are special key names to represent the `+` and ` ` keys respectively, because these symbols cannot be represented in the normal hotkey string syntax.
8. You can use the comma key `,` as a hotkey, e.g. `a,,` would activate if the user typed `a` or `,`. `Control+,,x` would activate for `Control+,` or `x`.
9. `"Shift"` should be included if it would be held and the key is uppercase: ie, `Shift+A` not `A`
   1. MacOS outputs lowercase key names when `Meta+Shift` is held (ie, `Meta+Shift+a`). In an attempt to normalize this, `hotkey` will automatically map these key names to uppercase, so the uppercase keys should still be used (ie, `"Meta+Shift+A"` or `"Mod+Shift+A"`). **However**, this normalization only works on US keyboard layouts.

### Example

The following hotkey would match if the user typed the key sequence `a` and then `b`, OR if the user held down the `Control`, `Alt` and `/` keys at the same time.

```js
'a b,Control+Alt+/'
```

🔬 **Hotkey Mapper** is a tool to help you determine the correct hotkey string for your key combination: <https://github.github.io/hotkey/hotkey_mapper.html>

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
