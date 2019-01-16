# Hotkey Behavior

Trigger a action on element when keyboard hotkey is pressed.

Automatically binds hotkeys to any link with a `data-hotkey`
attribute set. Multiple hotkeys are separated by a `,`.
Key combinations are separated by a `+`, and key sequences
are separated by a space.

Two-keypress sequences like `g c` and `g i` would be stored
under the 'g' key in a nested object with keys 'c' and 'i'.

mappings =
  'c'     : <a href="/rails/rails/issues/new" data-hotkey="c">New Issue</a>
  'g'     :
    'c'   : <a href="/rails/rails" data-hotkey="g c">Code</a>
    'i'   : <a href="/rails/rails/issues" data-hotkey="g i">Issues</a>

So both `g c` and `c` could be available hotkeys on the same
page, but `g c` and `g` couldn't coexist. If the user presses
`g`, the `c` hotkey will be unavailable for 1500ms while we
listen for either `g c` or `g i`.

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
for (const el of document.querySelector('[data-hotkey]')) {
  install(el)
}
```

## Development

```
npm install
npm test
```

## License

Distributed under the MIT license. See LICENSE for details.
