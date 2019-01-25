/* @flow strict */

import {Leaf, RadixTrie} from './radix-trie'
import {fireDeterminedAction, expandHotkeyToEdges, isFormField} from './utils'
import hotkey from './hotkey'

const hotkeyRadixTrie = new RadixTrie()
const elementsLeaves = new WeakMap()

let currentTriePosition = hotkeyRadixTrie
let resetTriePositionTimer = null
function resetTriePosition() {
  resetTriePositionTimer = null
  currentTriePosition = hotkeyRadixTrie
}

document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.target instanceof Node && isFormField(event.target)) return

  if (resetTriePositionTimer != null) {
    clearTimeout(resetTriePositionTimer)
  }
  resetTriePositionTimer = setTimeout(resetTriePosition, 1500)

  // If the user presses a hotkey that doesn't exist in the Trie,
  // they've pressed a wrong key-combo and we should reset the flow
  const newTriePosition = currentTriePosition.get(hotkey(event))
  if (!newTriePosition) {
    resetTriePosition()
    return
  }

  currentTriePosition = newTriePosition
  if (newTriePosition instanceof Leaf) {
    fireDeterminedAction(newTriePosition.children[newTriePosition.children.length - 1])
    event.preventDefault()
    resetTriePosition()
    return
  }
})

export {RadixTrie, Leaf}

export function install(element: HTMLElement, hotkey?: string) {
  const hotkeys = expandHotkeyToEdges(hotkey || element.getAttribute('data-hotkey') || '')
  const leaves = hotkeys.map(hotkey => hotkeyRadixTrie.insert(hotkey).add(element))
  elementsLeaves.set(element, leaves)
}

export function uninstall(element: HTMLElement) {
  const leaves = elementsLeaves.get(element)
  if (leaves && leaves.length) {
    for (const leaf of leaves) {
      leaf && leaf.delete(element)
    }
  }
}
